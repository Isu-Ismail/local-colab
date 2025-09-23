const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const wss = new WebSocketServer({ port: 8080 });
console.log('WebSocket server started on port 8080');

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', message => {
    const { code, inputs, userId } = JSON.parse(message.toString());
    console.log('Received code to execute');

    const uniqueId = crypto.randomUUID();
    const tempFilePath = path.join(tempDir, `${uniqueId}.py`);
    fs.writeFileSync(tempFilePath, code);
    
    const userUploadDir = path.resolve(__dirname, 'uploads', userId);
    
    const dockerArgs = [
      'run',
      '--rm',
      '-i',
      '--network', 'none',
      '--memory=256m',
      '--cpus=0.5',
      // CHANGE 1: Set the working directory to where the user files are.
      '--workdir', '/data',
      '-v', `${path.resolve(tempFilePath)}:/app/script.py:ro`,
      '-v', `${userUploadDir}:/data:ro`,
      'python-runner',
      // CHANGE 2: Use the full path to the script, since we are no longer in the /app directory.
      'python', '/app/script.py'
    ];

    const dockerProcess = spawn('docker', dockerArgs);
    const timeout = setTimeout(() => { /* ... */ }, 10000);

    // --- DEBUGGING LOGS ADDED HERE ---
    dockerProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[STDOUT]: ${output}`); // Log what we get from stdout
      ws.send(output);
    });

    dockerProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      console.error(`[STDERR]: ${errorOutput}`); // Log what we get from stderr
      ws.send(errorOutput);
    });
    
    dockerProcess.on('close', (code) => {
      clearTimeout(timeout);
      fs.unlinkSync(tempFilePath);
      console.log(`Docker process exited with code ${code}`);
    });

    if (inputs) {
      dockerProcess.stdin.write(inputs);
    }
    dockerProcess.stdin.end();
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
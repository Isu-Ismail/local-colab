const { WebSocketServer } = require('ws');
const { spawn } = require('child_process'); // Use spawn instead of exec
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
    const { code, inputs } = JSON.parse(message.toString());
    console.log('Received code to execute');

    const uniqueId = crypto.randomUUID();
    
    const tempFilePath = path.join(tempDir, `${uniqueId}.py`);
    fs.writeFileSync(tempFilePath, code);

    // Arguments are now passed as an array, which is safer
    const dockerArgs = [
      'run',
      '--rm',
      '-i',
      '--network', 'none',
      '--memory=256m',
      '--cpus=0.5',
      '-v', `${path.resolve(tempFilePath)}:/app/script.py:ro`,
      'python-runner',
      'python', 'script.py'
    ];

    const dockerProcess = spawn('docker', dockerArgs);

    // Set a timeout to kill the process
    const timeout = setTimeout(() => {
      dockerProcess.kill('SIGTERM'); // Kill the Docker process
      ws.send('\nExecution timed out (10 seconds limit).');
      console.log('Process killed due to timeout');
    }, 10000); // 10 seconds

    // Stream the output (stdout) back to the client
    dockerProcess.stdout.on('data', (data) => {
      ws.send(data.toString());
    });

    // Stream any errors (stderr) back to the client
    dockerProcess.stderr.on('data', (data) => {
      ws.send(data.toString());
    });

    // When the process finishes, clean up
    dockerProcess.on('close', (code) => {
      clearTimeout(timeout); // Clear the timeout timer
      fs.unlinkSync(tempFilePath); // Delete the temporary file
      console.log(`Docker process exited with code ${code}`);
    });

    // Pipe the predefined inputs to the container's stdin
    if (inputs) {
      dockerProcess.stdin.write(inputs);
    }
    dockerProcess.stdin.end();
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
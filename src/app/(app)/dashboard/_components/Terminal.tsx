'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css'; // Import the CSS for xterm.js
import { API_ENDPOINTS } from '@/config/api';

export default function TerminalComponent() {
  const termRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!termRef.current || ws.current) return;

    // 1. Initialize xterm.js
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#202124',
        foreground: '#e0e0e0',
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(termRef.current);
    fitAddon.fit();

    // 2. Establish WebSocket connection
    ws.current = new WebSocket(API_ENDPOINTS.execution.websocket);

    ws.current.onopen = () => {
      term.write('Connected to server...\r\n');
    };

    // 3. Pipe data from WebSocket to xterm.js (Server -> Browser)
    ws.current.onmessage = (event) => {
      term.write(event.data);
    };

    // 4. Pipe data from xterm.js to WebSocket (Browser -> Server)
    term.onData(data => {
      ws.current?.send(data);
    });

    ws.current.onclose = () => {
      term.write('\r\nConnection closed.');
    };

    return () => {
      ws.current?.close();
      term.dispose();
    };
  }, []);

  return <div ref={termRef} style={{ width: '100%', height: '400px' }} />;
}
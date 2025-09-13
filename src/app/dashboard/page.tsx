'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import CodeCell from './_components/CodeCell';
import Header from './_components/Header'; // Assuming Header is your Navbar component
import styles from './Dashboard.module.css';
import { API_ENDPOINTS } from '@/config/api'; // 1. Import the new config

// Interfaces
interface Cell {
  id: string;
  content: string;
  output?: string;
}
interface NotebookContent {
  cells: Omit<Cell, 'output'>[];
}

export default function DashboardPage() {
  const [cells, setCells] = useState<Cell[]>([
    { id: uuidv4(), content: '# Your first cell!\nprint("Hello, World!")', output: '' }
  ]);
  const [notebookTitle, setNotebookTitle] = useState("Untitled Notebook");
  const ws = useRef<WebSocket | null>(null);
  const runningCellId = useRef<string | null>(null);

  useEffect(() => {
    // 2. Use the WebSocket URL from the config file
    ws.current = new WebSocket(API_ENDPOINTS.execution.websocket);
    
    ws.current.onopen = () => console.log('WebSocket connected');
    ws.current.onmessage = (event) => {
      if (runningCellId.current) {
        setCells(prevCells =>
          prevCells.map(cell =>
            cell.id === runningCellId.current
              ? { ...cell, output: (cell.output || '') + event.data }
              : cell
          )
        );
      }
    };
    return () => ws.current?.close();
  }, []);

  const handleCodeChange = (id: string, value: string) => {
    setCells(prevCells =>
      prevCells.map(cell => (cell.id === id ? { ...cell, content: value } : cell))
    );
  };

  const handleRunCode = (cell: Cell) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      runningCellId.current = cell.id;
      setCells(prevCells =>
        prevCells.map(c => (c.id === cell.id ? { ...c, output: '' } : c))
      );
      ws.current.send(JSON.stringify({ code: cell.content, inputs: '' }));
    }
  };

  const addCell = () => {
    setCells(prev => [...prev, { id: uuidv4(), content: '# New cell', output: '' }]);
  };

  const handleDeleteCell = (idToDelete: string) => {
    setCells(prev => prev.filter(cell => cell.id !== idToDelete));
  };

  const handleClearOutput = (idToClear: string) => {
    setCells(prev =>
      prev.map(cell => (cell.id === idToClear ? { ...cell, output: '' } : cell))
    );
  };

  // 3. Fully implemented save function using the config file
  const saveNotebook = async () => {
    const contentToSave: NotebookContent = {
      cells: cells.map(({ id, content }) => ({ id, content })),
    };
    try {
      const response = await fetch(API_ENDPOINTS.notebooks.save, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notebookTitle,
          content: contentToSave,
        }),
      });
      if (!response.ok) throw new Error('Failed to save notebook');
      const savedNotebook = await response.json();
      alert(`Notebook "${savedNotebook.title}" saved successfully!`);
    } catch (error) {
      console.error(error);
      alert('Error saving notebook.');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <Header
        notebookTitle={notebookTitle}
        setNotebookTitle={setNotebookTitle}
        onSaveNotebook={saveNotebook}
        onAddCell={addCell}
        // Note: The callbackUrl is a frontend route, not a backend API endpoint,
        // so we still use the direct path. Changed to '/' after our refactor.
        onSignOut={() => signOut({ callbackUrl: '/' })}
      />
      <main className={styles.mainContent}>
        {cells.map(cell => (
          <CodeCell
            key={cell.id}
            cell={cell}
            onCodeChange={handleCodeChange}
            onRunCode={handleRunCode}
            onDeleteCell={handleDeleteCell}
            onClearOutput={handleClearOutput}
          />
        ))}
      </main>
    </div>
  );
}
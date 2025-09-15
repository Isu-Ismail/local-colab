'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import CodeCell from './_components/CodeCell';
import Header from './_components/Header';
import styles from './Dashboard.module.css';
import { API_ENDPOINTS } from '@/config/api';

// --- TYPE DEFINITIONS ---
interface Cell {
  id: string;
  content: string;
  output?: string;
}
interface NotebookContent {
  cells: Omit<Cell, 'output'>[];
}
interface NotebookInfo {
  id: string;
  title: string;
}

export default function DashboardClient() {
  const { data: session } = useSession();
  const [cells, setCells] = useState<Cell[]>([
    { id: uuidv4(), content: '# Welcome! Click File > New Notebook to start.', output: '' }
  ]);
  const [notebookTitle, setNotebookTitle] = useState("Untitled Notebook");
  const [notebooks, setNotebooks] = useState<NotebookInfo[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const runningCellId = useRef<string | null>(null);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(API_ENDPOINTS.execution.websocket);
    ws.current.onopen = () => console.log('WebSocket connected');
    ws.current.onmessage = (event) => {
      if (runningCellId.current) {
        setCells(prev => prev.map(cell =>
          cell.id === runningCellId.current ? { ...cell, output: (cell.output || '') + event.data } : cell
        ));
      }
    };
    return () => {
      ws.current?.close();
    };
  }, []);

  const fetchNotebooks = async () => {
    const response = await fetch('/api/notebooks');
    if (response.ok) setNotebooks(await response.json());
  };

  const handleLoadNotebook = async (id: string) => {
    const response = await fetch(`/api/notebooks/${id}`);
    if (response.ok) {
      const data = await response.json();
      setNotebookTitle(data.title);
      setCells(data.content.cells || []);
      setActiveNotebookId(data.id);
    }
  };

  const handleNewNotebook = () => {
    setCells([{ id: uuidv4(), content: '# New Notebook', output: '' }]);
    setNotebookTitle("Untitled Notebook");
    setActiveNotebookId(null);
  };

  const saveNotebook = async () => {
    const isUpdating = activeNotebookId !== null;
    const url = isUpdating ? `/api/notebooks/${activeNotebookId}` : API_ENDPOINTS.notebooks.save;
    const method = isUpdating ? 'PUT' : 'POST';
    const contentToSave: NotebookContent = {
      cells: cells.map(({ id, content }) => ({ id, content })),
    };
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: notebookTitle, content: contentToSave }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save notebook');
      }
      alert(`Notebook "${notebookTitle}" saved successfully!`);
      fetchNotebooks();
      if (!isUpdating) {
        const savedNotebook = await response.json();
        setActiveNotebookId(savedNotebook.id);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCodeChange = (id: string, value: string) => {
    setCells(prev => prev.map(cell => (cell.id === id ? { ...cell, content: value } : cell)));
  };

  const handleRunCode = (cell: Cell, inputs: string) => {
    if (ws.current?.readyState === WebSocket.OPEN && session?.user?.id) {
      runningCellId.current = cell.id;
      setCells(prev => prev.map(c => (c.id === cell.id ? { ...c, output: '' } : c)));
      ws.current.send(JSON.stringify({
        code: cell.content,
        inputs: inputs,
        userId: session.user.id
      }));
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

  return (
    <div className={styles.dashboardContainer}>
      {/* The onToggleFileMenu prop is now removed */}
      <Header
        notebookTitle={notebookTitle}
        setNotebookTitle={setNotebookTitle}
        onSaveNotebook={saveNotebook}
        onAddCell={addCell}
        onSignOut={() => signOut({ callbackUrl: '/' })}
        notebooks={notebooks}
        onLoadNotebook={handleLoadNotebook}
        onNewNotebook={handleNewNotebook}
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
'use client';

import { useState, useEffect, useRef } from 'react';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import styles from './CodeCell.module.css';

const CopyIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> );
const DeleteIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> );
const MoreVertIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg> );

interface Cell { id: string; content: string; output?: string; }
interface CodeCellProps {
  cell: Cell;
  onCodeChange: (id: string, value: string) => void;
  onRunCode: (cell: Cell, inputs: string) => void;
  onDeleteCell: (id: string) => void;
  onClearOutput: (id: string) => void;
}

const MIN_EDITOR_HEIGHT = 22;

export default function CodeCell({ cell, onCodeChange, onRunCode, onDeleteCell, onClearOutput }: CodeCellProps) {
  const [editorHeight, setEditorHeight] = useState(MIN_EDITOR_HEIGHT);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputs, setInputs] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    loader.init().then(monaco => {
      monaco.editor.defineTheme('colab-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: { 'editor.background': '#00000000', 'editor.focusBorder': '#00000000' },
      });
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.onDidContentSizeChange(() => {
      setEditorHeight(Math.max(MIN_EDITOR_HEIGHT, editor.getContentHeight()));
    });
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(cell.content);
      alert('Cell content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy content: ', err);
      alert('Could not copy content.');
    } finally {
      setIsMenuOpen(false);
    }
  };
  
  const handleClearOutput = () => {
    onClearOutput(cell.id);
    setIsMenuOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
      setUploadStatus(`Selected: ${e.target.files[0].name}`);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload) return;
    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', fileToUpload);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await response.json();
    setUploadStatus(response.ok ? `Success: "${data.filename}" ready.` : `Error: ${data.error}`);
    setFileToUpload(null);
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.cellWrapper}>
      <div className={styles.cellContainer}>
        <div className={styles.runButtonContainer}>
          <button className={styles.runButton} onClick={() => onRunCode(cell, inputs)}>
            ▶
          </button>
        </div>
        <div className={styles.editorContainer}>
          <Editor
            height={editorHeight}
            language="python"
            theme="colab-dark"
            value={cell.content}
            onChange={(value) => onCodeChange(cell.id, value || '')}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              folding: false,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
              overviewRulerLanes: 0,
              glyphMargin:false,
            }}
          />
        </div>
        <div className={styles.cellToolbar}>
          <button className={styles.toolbarButton} title="Copy cell" onClick={handleCopyContent}><CopyIcon /></button>
          <button className={styles.toolbarButton} title="Delete cell" onClick={() => onDeleteCell(cell.id)}><DeleteIcon /></button>
          <div className={styles.menuContainer} ref={menuRef}>
            <button className={styles.toolbarButton} title="More options" onClick={() => setIsMenuOpen(!isMenuOpen)}><MoreVertIcon /></button>
            {isMenuOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.menuItem} onClick={handleCopyContent}>Copy cell content</button>
                <button className={styles.menuItem} onClick={handleClearOutput}>Clear output</button>
                <div className={styles.dropdownDivider}></div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  style={{ display: 'none' }} 
                />
                <button className={styles.menuItem} onClick={() => fileInputRef.current?.click()}>
                  Upload File
                </button>
                {fileToUpload && (
                  <div className={styles.uploadStatusArea}>
                    <span>{uploadStatus}</span>
                    <button onClick={handleUpload} className={styles.uploadConfirmButton}>Confirm Upload</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* --- This section was incorrectly placed outside the cellWrapper --- */}
      {/* --- It has been moved inside and simplified --- */}
      
      {cell.content.includes('input(') && (
        <textarea
          value={inputs}
          onChange={(e) => setInputs(e.target.value)}
          placeholder="Enter inputs here, one per line..."
          className={styles.inputArea}
        />
      )}
      
      {cell.output && (
        <div className={styles.outputArea}>
          <pre>{cell.output}</pre>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useRef, useEffect } from 'react';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import styles from './CodeCell.module.css';

// --- (Icons remain the same) ---
const CopyIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> );
const DeleteIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> );
const MoreVertIcon = () => ( <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg> );


// --- (Interfaces remain the same) ---
interface Cell { id: string; content: string; output?: string; }
interface CodeCellProps { cell: Cell; onCodeChange: (id: string, value: string) => void; onRunCode: (cell: Cell) => void; onDeleteCell: (id: string) => void; onClearOutput: (id: string) => void; }

const MIN_EDITOR_HEIGHT = 22;

export default function CodeCell({ cell, onCodeChange, onRunCode, onDeleteCell, onClearOutput }: CodeCellProps) {
  const [editorHeight, setEditorHeight] = useState(MIN_EDITOR_HEIGHT);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // *** NEW: Define a custom theme for Monaco Editor ***
  useEffect(() => {
    loader.init().then(monaco => {
      monaco.editor.defineTheme('colab-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          // This makes the editor background transparent
          'editor.background': '#00000000', 
        },
      });
    });
  }, []);

  // (The rest of the component logic remains the same)
  useEffect(() => {
    loader.init().then(monaco => {
      monaco.editor.defineTheme('colab-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#00000000',
          // ADD THIS LINE: This sets the focus border to be transparent
          'editor.focusBorder': '#00000000',
        },
      });
    });
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.onDidContentSizeChange(() => {
      const contentHeight = editor.getContentHeight();
      setEditorHeight(Math.max(MIN_EDITOR_HEIGHT, contentHeight));
    });
  };

  const handleCopyContent = async () => {
    await navigator.clipboard.writeText(cell.content);
    setIsMenuOpen(false);
  };
  
  const handleClearOutput = () => {
    onClearOutput(cell.id);
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.cellWrapper}>
      <div className={styles.cellContainer}>
        <div className={styles.runButtonContainer}>
          <div className={styles.cellExecution}>[ ]</div>
          <button className={styles.runButton} onClick={() => onRunCode(cell)}>
            ▶
          </button>
        </div>

        <div className={styles.editorContainer}>
          <Editor
            height={editorHeight}
            language="python"
            theme="colab-dark" // <-- Use our new custom theme
            value={cell.content}
            onChange={(value) => onCodeChange(cell.id, value || '')}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'off',
              folding: false,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
              overviewRulerLanes: 0,
            }}
          />
        </div>
        
        <div className={styles.cellToolbar}>
          {/* Toolbar JSX remains the same */}
          <button className={styles.toolbarButton} title="Copy cell" onClick={handleCopyContent}><CopyIcon /></button>
          <button className={styles.toolbarButton} title="Delete cell" onClick={() => onDeleteCell(cell.id)}><DeleteIcon /></button>
          <div className={styles.menuContainer} ref={menuRef}>
            <button className={styles.toolbarButton} title="More options" onClick={() => setIsMenuOpen(!isMenuOpen)}><MoreVertIcon /></button>
            {isMenuOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.menuItem} onClick={handleCopyContent}>Copy cell content</button>
                <button className={styles.menuItem} onClick={handleClearOutput}>Clear output</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {cell.output && (
        <div className={styles.outputArea}>
          <pre>{cell.output}</pre>
        </div>
      )}
    </div>
  );
}
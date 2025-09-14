'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Header.module.css';

// Interface for the notebook list
interface NotebookInfo {
  id: string;
  title: string;
}

interface HeaderProps {
  notebookTitle: string;
  setNotebookTitle: (title: string) => void;
  onSaveNotebook: () => void;
  onAddCell: () => void;
  onSignOut: () => void;
  notebooks: NotebookInfo[];
  onLoadNotebook: (id: string) => void;
  onNewNotebook: () => void;
}

export default function Header({
  notebookTitle,
  setNotebookTitle,
  onSaveNotebook,
  onAddCell,
  onSignOut,
  notebooks,
  onLoadNotebook,
  onNewNotebook
}: HeaderProps) {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuItems = ['Edit', 'View', 'Insert', 'Runtime', 'Tools', 'Help'];

  // Effect to handle "click away to close" dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsFileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleLoad = (id: string) => {
    onLoadNotebook(id);
    setIsFileMenuOpen(false);
  };

  const handleNew = () => {
    onNewNotebook();
    setIsFileMenuOpen(false);
  };

  return (
    <div className={styles.headerContainer}>
      {/* 1. Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.leftSection}>
          <div className={styles.logo}></div>
          <input
            type="text"
            value={notebookTitle}
            onChange={(e) => setNotebookTitle(e.target.value)}
            className={styles.titleInput}
          />
        </div>
        <div className={styles.rightSection}>
          <button onClick={onSignOut} className={styles.signOutButton}>
            Sign Out
          </button>
          <div className={styles.userIcon}>U</div>
        </div>
      </div>

      {/* 2. Menu Bar */}
      <div className={styles.menuBar}>
        <div className={styles.fileMenuContainer} ref={menuRef}>
          <button onClick={() => setIsFileMenuOpen(!isFileMenuOpen)} className={styles.menuButton}>
            File
          </button>
          {isFileMenuOpen && (
            <div className={styles.dropdownMenu}>
              <button onClick={handleNew} className={styles.dropdownItem}>+ New Notebook</button>
              <div className={styles.dropdownDivider}></div>
              <div className={styles.dropdownHeader}>Open recent</div>
              {notebooks.map(nb => (
                <button key={nb.id} onClick={() => handleLoad(nb.id)} className={styles.dropdownItem}>
                  {nb.title}
                </button>
              ))}
            </div>
          )}
        </div>
        {menuItems.map((item) => (
          <button key={item} className={styles.menuButton}>{item}</button>
        ))}
        <button onClick={onSaveNotebook} className={styles.menuButton}>Save</button>
      </div>
      
      {/* 3. Toolbar */}
      <div className={styles.toolbar}>
        <button onClick={onAddCell} className={styles.toolbarButton}>
          <span>+</span>
          <span>Code</span>
        </button>
        <button className={styles.toolbarButton}>
          <span>+</span>
          <span>Text</span>
        </button>
        <div className={styles.spacer}></div>
        <button className={styles.toolbarButton}>
          <span>▶</span>
          <span>Run all</span>
        </button>
      </div>
    </div>
  );
}
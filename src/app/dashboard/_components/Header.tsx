// Header.tsx
'use client';
import styles from './Header.module.css'; // Import the CSS module

interface HeaderProps {
  notebookTitle: string;
  setNotebookTitle: (title: string) => void;
  onSaveNotebook: () => void;
  onAddCell: () => void;
  onSignOut: () => void;
}

export default function Header({
  notebookTitle,
  setNotebookTitle,
  onSaveNotebook,
  onAddCell,
  onSignOut,
}: HeaderProps) {
  const menuItems = ['File', 'Edit', 'View', 'Insert', 'Runtime', 'Tools', 'Help'];

  return (
    <div className={styles.headerContainer}>
      {/* 1. Top Bar: Logo, File Name, Sign Out */}
      <div className={styles.topBar}>
        <div className={styles.leftSection}>
          <div className={styles.logo}></div> {/* Placeholder for Logo */}
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
          <div className={styles.userIcon}>U</div> {/* Placeholder */}
        </div>
      </div>

      {/* 2. Menu Bar: File, Edit, View, etc. */}
      <div className={styles.menuBar}>
        {menuItems.map((item) => (
          <button key={item} className={styles.menuButton}>
            {item}
          </button>
        ))}
        {/* Your Save button, styled as a menu item */}
        <button onClick={onSaveNotebook} className={styles.menuButton}>
          Save
        </button>
      </div>

      {/* 3. Toolbar: +Code, +Text, etc. */}
      <div className={styles.toolbar}>
        <button onClick={onAddCell} className={styles.toolbarButton}>
          <span>+</span>
          <span>Code</span>
        </button>
        <button className={styles.toolbarButton}>
          <span>+</span>
          <span>Text</span>
        </button>
        <div className={styles.spacer}></div> {/* This pushes "Run all" to the right */}
        <button className={styles.toolbarButton}>
          <span>▶</span>
          <span>Run all</span>
        </button>
      </div>
    </div>
  );
}
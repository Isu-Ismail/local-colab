'use client';
import styles from './FileMenu.module.css';

interface NotebookInfo {
  id: string;
  title: string;
}

interface FileMenuProps {
  notebooks: NotebookInfo[];
  onLoadNotebook: (id: string) => void;
  onNewNotebook: () => void;
  onClose: () => void;
}

export default function FileMenu({ notebooks, onLoadNotebook, onNewNotebook, onClose }: FileMenuProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>File Menu</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <button onClick={onNewNotebook} className={styles.newButton}>+ New Notebook</button>
        <ul className={styles.notebookList}>
          {notebooks.map(nb => (
            <li key={nb.id} onClick={() => onLoadNotebook(nb.id)}>
              {nb.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
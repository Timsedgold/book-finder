import React from 'react';
import styles from './Modal.module.css'; // We'll create this CSS Module next

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  // Close modal if overlay is clicked, but not if content is clicked
  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (e) => {
    e.stopPropagation(); // Prevent click from bubbling up to overlay
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={handleContentClick}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">&times;</button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
}
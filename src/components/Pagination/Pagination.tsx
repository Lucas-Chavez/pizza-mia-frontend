import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    
    // Siempre mostrar la primera página
    pages.push(0);
    
    // Calcular rango alrededor de la página actual
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    
    // Añadir elipsis después de la primera página si es necesario
    if (start > 1) {
      pages.push(-1); // -1 representa elipsis
    }
    
    // Añadir páginas alrededor de la página actual
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Añadir elipsis antes de la última página si es necesario
    if (end < totalPages - 2) {
      pages.push(-2); // -2 representa elipsis
    }
    
    // Siempre mostrar la última página si hay más de 1 página
    if (totalPages > 1) {
      pages.push(totalPages - 1);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className={styles.pageButton}
      >
        &laquo;
      </button>
      
      {getPageNumbers().map((page, index) => {
        if (page < 0) {
          // Renderizar elipsis
          return <span key={`elipsis-${index}`} className={styles.ellipsis}>...</span>;
        }
        
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
          >
            {page + 1}
          </button>
        );
      })}
      
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className={styles.pageButton}
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
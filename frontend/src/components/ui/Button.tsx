import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  withArrow?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  withArrow = false,
  className = '',
  ...props 
}: ButtonProps) {
  const rootClass = `${styles.button} ${styles[variant]} ${className}`.trim();

  return (
    <button className={rootClass} {...props}>
      {children}
      {withArrow && (
        <svg 
          className={styles.icon} 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      )}
    </button>
  );
}

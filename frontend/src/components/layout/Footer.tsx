import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}></span>
              Epos
            </Link>
            <p className={styles.tagline}>
              The social payment layer for Nigeria&apos;s informal economy. Send a request, get paid in seconds.
            </p>
          </div>
          
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <span className={styles.linkTitle}>Product</span>
              <Link href="#how-it-works" className={styles.linkItem}>How it works</Link>
              <Link href="#features" className={styles.linkItem}>Features</Link>
              <Link href="#creators" className={styles.linkItem}>For Creators</Link>
            </div>
            
            <div className={styles.linkGroup}>
              <span className={styles.linkTitle}>Connect</span>
              <a href="#" className={styles.linkItem}>Twitter / X</a>
              <a href="#" className={styles.linkItem}>Discord</a>
              <a href="#" className={styles.linkItem}>Contact Us</a>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Epos. Built on Base L2.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="#" className={styles.linkItem}>Privacy</Link>
            <Link href="#" className={styles.linkItem}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

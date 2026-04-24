import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <header className={`${styles.header} animate-fade-in`}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}></span>
          Epos
        </Link>
        
        <div className={styles.links}>
          <Link href="/#how-it-works" className={styles.link}>How it works</Link>
          <Link href="/feed" className={styles.link}>Community Feed</Link>
          <Link href="/sarahm" className={styles.link}>Demo Profile</Link>
        </div>

        <Link href="/dashboard" passHref>
          <Button variant="secondary">
            Connect Wallet
          </Button>
        </Link>
      </nav>
    </header>
  );
}

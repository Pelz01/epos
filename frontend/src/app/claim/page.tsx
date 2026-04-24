"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Claim.module.css';
import { Button } from '@/components/ui/Button';

export default function ClaimPage() {
  const [handle, setHandle] = useState('');

  // Mock validation logic
  const isTooShort = handle.length > 0 && handle.length < 3;
  const isTaken = handle.toLowerCase() === 'sarahm' || handle.toLowerCase() === 'davido';
  const isAvailable = handle.length >= 3 && !isTaken;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        
        <h1 className={styles.title}>Claim Your Identity</h1>
        <p className={styles.subtitle}>
          Your Epos handle is your permanent onchain identity. No bank or fintech app can take it away.
        </p>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.inputWrapper}>
            <span className={styles.atSymbol}>@</span>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="username" 
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              maxLength={15}
            />
          </div>

          {handle.length > 0 && (
            <div className={`${styles.status} ${isAvailable ? styles.statusAvailable : styles.statusTaken}`}>
              {isTooShort && "Handle must be at least 3 characters."}
              {isTaken && "This handle is already taken."}
              {isAvailable && "This handle is available!"}
            </div>
          )}

          <Button 
            variant="primary" 
            style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem' }}
            disabled={!isAvailable}
          >
            Mint Handle on Base
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account? <Link href="/dashboard">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

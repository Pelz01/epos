import React from 'react';
import styles from './Features.module.css';

export function Features() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why Epos?</h2>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Zero Wahala with Naira</h3>
            <p className={styles.cardDesc}>
              Stop worrying about inflation. Receive and hold your funds in USDC. Stable, reliable, and immune to local currency devaluation.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Your Permanent Identity</h3>
            <p className={styles.cardDesc}>
              Claim your unique @handle onchain. It belongs to you forever—no bank can freeze it, no fintech app can take it away.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3 className={styles.cardTitle}>No Agent Fees</h3>
            <p className={styles.cardDesc}>
              Skip the POS machine charges and bank transfer fees. With Epos on Base L2, receiving money is virtually free. You keep 100% of what you're sent.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Built for the Culture</h3>
            <p className={styles.cardDesc}>
              Epos isn't built for bankers, it's built for you. From students needing urgent funds to creators collecting tips—this is social finance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

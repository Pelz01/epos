import React from 'react';
import styles from './HowItWorks.module.css';

export function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>How It Works</h2>
          <p className={styles.subtitle}>
            Getting paid shouldn&apos;t feel like filling out a tax form. Epos is built for the culture—fast, simple, and social.
          </p>
        </div>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <h3 className={styles.stepTitle}>1. Create a Request</h3>
            <p className={styles.stepDesc}>
              Set an amount and tell them what it&apos;s for. Whether it&apos;s data subscription, transport fare, or just weekend vibes. Keep it casual.
            </p>
          </div>

          <div className={styles.step}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </div>
            <h3 className={styles.stepTitle}>2. Share Anywhere</h3>
            <p className={styles.stepDesc}>
              Drop your custom Epos link in the WhatsApp group chat, your Twitter bio, or send it straight to the DM. It works wherever you are.
            </p>
          </div>

          <div className={styles.step}>
            <div className={styles.iconWrapper}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3 className={styles.stepTitle}>3. Get Paid Instantly</h3>
            <p className={styles.stepDesc}>
              Funds land directly in your wallet as USDC. Zero agent fees, zero bank delays, and zero Naira inflation wahala. You keep 100%.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

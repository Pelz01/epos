import React from 'react';
import Link from 'next/link';
import styles from './Dashboard.module.css';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}></span>
          Epos
        </Link>
        
        <nav className={styles.nav}>
          <Link href="/dashboard" className={`${styles.navItem} ${styles.navItemActive}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </Link>
          <Link href="/feed" className={styles.navItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Requests
          </Link>
          <Link href="/johndoe" className={styles.navItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Public Profile
          </Link>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Welcome back, @johndoe</h1>
          <Button variant="secondary">0x1234...ABCD</Button>
        </header>

        <div className={styles.grid}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Total Received</h2>
              <div className={styles.balance}>$145.00</div>
              <div className={styles.balanceLabel}>USDC on Base</div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Recent Payments</h2>
              <div className={styles.historyList}>
                <div className={styles.historyItem}>
                  <div>
                    <div className={styles.historyDesc}>Dinner with friends</div>
                    <div className={styles.historyDate}>Today, 2:45 PM</div>
                  </div>
                  <div className={styles.historyAmount}>+$25.00</div>
                </div>
                <div className={styles.historyItem}>
                  <div>
                    <div className={styles.historyDesc}>Transport Fare</div>
                    <div className={styles.historyDate}>Yesterday</div>
                  </div>
                  <div className={styles.historyAmount}>+$10.00</div>
                </div>
                <div className={styles.historyItem}>
                  <div>
                    <div className={styles.historyDesc}>Tip from @mary</div>
                    <div className={styles.historyDate}>May 12, 2026</div>
                  </div>
                  <div className={styles.historyAmount}>+$5.00</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Create New Request</h2>
            <form className={styles.requestForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Reason</label>
                <input type="text" className={styles.input} placeholder="e.g., Weekend vibes" />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Amount (Optional)</label>
                <div className={styles.amountInputWrapper}>
                  <span className={styles.currencySymbol}>$</span>
                  <input type="number" className={styles.amountInput} placeholder="0.00" />
                </div>
              </div>
              
              <Button variant="primary" style={{ width: '100%', marginTop: '1rem' }}>
                Generate Link
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

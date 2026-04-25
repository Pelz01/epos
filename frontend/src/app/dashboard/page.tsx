import React from 'react';
import Link from 'next/link';
import styles from './Dashboard.module.css';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layout/AppLayout';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Welcome back, @johndoe</h1>
            <p className={styles.subtitle}>Here is what's happening with your account.</p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="secondary">Copy Profile Link</Button>
            <Button variant="ghost">0x1234...ABCD</Button>
          </div>
        </header>

        <div className={styles.grid}>
          <div className={styles.mainCol}>
            <div className={`${styles.card} ${styles.walletCard} glass-panel`}>
              <div className={styles.walletHeader}>
                <h2 className={styles.cardTitle}>Total USDC Balance</h2>
                <span className={styles.networkBadge}>Base Network</span>
              </div>
              <div className={styles.balanceContainer}>
                <div className={styles.balance}>$145.00</div>
                <div className={styles.nairaEst}>≈ ₦217,500</div>
              </div>
              <div className={styles.walletActions}>
                <Button variant="primary" className={styles.cashOutBtn}>Cash Out (Naira)</Button>
                <Button variant="secondary">Deposit</Button>
              </div>
            </div>

            <div className={`${styles.card} glass-panel`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Recent Activity</h2>
                <Link href="#" className={styles.viewAll}>View all</Link>
              </div>
              <div className={styles.historyList}>
                <div className={styles.historyItem}>
                  <div className={styles.historyItemLeft}>
                    <div className={styles.historyAvatar} style={{ background: 'linear-gradient(135deg, #FF6B6B, #FFE66D)' }}></div>
                    <div>
                      <div className={styles.historyDesc}>Received from <strong>@mary</strong></div>
                      <div className={styles.historyMsg}>"For the weekend vibes!"</div>
                      <div className={styles.historyDate}>Today, 2:45 PM</div>
                    </div>
                  </div>
                  <div className={styles.historyAmount}>+$25.00</div>
                </div>
                <div className={styles.historyItem}>
                  <div className={styles.historyItemLeft}>
                    <div className={styles.historyAvatar} style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}></div>
                    <div>
                      <div className={styles.historyDesc}>Sent to <strong>@james</strong></div>
                      <div className={styles.historyMsg}>"Happy birthday!"</div>
                      <div className={styles.historyDate}>Yesterday</div>
                    </div>
                  </div>
                  <div className={`${styles.historyAmount} ${styles.amountSent}`}>-$10.00</div>
                </div>
                <div className={styles.historyItem}>
                  <div className={styles.historyItemLeft}>
                    <div className={styles.historyAvatar} style={{ background: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' }}></div>
                    <div>
                      <div className={styles.historyDesc}>Received from <strong>@sarah</strong></div>
                      <div className={styles.historyMsg}>"Sapa be gone"</div>
                      <div className={styles.historyDate}>May 12, 2026</div>
                    </div>
                  </div>
                  <div className={styles.historyAmount}>+$5.00</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sideCol}>
            <div className={`${styles.card} glass-panel`}>
              <h2 className={styles.cardTitle}>Create Request</h2>
              <p className={styles.requestDesc}>Ask your community for support.</p>
              <form className={styles.requestForm}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>What's the request?</label>
                  <input type="text" className={styles.input} placeholder="e.g., Laptop repair fund" />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Amount (USDC)</label>
                  <div className={styles.amountInputWrapper}>
                    <span className={styles.currencySymbol}>$</span>
                    <input type="number" className={styles.amountInput} placeholder="0.00" />
                  </div>
                </div>
                
                <Button variant="primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Post Request
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


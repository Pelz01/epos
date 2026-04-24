import React from 'react';
import Link from 'next/link';
import styles from './Profile.module.css';
import { Button } from '@/components/ui/Button';

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  // Mock User Data based on username
  const cleanUsername = username.replace('%40', '').toLowerCase();
  
  return (
    <main className={styles.pageContainer}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${cleanUsername}&backgroundColor=e5e7eb`} alt={cleanUsername} />
          </div>
          <h1 className={styles.name}>{cleanUsername}</h1>
          <p className={styles.handle}>@{cleanUsername}</p>
          <p className={styles.bio}>
            Creating amazing content on YouTube. Every contribution goes toward new gear and studio time! 🎥✨
          </p>
        </div>

        <div className={styles.body}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Send Amount</label>
            <div className={styles.amountInputWrapper}>
              <span className={styles.currencySymbol}>$</span>
              <input type="number" className={styles.amountInput} placeholder="0" defaultValue="5" min="1" />
            </div>
            
            <div className={styles.quickAmounts}>
              <button className={styles.quickAmountBtn}>$2</button>
              <button className={styles.quickAmountBtn}>$5</button>
              <button className={styles.quickAmountBtn}>$10</button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Message (Optional)</label>
            <textarea className={styles.messageInput} placeholder="Say something nice..." />
          </div>

          <Button variant="primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
            Send USDC
          </Button>
        </div>
      </div>
      
      <p className={styles.footer}>
        Powered by <Link href="/" className={styles.footerLink}>Epos</Link>. The Onchain Payment Protocol.
      </p>
    </main>
  );
}

import React from 'react';
import Link from 'next/link';
import styles from './Profile.module.css';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layout/AppLayout';

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  // Mock User Data based on username
  const cleanUsername = username.replace('%40', '').toLowerCase();
  
  const wallOfLove = [
    { id: 1, sender: '@mary', amount: 50, message: "Keep up the great work! Love your videos.", time: "2h ago", color: "#FF6B6B" },
    { id: 2, sender: '@davido', amount: 15, message: "For the culture 🇳🇬", time: "1d ago", color: "#4facfe" },
    { id: 3, sender: 'Anonymous', amount: 5, message: "A small token of appreciation.", time: "3d ago", color: "#a18cd1" }
  ];

  return (
    <AppLayout>
      <div className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Public Profile</h1>
          <p className={styles.pageSubtitle}>This is how others see you when they visit your link.</p>
        </header>

        <div className={styles.profileGrid}>
          {/* Left column: Profile Card + Send Widget */}
          <div className={styles.profileCard}>
            <div className={`${styles.cardInner} glass-panel`}>
              <div className={styles.header}>
                <div className={styles.avatarWrapper}>
                  <div className={styles.avatar} style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
                  </div>
                </div>
                <h2 className={styles.name}>{cleanUsername}</h2>
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
                    <button className={styles.quickAmountBtn}>$50</button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Message (Optional)</label>
                  <textarea className={styles.messageInput} placeholder="Say something nice..." />
                </div>

                <Button variant="primary" className={styles.sendBtn}>
                  Send USDC
                </Button>
              </div>
            </div>
          </div>

          {/* Right column: Wall of Love + Stats */}
          <div className={styles.sideColumn}>
            <div className={`${styles.statsCard} glass-panel`}>
              <h3 className={styles.statsTitle}>Profile Stats</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>$70</div>
                  <div className={styles.statLabel}>Total Received</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>3</div>
                  <div className={styles.statLabel}>Supporters</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>Lv 3</div>
                  <div className={styles.statLabel}>Oga Level</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>#12</div>
                  <div className={styles.statLabel}>Leaderboard</div>
                </div>
              </div>
            </div>

            <div className={styles.wallOfLove}>
              <h3 className={styles.wallTitle}>Wall of Love 💖</h3>
              <div className={styles.wallList}>
                {wallOfLove.map(item => (
                  <div key={item.id} className={`${styles.wallItem} glass-panel`}>
                    <div className={styles.wallItemHeader}>
                      <div className={styles.wallSender}>
                        <div className={styles.wallAvatar} style={{ background: item.color }}></div>
                        <span className={styles.wallSenderName}>{item.sender}</span>
                      </div>
                      <div className={styles.wallAmount}>+${item.amount}</div>
                    </div>
                    {item.message && <p className={styles.wallMessage}>"{item.message}"</p>}
                    <div className={styles.wallTime}>{item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className={styles.footer}>
          Powered by <Link href="/" className={styles.footerLink}>Epos</Link>. The Onchain Payment Protocol.
        </p>
      </div>
    </AppLayout>
  );
}

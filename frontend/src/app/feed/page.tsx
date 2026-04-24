import React from 'react';
import Link from 'next/link';
import styles from './Feed.module.css';
import { Button } from '@/components/ui/Button';

export default function FeedPage() {
  const requests = [
    {
      id: 1,
      user: 'Sarah Mensah',
      handle: 'sarahm',
      reason: 'Need $15 for data subscription so I can finish uploading my latest YouTube video! 📹✨',
      amount: 15,
      raised: 5,
      time: '2h ago'
    },
    {
      id: 2,
      user: 'David O.',
      handle: 'davido',
      reason: 'Transport fare to the mainland for a job interview tomorrow morning. Anything helps! 🙏🏾',
      amount: 10,
      raised: 0,
      time: '5h ago'
    },
    {
      id: 3,
      user: 'Tech Sis Academy',
      handle: 'techsis',
      reason: 'Raising funds to buy a used laptop for one of our brightest coding students.',
      amount: 250,
      raised: 120,
      time: '1d ago'
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" style={{ color: 'var(--foreground)', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
          <h1 className={styles.title}>Community Feed</h1>
          <div style={{ width: '100px' }}></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className={styles.feedContainer}>
        {requests.map(req => (
          <div key={req.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${req.handle}&backgroundColor=e5e7eb`} alt={req.handle} />
              </div>
              <div className={styles.userInfo}>
                <span className={styles.name}>
                  {req.user} <span className={styles.time}>· {req.time}</span>
                </span>
                <span className={styles.handle}>@{req.handle}</span>
              </div>
            </div>

            <div className={styles.requestBody}>
              <p className={styles.reason}>{req.reason}</p>
              <div className={styles.amountBadge}>${req.amount}</div>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.progressContainer}>
                <div className={styles.progressText}>
                  ${req.raised} raised of ${req.amount}
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${Math.min((req.raised / req.amount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <Link href={`/${req.handle}`} passHref>
                <Button variant="primary">Fulfill</Button>
              </Link>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

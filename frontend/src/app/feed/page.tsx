import React from 'react';
import Link from 'next/link';
import styles from './Feed.module.css';
import { Button } from '@/components/ui/Button';
import AppLayout from '@/components/layout/AppLayout';

export default function FeedPage() {
  const requests = [
    {
      id: 1,
      user: 'Sarah Mensah',
      handle: 'sarahm',
      reason: 'Need $15 for data subscription so I can finish uploading my latest YouTube video! 📹✨',
      amount: 15,
      raised: 5,
      time: '2h ago',
      color1: '#FF6B6B',
      color2: '#FFE66D'
    },
    {
      id: 2,
      user: 'David O.',
      handle: 'davido',
      reason: 'Transport fare to the mainland for a job interview tomorrow morning. Anything helps! 🙏🏾',
      amount: 10,
      raised: 0,
      time: '5h ago',
      color1: '#4facfe',
      color2: '#00f2fe'
    },
    {
      id: 3,
      user: 'Tech Sis Academy',
      handle: 'techsis',
      reason: 'Raising funds to buy a used laptop for one of our brightest coding students.',
      amount: 250,
      raised: 120,
      time: '1d ago',
      color1: '#a18cd1',
      color2: '#fbc2eb'
    }
  ];

  const topOgas = [
    { rank: 1, handle: 'johndoe', donated: 450, color1: '#FFD700', color2: '#FDB931' },
    { rank: 2, handle: 'mary', donated: 320, color1: '#C0C0C0', color2: '#E8E8E8' },
    { rank: 3, handle: 'chuka_dev', donated: 150, color1: '#CD7F32', color2: '#E6A15C' }
  ];

  return (
    <AppLayout>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Live Feed</h1>
          </div>
        </header>

        <div className={styles.layoutGrid}>
          <main className={styles.feedContainer}>
            {requests.map(req => (
              <div key={req.id} className={`${styles.card} glass-panel`}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${req.color1}, ${req.color2})` }}>
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
                  <div className={styles.amountBadge}>${req.amount} Goal</div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.progressContainer}>
                    <div className={styles.progressText}>
                      <span>${req.raised} raised</span>
                      <span>{Math.round((req.raised / req.amount) * 100)}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${Math.min((req.raised / req.amount) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Link href={`/${req.handle}`} passHref>
                    <Button variant="primary" className={styles.eposeBtn}>Epose Them</Button>
                  </Link>
                </div>
              </div>
            ))}
          </main>

          <aside className={styles.sidebar}>
            <div className={`${styles.leaderboardCard} glass-panel`}>
              <div className={styles.leaderboardHeader}>
                <h2 className={styles.leaderboardTitle}>🏆 Top Ogas This Week</h2>
                <p className={styles.leaderboardDesc}>The most generous community members.</p>
              </div>
              
              <div className={styles.ogaList}>
                {topOgas.map(oga => (
                  <div key={oga.rank} className={styles.ogaItem}>
                    <div className={styles.ogaItemLeft}>
                      <div className={styles.ogaRank}>{oga.rank}</div>
                      <div className={styles.ogaAvatar} style={{ background: `linear-gradient(135deg, ${oga.color1}, ${oga.color2})` }}></div>
                      <span className={styles.ogaHandle}>@{oga.handle}</span>
                    </div>
                    <div className={styles.ogaDonated}>${oga.donated}</div>
                  </div>
                ))}
              </div>
              
              <Link href="#" className={styles.viewLeaderboardBtn}>
                View Full Leaderboard
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}


"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppLayout.module.css";
import { useEpos } from "@/components/epos/EposProvider";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { currentUser, receipts } = useEpos();
  const profileHref = currentUser?.username ? `/${currentUser.username}` : currentUser ? "/dashboard" : "/claim";
  const profileActive = currentUser?.username ? pathname === `/${currentUser.username}` : pathname === "/claim";
  const profileLabel = currentUser?.username ? "Public Profile" : "Finish Setup";
  const fulfilledCount = receipts.filter((item) => item.from === (currentUser?.username ? `@${currentUser.username}` : currentUser?.displayName)).length;
  const progress = Math.min(100, fulfilledCount * 20);

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}></span>
            Epos
          </Link>
          
          <nav className={styles.nav}>
            <Link 
              href="/dashboard" 
              className={`${styles.navItem} ${pathname === '/dashboard' ? styles.navItemActive : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Dashboard
            </Link>
            <Link 
              href="/feed" 
              className={`${styles.navItem} ${pathname === '/feed' ? styles.navItemActive : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              Live Feed
            </Link>
            <Link 
              href={profileHref}
              className={`${styles.navItem} ${profileActive ? styles.navItemActive : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              {profileLabel}
            </Link>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.ogaCard}>
            <div className={styles.ogaBadge}>Phase 1 MVP</div>
            <h3 className={styles.ogaTitle}>Generosity Status</h3>
            <div className={styles.ogaProgressWrapper}>
              <div className={styles.ogaProgressBar} style={{ width: `${progress}%` }}></div>
            </div>
            <p className={styles.ogaDesc}>
              {fulfilledCount} request{fulfilledCount === 1 ? "" : "s"} fulfilled. Keep eposing people.
            </p>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
      </main>

      <nav className={styles.mobileNav} aria-label="Mobile navigation">
        <Link
          href="/dashboard"
          className={`${styles.mobileNavItem} ${pathname === "/dashboard" ? styles.mobileNavItemActive : ""}`}
        >
          <span>Home</span>
        </Link>
        <Link
          href="/feed"
          className={`${styles.mobileNavItem} ${pathname === "/feed" ? styles.mobileNavItemActive : ""}`}
        >
          <span>Feed</span>
        </Link>
        <Link
          href={profileHref}
          className={`${styles.mobileNavItem} ${profileActive ? styles.mobileNavItemActive : ""}`}
        >
          <span>{currentUser?.username ? "Profile" : "Setup"}</span>
        </Link>
      </nav>
    </div>
  );
}

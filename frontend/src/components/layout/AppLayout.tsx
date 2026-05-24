"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppLayout.module.css";
import phaseStyles from "@/components/epos/Phase1.module.css";
import { useEpos } from "@/components/epos/EposProvider";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { currentUser, receipts, sandboxMode, toggleSandboxMode, mintMockTokens } = useEpos();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const profileHref = currentUser?.username
    ? `/${currentUser.username}`
    : "/claim";
  const profileActive = currentUser?.username
    ? pathname === `/${currentUser.username}`
    : pathname === "/claim";
  const profileLabel = currentUser?.username
    ? "Profile"
    : "Claim Handle";

  const fulfilledCount = receipts.filter(
    (item) =>
      item.from ===
      (currentUser?.username
        ? `@${currentUser.username}`
        : currentUser?.displayName),
  ).length;
  const progress = Math.min(100, fulfilledCount * 20);

  // Page title for mobile header
  const pageTitle = (() => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/feed") return "Live Feed";
    if (pathname === "/claim") return "Claim Handle";
    if (pathname.startsWith("/pay/")) return "Send Support";
    if (profileActive && currentUser?.username) return `@${currentUser.username}`;
    return "Epos";
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ── Sandbox Banner ── */}
      {sandboxMode && (
        <div className={phaseStyles.sandboxBanner} style={{ zIndex: 100 }}>
          🧪 Sandbox Mode (Simulation Enabled)
        </div>
      )}

      <div className={styles.pageContainer}>
        {/* ── Desktop Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoIcon}></span>
              Epos
            </Link>

            <nav className={styles.nav}>
              <Link
                href="/dashboard"
                className={`${styles.navItem} ${pathname === "/dashboard" ? styles.navItemActive : ""}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Dashboard
              </Link>
              <Link
                href="/feed"
                className={`${styles.navItem} ${pathname === "/feed" ? styles.navItemActive : ""}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
                Live Feed
              </Link>
              <Link
                href={profileHref}
                className={`${styles.navItem} ${profileActive ? styles.navItemActive : ""}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                {profileLabel}
              </Link>
            </nav>
          </div>

          <div className={styles.sidebarBottom}>
            {/* ── Sandbox Mode Toggle ── */}
            <div className={phaseStyles.sandboxToggleContainer}>
              <span className={phaseStyles.sandboxLabel}>Sandbox Mode</span>
              <label className={phaseStyles.sandboxToggleSwitch}>
                <input
                  type="checkbox"
                  checked={sandboxMode}
                  onChange={toggleSandboxMode}
                />
                <span className={phaseStyles.slider}></span>
              </label>
            </div>

            {/* ── Simulated Token Faucet ── */}
            {sandboxMode && currentUser && (
              <button
                onClick={mintMockTokens}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(234, 88, 12, 0.2)",
                  background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                  color: "#ea580c",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s"
                }}
              >
                🪙 Mint 100 USDC (Faucet)
              </button>
            )}

            <div className={styles.ogaCard}>
              <div className={styles.ogaBadge}>Phase 1</div>
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

        {/* ── Mobile Header ── */}
        <header className={styles.mobileHeader}>
          <Link href="/" className={styles.mobileHeaderLogo}>
            <span className={styles.logoIcon}></span>
            Epos
          </Link>
          <span className={styles.mobileHeaderTitle}>{pageTitle}</span>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </header>

        {/* ── Mobile Slide Menu ── */}
        {mobileMenuOpen && (
          <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)}>
            <nav className={styles.mobileSlideMenu} onClick={(e) => e.stopPropagation()}>
              <Link href="/dashboard" className={styles.mobileSlideItem} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link href="/feed" className={styles.mobileSlideItem} onClick={() => setMobileMenuOpen(false)}>Live Feed</Link>
              <Link href={profileHref} className={styles.mobileSlideItem} onClick={() => setMobileMenuOpen(false)}>{profileLabel}</Link>
              <Link href="/" className={styles.mobileSlideItem} onClick={() => setMobileMenuOpen(false)}>Home</Link>
              
              <div className={phaseStyles.sandboxToggleContainer} style={{ marginTop: "1.5rem", padding: "0.5rem 0.75rem" }}>
                <span className={phaseStyles.sandboxLabel} style={{ fontSize: "0.8rem" }}>Sandbox Mode</span>
                <label className={phaseStyles.sandboxToggleSwitch} style={{ transform: "scale(0.85)" }}>
                  <input
                    type="checkbox"
                    checked={sandboxMode}
                    onChange={toggleSandboxMode}
                  />
                  <span className={phaseStyles.slider}></span>
                </label>
              </div>
              
              {sandboxMode && currentUser && (
                <button
                  onClick={mintMockTokens}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(234, 88, 12, 0.2)",
                    background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                    color: "#ea580c",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    marginTop: "0.5rem"
                  }}
                >
                  🪙 Mint 100 USDC Faucet
                </button>
              )}
            </nav>
          </div>
        )}

        {/* ── Main Content ── */}
        <main className={styles.main}>
          {children}
        </main>

        {/* ── Mobile Bottom Nav ── */}
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          <Link
            href="/dashboard"
            className={`${styles.mobileNavItem} ${pathname === "/dashboard" ? styles.mobileNavItemActive : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Home</span>
          </Link>
          <Link
            href="/feed"
            className={`${styles.mobileNavItem} ${pathname === "/feed" ? styles.mobileNavItemActive : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
            <span>Feed</span>
          </Link>
          <Link
            href={profileHref}
            className={`${styles.mobileNavItem} ${profileActive ? styles.mobileNavItemActive : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

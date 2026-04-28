"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEpos } from "@/components/epos/EposProvider";
import styles from "./SignIn.module.css";

export default function SignInPage() {
  const router = useRouter();
  const { authReady, authConfigured, currentUser, login, loginWithWallet } = useEpos();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"ok" | "error" | "warn">("ok");

  // Redirect authenticated users to dashboard
  if (authReady && currentUser) {
    router.replace("/dashboard");
    return null;
  }

  const handleEmail = () => {
    if (!authConfigured) {
      setTone("warn");
      setMessage("Privy is not configured. Set NEXT_PUBLIC_PRIVY_APP_ID to enable sign-in.");
      return;
    }
    const result = login();
    if (!result.ok) {
      setTone("error");
      setMessage(result.message || "Sign-in failed. Please try again.");
      return;
    }
    setTone("ok");
    setMessage("Complete the email sign-in in the Privy modal.");
  };

  const handleWallet = () => {
    if (!authConfigured) {
      setTone("warn");
      setMessage("Privy is not configured. Set NEXT_PUBLIC_PRIVY_APP_ID to enable wallet sign-in.");
      return;
    }
    const result = loginWithWallet();
    if (!result.ok) {
      setTone("error");
      setMessage(result.message || "Wallet sign-in failed. Please try again.");
      return;
    }
    setTone("ok");
    setMessage("Approve the connection in your wallet.");
  };

  return (
    <div className={styles.page}>
      {/* Ambient glow blobs */}
      <div className={styles.glowPrimary} />
      <div className={styles.glowAccent} />

      {/* Floating particles */}
      <div className={styles.particles}>
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
      </div>

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.branding}>
          <div className={styles.logoMark}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className={styles.brandName}>Epos</span>
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.description}>
          Sign in to create payment requests, claim your handle, and get paid instantly onchain.
        </p>

        {/* Status message */}
        {message && (
          <div
            className={`${styles.statusBar} ${
              tone === "ok" ? styles.statusOk : tone === "warn" ? styles.statusWarn : styles.statusError
            }`}
          >
            {message}
          </div>
        )}

        {/* Loading state */}
        {!authReady && (
          <div className={styles.authButtons}>
            <button className={`${styles.authBtn} ${styles.emailBtn}`} disabled style={{ opacity: 0.6 }}>
              Loading...
            </button>
          </div>
        )}

        {/* Auth buttons */}
        {authReady && (
          <>
            <div className={styles.authButtons}>
              <button
                id="signin-email-btn"
                className={`${styles.authBtn} ${styles.emailBtn}`}
                onClick={handleEmail}
              >
                <span className={styles.btnIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                Continue with Email
              </button>

              <div className={styles.divider}>
                <span className={styles.dividerText}>or</span>
              </div>

              <button
                id="signin-wallet-btn"
                className={`${styles.authBtn} ${styles.walletBtn}`}
                onClick={handleWallet}
              >
                <span className={styles.btnIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                  </svg>
                </span>
                Connect Wallet
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            New to Epos?{" "}
            <Link href="/claim" className={styles.footerLink}>
              Claim your handle
            </Link>
          </p>

          <div className={styles.trustBadges}>
            <span className={styles.badge}>
              <span className={styles.badgeDot} />
              Base Sepolia
            </span>
            <span className={styles.badge}>Non-custodial</span>
            <span className={styles.badge}>No fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}

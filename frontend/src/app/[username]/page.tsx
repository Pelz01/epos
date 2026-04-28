"use client";

import React, { use, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { useEpos } from "@/components/epos/EposProvider";
import styles from "./Profile.module.css";
import phaseStyles from "@/components/epos/Phase1.module.css";

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { requests, currentUser } = useEpos();
  const clean = username.replace(/^@+/, "").toLowerCase();
  const [copiedProfile, setCopiedProfile] = useState(false);

  const userRequests = useMemo(
    () => requests.filter((item) => item.username === clean),
    [requests, clean],
  );

  const totalReceived = userRequests
    .filter((item) => item.status === "fulfilled")
    .reduce((sum, item) => sum + item.amount, 0);

  const isOwner = currentUser?.username === clean;
  const openRequests = userRequests.filter((item) => item.status === "open");

  const copyProfileLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${clean}`);
      setCopiedProfile(true);
      setTimeout(() => setCopiedProfile(false), 2000);
    } catch {
      /* silent */
    }
  };

  // Generate initials for avatar placeholder
  const initials = clean.slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <div className={styles.mainContent}>
        {/* ── Profile Hero ── */}
        <div className={styles.profileHero}>
          <div className={styles.heroBg}></div>
          <div className={styles.heroContent}>
            <div className={styles.avatarCircle}>
              <span className={styles.avatarInitials}>{initials}</span>
            </div>
            <h1 className={styles.heroName}>@{clean}</h1>
            <p className={styles.heroSubtitle}>Epos profile on Base Sepolia</p>
            <div className={styles.heroActions}>
              {isOwner ? (
                <>
                  <Button variant="primary" onClick={copyProfileLink}>
                    {copiedProfile ? "Copied!" : "Copy Profile Link"}
                  </Button>
                  <Link href="/dashboard">
                    <Button variant="secondary">Create Request</Button>
                  </Link>
                </>
              ) : (
                <>
                  {openRequests.length > 0 ? (
                    <Link href={`/pay/${openRequests[0].slug}`}>
                      <Button variant="primary">Epos @{clean}</Button>
                    </Link>
                  ) : (
                    <Button variant="secondary" onClick={copyProfileLink}>
                      {copiedProfile ? "Copied!" : "Share Profile"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{userRequests.length}</span>
            <span className={styles.statLabel}>Requests</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalReceived}</span>
            <span className={styles.statLabel}>USDC Received</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{openRequests.length}</span>
            <span className={styles.statLabel}>Open Now</span>
          </div>
        </div>

        {/* ── Open Requests ── */}
        {openRequests.length > 0 && (
          <div className={`${phaseStyles.card} ${phaseStyles.stack}`}>
            <h2 className={phaseStyles.strong}>Support @{clean}</h2>
            <p className={phaseStyles.muted}>Active requests you can fulfill right now.</p>
            <div className={phaseStyles.requestList}>
              {openRequests.map((item) => (
                <div key={item.id} className={phaseStyles.requestItem}>
                  <div className={phaseStyles.requestHead}>
                    <div>
                      <p className={phaseStyles.strong}>{item.amount} USDC</p>
                      <p className={phaseStyles.muted}>{item.reason}</p>
                    </div>
                    <span className={`${phaseStyles.pill} ${phaseStyles.badgeOpen}`}>Open</span>
                  </div>
                  <Link href={`/pay/${item.slug}`}>
                    <Button>Epos Them</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── No Open Requests Message ── */}
        {openRequests.length === 0 && !isOwner && (
          <div className={`${phaseStyles.card}`} style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
            <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: "0.35rem" }}>No active requests right now</p>
            <p className={phaseStyles.muted} style={{ marginBottom: "1rem" }}>
              @{clean} doesn&apos;t have open requests at the moment. Check the feed for others you can support.
            </p>
            <Link href="/feed">
              <Button variant="secondary">Browse the Feed</Button>
            </Link>
          </div>
        )}

        {/* ── Request History ── */}
        <div className={`${phaseStyles.card} ${phaseStyles.stack}`}>
          <h2 className={phaseStyles.strong}>Request History</h2>
          {userRequests.length === 0 && (
            <div className={phaseStyles.empty}>
              No requests found for @{clean} yet.
            </div>
          )}
          {userRequests.length > 0 && (
            <div className={phaseStyles.requestList}>
              {userRequests.map((item) => (
                <div key={item.id} className={phaseStyles.requestItem}>
                  <div className={phaseStyles.requestHead}>
                    <div>
                      <span className={phaseStyles.strong}>{item.amount} USDC</span>
                      <p className={phaseStyles.muted}>{item.reason}</p>
                    </div>
                    <span
                      className={`${phaseStyles.pill} ${
                        item.status === "open" ? phaseStyles.badgeOpen : phaseStyles.badgeDone
                      }`}
                    >
                      {item.status === "open" ? "Open" : "Fulfilled"}
                    </span>
                  </div>
                  {item.status === "fulfilled" && (
                    <p className={phaseStyles.muted}>Fulfilled by {item.fulfilledBy}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Owner CTA ── */}
        {isOwner && (
          <div style={{ textAlign: "center" }}>
            <Link href="/dashboard">
              <Button variant="secondary">Create New Request</Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

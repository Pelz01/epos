"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { useEpos } from "@/components/epos/EposProvider";
import phaseStyles from "@/components/epos/Phase1.module.css";

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
}

function prettyTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

function getAvatarColor(username: string): string {
  const colors = [
    "linear-gradient(135deg, #2563eb, #4f46e5)",
    "linear-gradient(135deg, #7c3aed, #c026d3)",
    "linear-gradient(135deg, #059669, #0d9488)",
    "linear-gradient(135deg, #d97706, #ea580c)",
    "linear-gradient(135deg, #2563eb, #7c3aed)",
    "linear-gradient(135deg, #dc2626, #e11d48)",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function FeedPage() {
  const { requests, receipts, isFeedLoading, feedError, refreshOnchainData, reactToRequest } = useEpos();
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  const sortedRequests = useMemo(
    () =>
      [...requests].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === "open" ? -1 : 1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [requests],
  );

  const leaderboard = useMemo(() => {
    const score = new Map<string, number>();
    for (const receipt of receipts) {
      const from = receipt.from;
      score.set(from, (score.get(from) ?? 0) + 1);
    }
    for (const request of requests) {
      if (request.status === "fulfilled" && request.fulfilledBy) {
        score.set(request.fulfilledBy, (score.get(request.fulfilledBy) ?? 0) + 1);
      }
    }
    return [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [receipts, requests]);

  const handleReact = (
    requestId: string,
    type: "pray" | "watch" | "support",
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    reactToRequest(requestId, type);

    const containerRect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (containerRect) {
      const emojiMap = { pray: "🙏", watch: "👀", support: "❤️" };
      const x = event.clientX - containerRect.left;
      const y = event.clientY - containerRect.top - 20; // offset slightly above cursor
      const rotation = Math.random() * 40 - 20; // random tilt
      const id = `${requestId}-${Date.now()}-${Math.random()}`;

      setFloatingEmojis((prev) => [
        ...prev,
        { id, emoji: emojiMap[type], x, y, rotation },
      ]);

      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
      }, 1200);
    }
  };

  return (
    <AppLayout>
      <div className={phaseStyles.container}>
        <div className={phaseStyles.header}>
          <h1 className={phaseStyles.title}>Epos Feed</h1>
          <p className={phaseStyles.subtitle}>
            See who&apos;s asking and who&apos;s helping — live from Base Sepolia.
          </p>
        </div>

        <div className={phaseStyles.row} style={{ marginBottom: "1rem" }}>
          <Button variant="secondary" onClick={refreshOnchainData} disabled={isFeedLoading}>
            {isFeedLoading ? "Syncing..." : "Refresh Feed"}
          </Button>
          {feedError && <div className={`${phaseStyles.status} ${phaseStyles.statusError}`}>{feedError}</div>}
        </div>

        <div className={phaseStyles.gridTwo}>
          {/* ── Request Cards ── */}
          <div className={phaseStyles.stack}>
            {sortedRequests.length === 0 && (
              <div className={phaseStyles.empty} style={{ padding: "2.5rem 1.5rem" }}>
                {isFeedLoading ? (
                  <>
                    <div style={{ width: "28px", height: "28px", margin: "0 auto 0.75rem", border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                    <p style={{ fontWeight: 600 }}>Reading Base Sepolia contracts...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>No requests yet</p>
                    <p>Be the first to create an Epos request.</p>
                  </>
                )}
              </div>
            )}
            {sortedRequests.map((item, index) => (
              <div key={item.id} className={`${phaseStyles.card} ${phaseStyles.animateIn}`} style={{ animationDelay: `${index * 60}ms` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: getAvatarColor(item.username),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.02em" }}>
                      {getInitials(item.username)}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/${item.username}`} style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)" }}>
                      @{item.username}
                    </Link>
                    <p className={phaseStyles.mini}>{prettyTime(item.createdAt)}</p>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem" }}>
                    <span
                      className={`${phaseStyles.pill} ${
                        item.status === "open" ? phaseStyles.badgeOpen : phaseStyles.badgeDone
                      }`}
                    >
                      {item.status === "open" ? "Open" : "Fulfilled"}
                    </span>
                    {item.status === "open" && item.sapaDays && (
                      <span className={phaseStyles.streakBadge}>
                        🔥 Day {item.sapaDays}
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: "1.02rem", lineHeight: 1.5, marginBottom: "0.75rem" }}>{item.reason}</p>
                <p className={phaseStyles.strong} style={{ marginBottom: "0.85rem" }}>{item.amount} USDC</p>

                {item.status === "open" ? (
                  <Link href={`/pay/${item.slug}`}>
                    <Button>Epos Them</Button>
                  </Link>
                ) : (
                  <div className={`${phaseStyles.status} ${phaseStyles.statusOk}`}>
                    Fulfilled by {item.fulfilledBy} · {item.fulfilledAt ? prettyTime(item.fulfilledAt) : "recently"}
                  </div>
                )}

                {/* ── Interactive Reactions Row ── */}
                <div className={phaseStyles.reactionsRow} style={{ position: "relative" }}>
                  <button
                    className={phaseStyles.reactionBtn}
                    onClick={(e) => handleReact(item.id, "pray", e)}
                  >
                    🙏 <span className={phaseStyles.reactionCount}>{item.reactions?.pray ?? 0}</span>
                  </button>
                  <button
                    className={phaseStyles.reactionBtn}
                    onClick={(e) => handleReact(item.id, "watch", e)}
                  >
                    👀 <span className={phaseStyles.reactionCount}>{item.reactions?.watch ?? 0}</span>
                  </button>
                  <button
                    className={phaseStyles.reactionBtn}
                    onClick={(e) => handleReact(item.id, "support", e)}
                  >
                    ❤️ <span className={phaseStyles.reactionCount}>{item.reactions?.support ?? 0}</span>
                  </button>

                  {/* Floating emojis renderer */}
                  <div className={phaseStyles.floatingEmojiContainer}>
                    {floatingEmojis
                      .filter((emoji) => emoji.id.startsWith(item.id))
                      .map((emoji) => (
                        <span
                          key={emoji.id}
                          className={phaseStyles.floatingEmoji}
                          style={{
                            left: `${emoji.x}px`,
                            top: `${emoji.y}px`,
                            "--rotation": `${emoji.rotation}deg`,
                          } as React.CSSProperties}
                        >
                          {emoji.emoji}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Leaderboard ── */}
          <div className={phaseStyles.stack}>
            <div className={`${phaseStyles.card} ${phaseStyles.animateIn}`}>
              <h2 className={phaseStyles.strong} style={{ marginBottom: "0.25rem" }}>👑 Top Oga</h2>
              <p className={phaseStyles.muted} style={{ marginBottom: "1rem" }}>Most generous this session.</p>
              <div className={phaseStyles.requestList}>
                {leaderboard.length === 0 && <p className={phaseStyles.muted}>No fulfillments yet — be the first.</p>}
                {leaderboard.map(([name, count], index) => (
                  <div key={name} className={phaseStyles.requestItem} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <span style={{ fontWeight: 800, color: index === 0 ? "var(--primary)" : "var(--text-muted)", fontSize: "0.95rem", width: "20px" }}>
                        {index === 0 ? "👑" : `${index + 1}.`}
                      </span>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: getAvatarColor(name),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.65rem" }}>
                          {getInitials(name.replace("@", ""))}
                        </span>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{name}</span>
                    </div>
                    <span className={phaseStyles.pill} style={{ color: "var(--success, #10b981)", fontWeight: 700 }}>
                      {count} fulfilled
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { useEpos } from "@/components/epos/EposProvider";
import phaseStyles from "@/components/epos/Phase1.module.css";

function prettyTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function FeedPage() {
  const { requests, receipts, isFeedLoading, feedError, refreshOnchainData } = useEpos();

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

  return (
    <AppLayout>
      <div className={phaseStyles.container}>
        <div className={phaseStyles.header}>
          <h1 className={phaseStyles.title}>Epos Feed</h1>
          <p className={phaseStyles.subtitle}>
            Public request timeline, rebuilt from Base Sepolia contract events.
          </p>
        </div>

        <div className={phaseStyles.row} style={{ marginBottom: "1rem" }}>
          <Button variant="secondary" onClick={refreshOnchainData} disabled={isFeedLoading}>
            {isFeedLoading ? "Refreshing..." : "Refresh Feed"}
          </Button>
          {feedError && <div className={`${phaseStyles.status} ${phaseStyles.statusError}`}>{feedError}</div>}
        </div>

        <div className={phaseStyles.gridTwo}>
          <div className={phaseStyles.stack}>
            {sortedRequests.length === 0 && (
              <div className={phaseStyles.empty}>
                {isFeedLoading ? "Reading the Base Sepolia contracts..." : "No requests yet."}
              </div>
            )}
            {sortedRequests.map((item) => (
              <div key={item.id} className={phaseStyles.card}>
                <div className={phaseStyles.requestHead}>
                  <div>
                    <p className={phaseStyles.strong}>@{item.username}</p>
                    <p className={phaseStyles.muted}>{prettyTime(item.createdAt)}</p>
                  </div>
                  <span
                    className={`${phaseStyles.pill} ${
                      item.status === "open" ? phaseStyles.badgeOpen : phaseStyles.badgeDone
                    }`}
                  >
                    {item.status === "open" ? "Open" : "Fulfilled"}
                  </span>
                </div>

                <div className={phaseStyles.stack} style={{ marginTop: "0.75rem" }}>
                  <p>{item.reason}</p>
                  <p className={phaseStyles.strong}>{item.amount} USDC</p>

                  {item.status === "open" ? (
                    <Link href={`/pay/${item.slug}`}>
                      <Button>Epos Them</Button>
                    </Link>
                  ) : (
                    <div className={`${phaseStyles.status} ${phaseStyles.statusOk}`}>
                      Fulfilled by {item.fulfilledBy} at {item.fulfilledAt ? prettyTime(item.fulfilledAt) : "now"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={phaseStyles.stack}>
            <div className={phaseStyles.card}>
              <h2 className={phaseStyles.strong}>Top Oga This Week</h2>
              <p className={phaseStyles.muted}>Based on number of fulfilled requests in this MVP session.</p>
              <div className={phaseStyles.requestList} style={{ marginTop: "0.75rem" }}>
                {leaderboard.length === 0 && <p className={phaseStyles.muted}>No fulfillments yet.</p>}
                {leaderboard.map(([name, count], index) => (
                  <div key={name} className={phaseStyles.requestItem}>
                    <div className={phaseStyles.requestHead}>
                      <span className={phaseStyles.strong}>
                        {index + 1}. {name}
                      </span>
                      <span className={phaseStyles.pill}>{count} fulfilled</span>
                    </div>
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

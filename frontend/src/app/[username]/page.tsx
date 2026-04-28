"use client";

import React, { use, useMemo } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { useEpos } from "@/components/epos/EposProvider";
import phaseStyles from "@/components/epos/Phase1.module.css";

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { requests, currentUser } = useEpos();
  const clean = username.replace(/^@+/, "").toLowerCase();

  const userRequests = useMemo(
    () => requests.filter((item) => item.username === clean),
    [requests, clean],
  );

  const totalReceived = userRequests
    .filter((item) => item.status === "fulfilled")
    .reduce((sum, item) => sum + item.amount, 0);

  const isOwner = currentUser?.username === clean;
  const openRequests = userRequests.filter((item) => item.status === "open");

  return (
    <AppLayout>
      <div className={phaseStyles.container}>
        <div className={phaseStyles.header}>
          <h1 className={phaseStyles.title}>@{clean}</h1>
          <p className={phaseStyles.subtitle}>Public profile on Epos.</p>
        </div>

        <div className={phaseStyles.gridTwo}>
          <div className={phaseStyles.stack}>
            <div className={phaseStyles.card}>
              <h2 className={phaseStyles.strong}>Profile Stats</h2>
              <div className={phaseStyles.requestList} style={{ marginTop: "0.75rem" }}>
                <div className={phaseStyles.requestItem}>
                  <p className={phaseStyles.muted}>Requests created</p>
                  <p className={phaseStyles.strong}>{userRequests.length}</p>
                </div>
                <div className={phaseStyles.requestItem}>
                  <p className={phaseStyles.muted}>Total received</p>
                  <p className={phaseStyles.strong}>{totalReceived} USDC</p>
                </div>
                <div className={phaseStyles.requestItem}>
                  <p className={phaseStyles.muted}>Open right now</p>
                  <p className={phaseStyles.strong}>{openRequests.length}</p>
                </div>
              </div>
            </div>

            {openRequests.length > 0 && (
              <div className={phaseStyles.card}>
                <h2 className={phaseStyles.strong}>Support @{clean}</h2>
                <div className={phaseStyles.requestList} style={{ marginTop: "0.75rem" }}>
                  {openRequests.map((item) => (
                    <div key={item.id} className={phaseStyles.requestItem}>
                      <p className={phaseStyles.strong}>{item.amount} USDC</p>
                      <p>{item.reason}</p>
                      <Link href={`/pay/${item.slug}`}>
                        <Button>Epos Them</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={phaseStyles.stack}>
            <div className={phaseStyles.card}>
              <h2 className={phaseStyles.strong}>Request History</h2>
              {userRequests.length === 0 && (
                <div className={phaseStyles.empty} style={{ marginTop: "0.75rem" }}>
                  No requests found for this handle yet.
                </div>
              )}
              {userRequests.length > 0 && (
                <div className={phaseStyles.requestList} style={{ marginTop: "0.75rem" }}>
                  {userRequests.map((item) => (
                    <div key={item.id} className={phaseStyles.requestItem}>
                      <div className={phaseStyles.requestHead}>
                        <span className={phaseStyles.strong}>{item.amount} USDC</span>
                        <span
                          className={`${phaseStyles.pill} ${
                            item.status === "open" ? phaseStyles.badgeOpen : phaseStyles.badgeDone
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p>{item.reason}</p>
                      {item.status === "fulfilled" && (
                        <p className={phaseStyles.muted}>Fulfilled by {item.fulfilledBy}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isOwner && (
              <Link href="/dashboard">
                <Button variant="secondary">Create New Request</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

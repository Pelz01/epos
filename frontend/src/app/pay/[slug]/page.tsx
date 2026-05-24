"use client";

import React, { use, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { useEpos } from "@/components/epos/EposProvider";
import phaseStyles from "@/components/epos/Phase1.module.css";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function getInitials(username: string): string {
  const clean = username.replace(/^@+/, "");
  return clean.slice(0, 2).toUpperCase();
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
  const clean = username.replace(/^@+/, "");
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function PayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const {
    authConfigured,
    requests,
    currentUser,
    balances,
    login,
    loginWithWallet,
    payRequest,
    refreshBalances,
  } = useEpos();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"ok" | "error" | "warn">("warn");
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const request = useMemo(() => requests.find((item) => item.slug === slug), [requests, slug]);
  const hasEnoughUsdc = balances ? balances.usdc >= (request?.amount ?? 0) : false;
  const hasGas = balances ? balances.eth > 0 : false;

  const copyText = async (value: string, successMessage: string) => {
    try {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(value);
          copied = true;
        } catch {
          copied = false;
        }
      }
      if (!copied) {
        copied = fallbackCopyText(value);
      }
      if (!copied) {
        throw new Error("Copy failed.");
      }
      setTone("ok");
      setMessage(successMessage);
    } catch {
      setTone("error");
      setMessage("Copy failed. You can copy it manually.");
    }
  };

  const fallbackCopyText = (value: string): boolean => {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  };

  const handleEmailConnect = () => {
    const result = login();
    if (!result.ok) {
      setTone("error");
      setMessage(result.message || "Could not connect.");
      return;
    }
    setTone("ok");
    setMessage("Complete the email sign-in. Privy will create a wallet if needed.");
  };

  const handleWalletConnect = () => {
    const result = loginWithWallet();
    if (!result.ok) {
      setTone("error");
      setMessage(result.message || "Could not connect wallet.");
      return;
    }
    setTone("ok");
    setMessage("Connect your wallet in Privy. No Epos account or username needed.");
  };

  const copyWallet = () => {
    if (!currentUser?.walletAddress) {
      return;
    }
    copyText(currentUser.walletAddress, "Wallet address copied.");
  };

  const handlePay = async () => {
    setIsPaying(true);
    setTone("ok");
    setMessage("Approve USDC first, then confirm the payment in Privy.");
    const result = await payRequest(slug);
    if (!result.ok || !result.receipt) {
      setTone("error");
      setMessage(result.message || "Payment failed.");
      setIsPaying(false);
      return;
    }
    setTone("ok");
    setMessage("Payment sent. Request fulfilled.");
    setReceiptId(result.receipt.id);
    setIsPaying(false);
  };

  if (!request) {
    return (
      <AppLayout>
        <div className={phaseStyles.container}>
          <div className={phaseStyles.card}>
            <h1 className={phaseStyles.title}>Request not found</h1>
            <p className={phaseStyles.subtitle}>This payment link does not exist.</p>
            <Link href="/feed">
              <Button style={{ marginTop: "1rem" }}>Back to Feed</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const isOpen = request.status === "open";

  return (
    <AppLayout>
      <div className={phaseStyles.container}>
        <div className={phaseStyles.header}>
          <h1 className={phaseStyles.title}>Send Support</h1>
          <p className={phaseStyles.subtitle}>
            No Epos account needed. Connect a wallet or continue with email to send Base Sepolia USDC.
          </p>
        </div>

        <div className={phaseStyles.gridTwo}>
          <div className={phaseStyles.stack}>
            <div className={phaseStyles.card}>
              <p className={phaseStyles.muted}>Recipient</p>
              <h2 className={phaseStyles.strong}>@{request.username}</h2>
              <p style={{ marginTop: "0.6rem" }}>{request.reason}</p>
              <p className={phaseStyles.strong} style={{ marginTop: "0.75rem" }}>
                {request.amount} USDC
              </p>
              <p className={phaseStyles.mini} style={{ marginTop: "0.4rem" }}>
                Created: {formatDate(request.createdAt)}
              </p>
            </div>

            <div className={phaseStyles.card}>
              <h3 className={phaseStyles.strong}>Choose how to pay</h3>
              {!currentUser && (
                <div className={phaseStyles.stack} style={{ marginTop: "0.75rem" }}>
                  <p className={phaseStyles.muted}>
                    Use your existing wallet, or continue with email and Privy will create one in the background.
                  </p>
                  {!authConfigured && (
                    <div className={`${phaseStyles.status} ${phaseStyles.statusError}`}>
                      Set NEXT_PUBLIC_PRIVY_APP_ID before sign-in can work.
                    </div>
                  )}
                  <div className={phaseStyles.row}>
                    <Button onClick={handleWalletConnect}>Pay with Wallet</Button>
                    <Button variant="secondary" onClick={handleEmailConnect}>
                      Continue with Email
                    </Button>
                  </div>
                </div>
              )}

              {currentUser && (
                <div className={phaseStyles.stack} style={{ marginTop: "0.75rem" }}>
                  <div className={`${phaseStyles.status} ${phaseStyles.statusOk}`}>
                    Wallet ready. {currentUser.username ? `Signed in as @${currentUser.username}.` : "No username needed to pay."}
                  </div>
                  {balances && (
                    <div className={phaseStyles.requestItem}>
                      <p className={phaseStyles.muted}>Your Base Sepolia wallet</p>
                      {currentUser.walletAddress && <p className={phaseStyles.codeText}>{currentUser.walletAddress}</p>}
                      <p className={phaseStyles.strong}>{balances.usdc.toFixed(2)} USDC</p>
                      <p className={phaseStyles.mini}>{balances.eth.toFixed(5)} ETH for gas</p>
                      <div className={phaseStyles.row}>
                        <Button variant="secondary" onClick={refreshBalances}>
                          Refresh Balance
                        </Button>
                        <Button variant="ghost" onClick={copyWallet} disabled={!currentUser.walletAddress}>
                          Copy Wallet
                        </Button>
                      </div>
                    </div>
                  )}
                  {balances && !hasGas && (
                    <div className={`${phaseStyles.status} ${phaseStyles.statusWarn}`}>
                      You need a little Base Sepolia ETH for gas before sending.
                    </div>
                  )}
                  {balances && !hasEnoughUsdc && (
                    <div className={`${phaseStyles.status} ${phaseStyles.statusWarn}`}>
                      You need {request.amount} Base Sepolia USDC to pay this request.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={phaseStyles.card}>
              <h3 className={phaseStyles.strong}>Pay Request</h3>
              <p className={phaseStyles.muted} style={{ marginTop: "0.45rem" }}>
                This sends real Base Sepolia USDC to @{request.username}.
              </p>
              {isOpen ? (
                <Button
                  style={{ marginTop: "0.75rem" }}
                  onClick={handlePay}
                  disabled={!currentUser || isPaying || (Boolean(balances) && (!hasGas || !hasEnoughUsdc))}
                >
                  {isPaying ? "Sending..." : `Send ${request.amount} USDC`}
                </Button>
              ) : (
                <div className={`${phaseStyles.status} ${phaseStyles.statusOk}`} style={{ marginTop: "0.75rem" }}>
                  Already fulfilled by {request.fulfilledBy}
                </div>
              )}
            </div>
          </div>

          <div className={phaseStyles.stack}>
            {(!receiptId && request.status !== "fulfilled") ? (
              <div className={phaseStyles.card}>
                <h3 className={phaseStyles.strong}>Receipt Card</h3>
                <div className={phaseStyles.empty} style={{ marginTop: "0.75rem" }}>
                  Complete payment to generate receipt.
                </div>
              </div>
            ) : (
              <div className={phaseStyles.visualReceiptCard}>
                <div className={phaseStyles.receiptCardHeader}>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.15rem" }}>Payment Receipt</h3>
                    <p className={phaseStyles.mini}>Base Sepolia Transaction</p>
                  </div>
                  <span className={phaseStyles.verifiedBadge}>Epos Verified ✓</span>
                </div>

                <div className={phaseStyles.receiptFlow}>
                  <div 
                    className={phaseStyles.receiptAvatarBubble}
                    style={{ background: getAvatarColor(request.fulfilledBy || "Giver") }}
                  >
                    {getInitials(request.fulfilledBy || "Giver")}
                  </div>
                  <div className={phaseStyles.receiptArrow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                  <div 
                    className={phaseStyles.receiptAvatarBubble}
                    style={{ background: getAvatarColor(request.username) }}
                  >
                    {getInitials(request.username)}
                  </div>
                </div>

                <div className={phaseStyles.receiptValueSection}>
                  <div className={phaseStyles.receiptPrimaryVal}>{request.amount} USDC</div>
                  <div className={phaseStyles.receiptSecondaryVal}>~₦{(request.amount * 1450).toLocaleString(undefined, { minimumFractionDigits: 2 })} NGN</div>
                </div>

                <div className={phaseStyles.receiptMetadataGrid}>
                  <div>
                    <div className={phaseStyles.receiptMetaLabel}>From</div>
                    <div className={phaseStyles.receiptMetaValue}>{request.fulfilledBy || "Anonymous Giver"}</div>
                  </div>
                  <div>
                    <div className={phaseStyles.receiptMetaLabel}>To</div>
                    <div className={phaseStyles.receiptMetaValue}>@{request.username}</div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <div className={phaseStyles.receiptMetaLabel}>For</div>
                    <div className={phaseStyles.receiptMetaValue} style={{ whiteSpace: "normal" }}>&ldquo;{request.reason}&rdquo;</div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <div className={phaseStyles.receiptMetaLabel}>Date & Time</div>
                    <div className={phaseStyles.receiptMetaValue}>{formatDate(request.fulfilledAt || new Date().toISOString())}</div>
                  </div>
                </div>

                <div className={phaseStyles.row}>
                  <Button 
                    style={{ width: "100%" }}
                    onClick={() => {
                      const text = encodeURIComponent(`I just eposed @${request.username} with ${request.amount} USDC on Base Sepolia! ⚡💳\n\nepos.xyz`);
                      window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
                    }}
                  >
                    Share on Twitter
                  </Button>
                </div>
              </div>
            )}
            <Link href={`/${request.username}`}>
              <Button variant="secondary">View @{request.username} Profile</Button>
            </Link>
          </div>
        </div>

        {message && (
          <div
            className={`${phaseStyles.status} ${
              tone === "ok" ? phaseStyles.statusOk : tone === "warn" ? phaseStyles.statusWarn : phaseStyles.statusError
            }`}
            style={{ marginTop: "1rem" }}
          >
            {message}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

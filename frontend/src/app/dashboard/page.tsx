"use client";

import React, { useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import phaseStyles from "@/components/epos/Phase1.module.css";
import { useEpos } from "@/components/epos/EposProvider";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function trimWallet(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function trimEmail(email: string): string {
  if (email.length <= 28) {
    return email;
  }
  const [name, domain] = email.split("@");
  if (!domain) {
    return `${email.slice(0, 18)}...`;
  }
  return `${name.slice(0, 12)}...@${domain}`;
}

export default function DashboardPage() {
  const {
    authReady,
    authConfigured,
    currentUser,
    requests,
    balances,
    isFeedLoading,
    feedError,
    login,
    claimUsername,
    createRequest,
    refreshBalances,
    refreshOnchainData,
    logout,
    withdrawMockUsdc,
  } = useEpos();
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("15");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"ok" | "error">("ok");
  const [lastLink, setLastLink] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // ── Naira Offramp Simulator States ──
  const [offrampStep, setOfframpStep] = useState<number>(0); // 0: idle, 1: verifying, 2: rate lock, 3: bank transfer, 4: success
  const [withdrawBank, setWithdrawBank] = useState("GTBank");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [offrampNaira, setOfframpNaira] = useState(0);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const usdcVal = Number(withdrawAmount);
    if (!balances || usdcVal <= 0 || usdcVal > balances.usdc) {
      setTone("error");
      setMessage(`Enter a valid amount up to ${balances ? balances.usdc : 0} USDC.`);
      return;
    }
    if (withdrawAccount.length !== 10 || !/^\d+$/.test(withdrawAccount)) {
      setTone("error");
      setMessage("Enter a valid 10-digit Nigerian bank account number.");
      return;
    }

    setTone("ok");
    setMessage("");
    setOfframpStep(1);
    setOfframpNaira(usdcVal * 1450);

    // Step 1 -> Step 2
    setTimeout(() => {
      setOfframpStep(2);
      // Step 2 -> Step 3
      setTimeout(() => {
        setOfframpStep(3);
        // Step 3 -> Step 4 (Success)
        setTimeout(() => {
          setOfframpStep(4);
          withdrawMockUsdc(usdcVal);
          refreshBalances();
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const resetOfframp = () => {
    setOfframpStep(0);
    setWithdrawAmount("");
    setWithdrawAccount("");
  };

  const userRequests = currentUser?.username
    ? requests.filter((item) => item.username === currentUser.username)
    : [];

  const handleSignIn = () => {
    const result = login();
    if (!result.ok) {
      setTone("error");
      setMessage(result.message || "Sign in failed.");
      return;
    }
    setTone("ok");
    setMessage("Complete the email sign-in in Privy.");
  };

  const handleClaim = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setIsClaiming(true);
    setTone("ok");
    setMessage("Confirm the Base Sepolia username transaction in Privy.");
    const result = await claimUsername(username);
    setIsClaiming(false);
    if (!result.ok) {
      setTone("error");
      setMessage(result.message || "Username claim failed.");
      return;
    }
    setTone("ok");
    setMessage(`@${username.replace(/^@+/, "")} claimed.`);
    setUsername("");
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setTone("ok");
    setMessage("Confirm the Base Sepolia request transaction in Privy.");
    const result = await createRequest({
      amount: Number(amount),
      reason,
    });
    setIsCreating(false);
    if (!result.ok || !result.request) {
      setTone("error");
      setMessage(result.message || "Could not create request.");
      return;
    }
    const path = `/pay/${result.request.slug}`;
    const fullLink =
      typeof window !== "undefined" ? `${window.location.origin}${path}` : `epos.xyz${path}`;
    setLastLink(fullLink);
    setReason("");
    setTone("ok");
    setMessage("Request created and added to the public feed.");
  };

  const copyLink = async () => {
    if (!lastLink) {
      return;
    }
    try {
      await navigator.clipboard.writeText(lastLink);
      setTone("ok");
      setMessage("Link copied.");
    } catch {
      setTone("error");
      setMessage("Copy failed. You can copy the link manually.");
    }
  };

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

  const copyWallet = () => {
    if (!currentUser?.walletAddress) {
      return;
    }
    copyText(currentUser.walletAddress, "Wallet address copied.");
  };

  const copyProfile = () => {
    if (!currentUser?.username || typeof window === "undefined") {
      return;
    }
    copyText(`${window.location.origin}/${currentUser.username}`, "Profile link copied — share it anywhere.");
  };

  const copyRequestLink = (slug: string) => {
    const path = `/pay/${slug}`;
    const fullLink = typeof window !== "undefined" ? `${window.location.origin}${path}` : `epos.xyz${path}`;
    copyText(fullLink, "Request link copied.");
  };

  return (
    <AppLayout>
      <div className={phaseStyles.container}>
        {/* ── Loading State ── */}
        {!authReady && (
          <div className={`${phaseStyles.card} ${phaseStyles.animateIn}`} style={{ textAlign: "center", padding: "3rem 2rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1.5s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <p style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--foreground)" }}>Setting up your Epos...</p>
            <p className={phaseStyles.muted} style={{ marginTop: "0.35rem" }}>This only takes a moment.</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Sign In State ── */}
        {authReady && !currentUser && (
          <div className={`${phaseStyles.card} ${phaseStyles.animateIn}`} style={{ textAlign: "center", padding: "3rem 2rem", maxWidth: "480px", margin: "2rem auto" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, var(--primary), var(--secondary))", margin: "0 auto 1.25rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Welcome to Epos</h2>
            <p className={phaseStyles.muted} style={{ marginBottom: "1.5rem", maxWidth: "320px", margin: "0 auto 1.5rem" }}>
              Sign in to create payment requests, claim your handle, and start getting paid onchain.
            </p>

            {!authConfigured && (
              <div className={`${phaseStyles.status} ${phaseStyles.statusError}`} style={{ marginBottom: "1rem" }}>
                Set NEXT_PUBLIC_PRIVY_APP_ID before sign-in can work.
              </div>
            )}
            <Button onClick={handleSignIn}>Continue with Email</Button>
          </div>
        )}

        {/* ── Authenticated State ── */}
        {authReady && currentUser && (
          <div className={phaseStyles.stack}>
            {/* ── Welcome Header ── */}
            <div className={phaseStyles.header}>
              <h1 className={phaseStyles.title}>
                {currentUser.username ? `Hey @${currentUser.username} 👋` : "Welcome to Epos"}
              </h1>
              <p className={phaseStyles.subtitle}>
                {currentUser.username
                  ? "Create a request and share the link to get paid."
                  : "Claim your handle to unlock your public profile and start receiving."}
              </p>
            </div>

            {/* ── Profile Link Card (if username exists) ── */}
            {currentUser.username && (
              <div className={`${phaseStyles.card} ${phaseStyles.animateIn}`} style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(124,58,237,0.04))" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <p className={phaseStyles.muted} style={{ fontSize: "0.82rem", marginBottom: "0.25rem" }}>Your public profile</p>
                    <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>epos.xyz/@{currentUser.username}</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <Button variant="primary" onClick={copyProfile}>Copy Profile Link</Button>
                    <Link href={`/${currentUser.username}`}>
                      <Button variant="secondary">View Profile</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ── Account Card ── */}
            <div className={`${phaseStyles.card} ${phaseStyles.setupCard} ${phaseStyles.animateIn}`}>
              <div className={phaseStyles.setupHero}>
                <div>
                  <h2 className={phaseStyles.setupTitle}>
                    {currentUser.username ? "Account" : "Claim your handle"}
                  </h2>
                  <p className={phaseStyles.setupCopy}>
                    {currentUser.username
                      ? "Your wallet and balances on Base Sepolia."
                      : "Choose the @handle people will use to find and pay you."}
                  </p>
                </div>
                <span className={phaseStyles.networkPill}>Base Sepolia</span>
              </div>

              <div className={phaseStyles.accountPanel}>
                <div className={phaseStyles.identityGrid}>
                  <div className={phaseStyles.identityItem}>
                    <span className={phaseStyles.identityLabel}>Email</span>
                    <span className={phaseStyles.identityValue} title={currentUser.identifier}>
                      {trimEmail(currentUser.identifier)}
                    </span>
                  </div>
                  <div className={phaseStyles.identityItem}>
                    <span className={phaseStyles.identityLabel}>Wallet</span>
                    <span className={phaseStyles.identityValue}>
                      {currentUser.walletAddress ? trimWallet(currentUser.walletAddress) : "Creating..."}
                    </span>
                  </div>
                </div>

                <div className={phaseStyles.balanceGrid}>
                  <div className={phaseStyles.balancePill}>
                    <span>ETH</span>
                    <strong>{balances ? balances.eth.toFixed(5) : "--"}</strong>
                  </div>
                  <div className={phaseStyles.balancePill}>
                    <span>USDC</span>
                    <strong>{balances ? balances.usdc.toFixed(2) : "--"}</strong>
                  </div>
                </div>

                <div className={phaseStyles.setupActions}>
                  <Button variant="secondary" className={phaseStyles.compactButton} onClick={refreshBalances}>
                    Refresh
                  </Button>
                  <Button
                    variant="ghost"
                    className={phaseStyles.compactButton}
                    onClick={copyWallet}
                    disabled={!currentUser.walletAddress}
                  >
                    Copy Wallet
                  </Button>
                  <Button variant="ghost" className={phaseStyles.compactButton} onClick={logout}>
                    Sign Out
                  </Button>
                </div>
              </div>

              {!currentUser.username && (
                <form className={phaseStyles.stack} onSubmit={handleClaim}>
                  <div>
                    <label className={phaseStyles.label}>Username</label>
                    <input
                      className={phaseStyles.input}
                      placeholder="tunde"
                      value={username}
                      onChange={(event) => setUsername(event.target.value.replace(/^@+/, "").toLowerCase())}
                      maxLength={15}
                    />
                  </div>
                  <Button type="submit" disabled={isClaiming}>
                    {isClaiming ? "Claiming..." : "Claim Handle"}
                  </Button>
                </form>
              )}
            </div>

            {/* ── Create Request + Profile ── */}
            {currentUser.username && (
              <div className={phaseStyles.gridTwo}>
                <div className={`${phaseStyles.card} ${phaseStyles.stack} ${phaseStyles.animateIn}`}>
                  <h3 className={phaseStyles.strong}>Create Epos Request</h3>
                  <div>
                    <label className={phaseStyles.label}>Amount (USDC)</label>
                    <input
                      className={phaseStyles.input}
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={phaseStyles.label}>Reason</label>
                    <textarea
                      className={phaseStyles.textarea}
                      placeholder="School fees abeg 🙏"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Generate Link"}
                  </Button>

                  {lastLink && (
                    <div className={phaseStyles.stack}>
                      <div className={phaseStyles.codeText}>{lastLink}</div>
                      <div className={phaseStyles.row}>
                        <Button variant="secondary" onClick={copyLink}>
                          Copy Link
                        </Button>
                        <Link href="/feed">
                          <Button variant="ghost">View in Feed</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className={phaseStyles.stack}>
                  <div className={`${phaseStyles.card} ${phaseStyles.stack} ${phaseStyles.animateIn}`}>
                    <h3 className={phaseStyles.strong}>Quick Info</h3>
                    <p className={phaseStyles.muted}>
                      Feed: {isFeedLoading ? "syncing..." : "up to date"} · Base Sepolia
                    </p>
                    {feedError && <div className={`${phaseStyles.status} ${phaseStyles.statusError}`}>{feedError}</div>}
                    <Button variant="secondary" onClick={refreshOnchainData} disabled={isFeedLoading}>
                      {isFeedLoading ? "Refreshing..." : "Refresh Onchain Feed"}
                    </Button>
                    <p className={phaseStyles.muted}>
                      Public page:{" "}
                      <Link className={phaseStyles.linkText} href={`/${currentUser.username}`}>
                        /{currentUser.username}
                      </Link>
                    </p>
                    <p className={phaseStyles.muted}>Requests created: {userRequests.length}</p>
                  </div>

                  {/* ── Withdraw Simulator Panel ── */}
                  {balances && balances.usdc > 0 && (
                    <div className={phaseStyles.animateIn} style={{ animationDelay: "80ms" }}>
                      {offrampStep === 4 ? (
                        <div className={phaseStyles.bagSecuredCard}>
                          <span className={phaseStyles.bagSecuredEmoji}>🎒</span>
                          <h3 className={phaseStyles.bagSecuredTitle}>Bag Secured!</h3>
                          <div className={phaseStyles.bagSecuredAmount}>
                            ₦{offrampNaira.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <p className={phaseStyles.muted} style={{ fontSize: '0.92rem', fontWeight: 600 }}>
                            Naira successfully deposited to your bank account.
                          </p>
                          <div className={phaseStyles.bagSecuredDetail}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                              <span>Withdrawn:</span>
                              <span style={{ fontWeight: 700 }}>{withdrawAmount} USDC</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                              <span>Destination:</span>
                              <span style={{ fontWeight: 700 }}>{withdrawBank} ({withdrawAccount.slice(0,3)}****{withdrawAccount.slice(-3)})</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                              <span>Exchange Rate:</span>
                              <span style={{ fontWeight: 700 }}>₦1,450.00 / USDC</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Partner:</span>
                              <span style={{ fontWeight: 700 }}>Yellow Card API ⚡</span>
                            </div>
                          </div>
                          <div className={phaseStyles.row}>
                            <Button variant="primary" onClick={() => {
                              const text = encodeURIComponent(`Bag Secured! Just offramped ${withdrawAmount} USDC directly to my ${withdrawBank} account in seconds using @epos_xyz! 🎒⚡\n\nepos.xyz`);
                              window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
                            }}>
                              Share
                            </Button>
                            <Button variant="secondary" onClick={resetOfframp}>
                              Done
                            </Button>
                          </div>
                        </div>
                      ) : offrampStep > 0 ? (
                        <div className={`${phaseStyles.card} ${phaseStyles.offrampCard}`}>
                          <h3 className={phaseStyles.strong}>Withdrawal Processing</h3>
                          <p className={phaseStyles.muted}>Settlement in progress...</p>
                          <div className={phaseStyles.offrampSteps}>
                            <div className={`${phaseStyles.offrampStep} ${offrampStep === 1 ? phaseStyles.offrampStepActive : offrampStep > 1 ? phaseStyles.offrampStepDone : ""}`}>
                              <span className={phaseStyles.stepIcon}>{offrampStep > 1 ? "✓" : "1"}</span>
                              <span>Verifying {withdrawBank} Account...</span>
                            </div>
                            <div className={`${phaseStyles.offrampStep} ${offrampStep === 2 ? phaseStyles.offrampStepActive : offrampStep > 2 ? phaseStyles.offrampStepDone : ""}`}>
                              <span className={phaseStyles.stepIcon}>{offrampStep > 2 ? "✓" : "2"}</span>
                              <span>Locking Conversion Rate (₦1,450.00)...</span>
                            </div>
                            <div className={`${phaseStyles.offrampStep} ${offrampStep === 3 ? phaseStyles.offrampStepActive : offrampStep > 3 ? phaseStyles.offrampStepDone : ""}`}>
                              <span className={phaseStyles.stepIcon}>{offrampStep > 3 ? "✓" : "3"}</span>
                              <span>Sending ₦{offrampNaira.toLocaleString()} Naira Transfer...</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0' }}>
                            <div style={{ width: "20px", height: "20px", border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                          </div>
                        </div>
                      ) : (
                        <div className={`${phaseStyles.card} ${phaseStyles.stack}`}>
                          <h3 className={phaseStyles.strong}>Withdraw to Local Bank</h3>
                          <p className={phaseStyles.muted}>Convert USDC to Naira instantly to your bank account.</p>
                          <form className={phaseStyles.stack} onSubmit={handleWithdraw}>
                            <div>
                              <label className={phaseStyles.label}>Select Bank</label>
                              <select 
                                className={phaseStyles.input}
                                value={withdrawBank} 
                                onChange={(e) => setWithdrawBank(e.target.value)}
                              >
                                <option value="GTBank">GTBank</option>
                                <option value="Zenith Bank">Zenith Bank</option>
                                <option value="Access Bank">Access Bank</option>
                                <option value="UBA">UBA</option>
                                <option value="Kuda Bank">Kuda Bank</option>
                                <option value="OPay">OPay</option>
                              </select>
                            </div>
                            <div>
                              <label className={phaseStyles.label}>Account Number</label>
                              <input 
                                className={phaseStyles.input}
                                type="text" 
                                placeholder="0123456789"
                                maxLength={10}
                                value={withdrawAccount} 
                                onChange={(e) => setWithdrawAccount(e.target.value.replace(/\D/g, ""))}
                              />
                            </div>
                            <div>
                              <label className={phaseStyles.label}>Amount (USDC)</label>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                  className={phaseStyles.input}
                                  type="number" 
                                  placeholder="Min 1 USDC"
                                  min={1}
                                  max={balances ? balances.usdc : 0}
                                  value={withdrawAmount} 
                                  onChange={(e) => setWithdrawAmount(e.target.value)}
                                />
                                <Button 
                                  type="button" 
                                  variant="secondary"
                                  onClick={() => balances && setWithdrawAmount(balances.usdc.toString())}
                                >
                                  Max
                                </Button>
                              </div>
                            </div>
                            <Button 
                              type="submit" 
                              disabled={!balances || balances.usdc < 1}
                            >
                              {!balances || balances.usdc < 1 ? "Insufficient USDC Balance" : "Withdraw to Bank"}
                            </Button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Request History ── */}
            {currentUser.username && (
              <div className={`${phaseStyles.card} ${phaseStyles.stack} ${phaseStyles.animateIn}`}>
                <h3 className={phaseStyles.strong}>Your Requests</h3>
                {userRequests.length === 0 && (
                  <div className={phaseStyles.empty}>No requests yet. Create your first link above.</div>
                )}
                {userRequests.length > 0 && (
                  <div className={phaseStyles.requestList}>
                    {userRequests.map((item) => (
                      <div key={item.id} className={phaseStyles.requestItem}>
                        <div className={phaseStyles.requestHead}>
                          <div>
                            <p className={phaseStyles.strong}>{item.amount} USDC</p>
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
                        <p className={phaseStyles.mini}>Created {formatDate(item.createdAt)}</p>
                        <div className={phaseStyles.copyLine}>
                          <p className={phaseStyles.codeText}>/pay/{item.slug}</p>
                          <Button variant="secondary" className={phaseStyles.compactButton} onClick={() => copyRequestLink(item.slug)}>
                            Copy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Status Message ── */}
        {message && (
          <div
            className={`${phaseStyles.status} ${tone === "ok" ? phaseStyles.statusOk : phaseStyles.statusError}`}
            style={{ marginTop: "1rem" }}
          >
            {message}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

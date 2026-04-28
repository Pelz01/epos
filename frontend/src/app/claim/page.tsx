"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useEpos } from "@/components/epos/EposProvider";
import AppLayout from "@/components/layout/AppLayout";
import phaseStyles from "@/components/epos/Phase1.module.css";

export default function ClaimPage() {
  const router = useRouter();
  const { authConfigured, currentUser, login, claimUsername } = useEpos();
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"ok" | "error">("ok");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    setTone("ok");
    setMessage("Confirm the Base Sepolia transaction in Privy.");
    const result = await claimUsername(username);
    setIsSubmitting(false);
    if (!result.ok) {
      setTone("error");
      setMessage(result.message || "Could not claim username.");
      return;
    }
    setTone("ok");
    setMessage(`@${username.replace(/^@+/, "")} claimed. Opening dashboard.`);
    router.push("/dashboard");
  };

  return (
    <AppLayout>
      <div className={phaseStyles.container} style={{ maxWidth: "480px", margin: "0 auto", padding: "3rem 1.25rem" }}>
        <div className={`${phaseStyles.card} ${phaseStyles.animateIn}`} style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, var(--primary), var(--accent))", margin: "0 auto 1.25rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            Claim your handle
          </h1>
          <p className={phaseStyles.muted} style={{ marginBottom: "1.75rem", maxWidth: "320px", margin: "0 auto 1.75rem" }}>
            Your @handle is your permanent payment identity onchain. People will pay you at epos.xyz/@you.
          </p>

          {!currentUser && (
            <div className={phaseStyles.stack} style={{ textAlign: "left" }}>
              {!authConfigured && (
                <div className={`${phaseStyles.status} ${phaseStyles.statusError}`}>
                  Set NEXT_PUBLIC_PRIVY_APP_ID before sign-in can work.
                </div>
              )}
              <p className={phaseStyles.muted} style={{ textAlign: "center" }}>Sign in first, then pick your username.</p>
              <Button onClick={handleSignIn}>Continue with Email</Button>
            </div>
          )}

          {currentUser?.username && (
            <div className={phaseStyles.stack}>
              <div className={`${phaseStyles.status} ${phaseStyles.statusOk}`}>
                You already claimed @{currentUser.username}. You&apos;re all set.
              </div>
              <Link href="/dashboard">
                <Button variant="secondary">Go to Dashboard</Button>
              </Link>
            </div>
          )}

          {currentUser && !currentUser.username && (
            <form className={phaseStyles.stack} onSubmit={handleClaim} style={{ textAlign: "left" }}>
              <div>
                <label className={phaseStyles.label}>Choose your username</label>
                <input
                  className={phaseStyles.input}
                  placeholder="tunde"
                  maxLength={15}
                  value={username}
                  onChange={(event) => setUsername(event.target.value.replace(/^@+/, "").toLowerCase())}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Claiming..." : "Claim Handle"}
              </Button>
              <Link href="/dashboard" style={{ textAlign: "center" }}>
                <span className={phaseStyles.linkText}>Skip for now → Dashboard</span>
              </Link>
            </form>
          )}

          {message && (
            <div className={`${phaseStyles.status} ${tone === "ok" ? phaseStyles.statusOk : phaseStyles.statusError}`} style={{ marginTop: "1rem" }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

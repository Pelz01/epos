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

  const content = (
    <div className={phaseStyles.container}>
      <div className={phaseStyles.card}>
        <div className={phaseStyles.stack}>
          <h1 className={phaseStyles.title}>Claim your Epos handle</h1>
          <p className={phaseStyles.subtitle}>
            Sign in first, then register your unique @username for your profile link.
          </p>

          {!currentUser && (
            <div className={phaseStyles.stack}>
              {!authConfigured && (
                <div className={`${phaseStyles.status} ${phaseStyles.statusError}`}>
                  Set NEXT_PUBLIC_PRIVY_APP_ID before sign-in can work.
                </div>
              )}
              <Button onClick={handleSignIn}>Continue with Email</Button>
            </div>
          )}

          {currentUser?.username && (
            <div className={phaseStyles.stack}>
              <div className={`${phaseStyles.status} ${phaseStyles.statusOk}`}>
                You already claimed @{currentUser.username}.
              </div>
              <Link href="/dashboard" className={phaseStyles.linkText}>
                Go to dashboard
              </Link>
            </div>
          )}

          {currentUser && !currentUser.username && (
            <form className={phaseStyles.stack} onSubmit={handleClaim}>
              <div>
                <label className={phaseStyles.label}>Username</label>
                <input
                  className={phaseStyles.input}
                  placeholder="pelz"
                  maxLength={15}
                  value={username}
                  onChange={(event) => setUsername(event.target.value.replace(/^@+/, "").toLowerCase())}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Claiming..." : "Claim Handle"}
              </Button>
              <Link href="/dashboard" className={phaseStyles.linkText}>
                Go to dashboard
              </Link>
            </form>
          )}

          {message && (
            <div className={`${phaseStyles.status} ${tone === "ok" ? phaseStyles.statusOk : phaseStyles.statusError}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (currentUser) {
    return <AppLayout>{content}</AppLayout>;
  }

  return content;
}

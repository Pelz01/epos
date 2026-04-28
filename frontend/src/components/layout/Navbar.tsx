"use client";

import React from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { Button } from "../ui/Button";
import { useEpos } from "@/components/epos/EposProvider";

export function Navbar() {
  const { currentUser } = useEpos();
  const profileHref = currentUser?.username ? `/${currentUser.username}` : "/claim";
  const actionHref = currentUser ? "/dashboard" : "/signin";
  const actionLabel = currentUser ? "Dashboard" : "Sign In";

  return (
    <header className={`${styles.header} animate-fade-in`}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}></span>
          Epos
        </Link>
        
        <div className={styles.links}>
          <Link href="/#how-it-works" className={styles.link}>How it works</Link>
          <Link href="/feed" className={styles.link}>Community Feed</Link>
          <Link href={profileHref} className={styles.link}>Profile</Link>
        </div>

        <Link href={actionHref} passHref>
          <Button variant="secondary">
            {actionLabel}
          </Button>
        </Link>
      </nav>
    </header>
  );
}

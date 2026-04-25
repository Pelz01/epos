import React from 'react';
import styles from './Hero.module.css';
import { Button } from '../ui/Button';
import { Typewriter } from '../ui/Typewriter';
import Link from 'next/link';

export function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.glowBlob}></div>
      
      <div className={styles.container}>
        <div className={`${styles.content} animate-fade-in`}>
          <h1 className={styles.title}>
            <Typewriter />
          </h1>
          
          <p className={styles.subtitle}>
            Send a request. Get paid in seconds. No bank. No fees. No wahala. 
            Epos is the social payment layer built for Nigeria's informal economy.
          </p>
          
          <div className={styles.actions}>
            <Link href="/dashboard" passHref>
              <Button variant="primary" withArrow>
                Create Request
              </Button>
            </Link>
            <Link href="/claim" passHref>
              <Button variant="secondary">
                Claim Handle
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

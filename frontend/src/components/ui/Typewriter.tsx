"use client";

import React, { useState, useEffect } from 'react';

const phrases = [
  "dad?",
  "super dad?",
  "mom?",
  "super mom?",
  "my guy?",
  "boss?",
  "chief?",
  "my ski?",
  "idan?",
  "odogwu?",
  "alhaji?",
  "oba?",
];

export function Typewriter() {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleType = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 100);

      if (!isDeleting && text === fullText) {
        timer = setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500); // pause before starting new word
      } else {
        timer = setTimeout(handleType, typingSpeed);
      }
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <span style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
      <span className="text-primary" style={{ fontWeight: 700 }}>epos, {text}</span>
      <span style={{ 
        borderRight: '2px solid var(--primary)', 
        animation: 'blink 1s step-end infinite',
        marginLeft: '2px',
        opacity: 0.8
      }} />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}} />
    </span>
  );
}

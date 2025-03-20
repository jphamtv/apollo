import { useEffect, useState } from "react";
import styles from './TypingIndicators.module.css'

interface TypingIndicatorProps {
  displayName: string;
  isConversationWithBot: boolean;
}

export default function TypingIndicator({ displayName, isConversationWithBot }: TypingIndicatorProps) {
  const [dots, setDots] = useState('...');

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);

    return () => clearInterval(interval);
  });

  return (
    <div className={styles.container}>
      <div className={styles.text}>
        {displayName} is {isConversationWithBot ? "replying" : "typing"}
        <span className={styles.dots}>{dots}</span>            
      </div>
    </div>
  );
}
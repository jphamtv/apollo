import styles from './BotBadge.module.css';

export default function BotBadge() {
  return (
    <span className={styles.botBadge} aria-label="AI chat bot" role="img">
      AI
    </span>
  );
}

import styles from './TimestampDivider.module.css';

interface Props {
  timestamp: string;
}

export default function TimestampDivider({ timestamp }: Props) {
  return (
    <div className={styles.timestampDivider}>
      <span className={styles.timestampText}>{timestamp}</span>
    </div>
  );
}

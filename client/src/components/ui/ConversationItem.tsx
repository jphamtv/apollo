import styles from './ConversationItem.module.css';

interface Props {
  displayName?: string;
  lastMessage?: string;
  timestamp?: string;
}

export default function ConversationItem({ 
  displayName = "User Name", 
  lastMessage = "No messages yet",
  timestamp = "12:00 PM"
}: Props) {
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        {initials}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.name}>{displayName}</span>
          <span className={styles.time}>{timestamp}</span>
        </div>
        <p className={styles.preview}>{lastMessage}</p>
      </div>
    </div>
  );
}
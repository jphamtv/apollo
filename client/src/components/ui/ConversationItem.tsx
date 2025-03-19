import styles from './ConversationItem.module.css';
import BotBadge from './BotBadge';

interface Props {
  displayName: string;
  lastMessage: string;
  timestamp: string;
  isActive?: boolean;
  hasUnread?: boolean;
  isBot?: boolean;
  onClick?: () => void;
}

export default function ConversationItem({ 
  displayName, 
  lastMessage,
  timestamp,
  isActive = false,
  hasUnread = false,
  isBot = false,
  onClick
}: Props) {
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
    

  return (
    <div 
      className={`${styles.container} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.avatar}>
        {initials}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.name}>
            {displayName}
            {isBot && <BotBadge />}
          </span>
          <span className={styles.time}>{timestamp}</span>
        </div>
        <div className={styles.previewContainer}>
          <p className={styles.preview}>{lastMessage}</p>
          {hasUnread && <div className={styles.unreadIndicator} />}
        </div>
      </div>
    </div>
  );
}
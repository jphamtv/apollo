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
  'aria-selected'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | true | false;
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
      role="button"
      tabIndex={0}
      aria-label={`Conversation with ${displayName}${isBot ? ' (AI)' : ''}${hasUnread ? ', unread messages' : ''}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
      aria-selected={isActive}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className={styles.avatar} aria-hidden="true">
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
          {hasUnread && <div className={styles.unreadIndicator} aria-label="Unread messages" role="status" />}
        </div>
      </div>
    </div>
  );
}
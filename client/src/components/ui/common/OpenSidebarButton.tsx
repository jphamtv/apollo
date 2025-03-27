import styles from './OpenSidebarButton.module.css';
import { PanelLeft } from 'lucide-react';
import { useSidebar } from '../../../hooks/useSidebar';
import { useMessaging } from '../../../hooks/useMessaging';
import { useAuth } from '../../../hooks/useAuth';

export default function OpenSidebarButton() {
  const { toggleMobileSidebar } = useSidebar();
  const { conversations } = useMessaging();
  const { user } = useAuth();

  // Count unread conversations
  const unreadCount = conversations.filter(conv =>
    conv.messages.some(msg => !msg.isRead && msg.senderId !== user?.id)
  ).length;

  return (
    <div className={styles.buttonContainer}>
      <button
        className={styles.openSidebarButton}
        onClick={toggleMobileSidebar}
        aria-label={`Toggle menu${unreadCount > 0 ? `, ${unreadCount} unread conversations` : ''}`}
      >
        <PanelLeft size={20} strokeWidth={1} />
      </button>
      {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
    </div>
  );
}

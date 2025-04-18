import styles from './EmptyConversation.module.css';
import Button from '../common/Button';
import { useNavigation } from '../../../hooks/useNavigation';
import OpenSidebarButton from '../common/OpenSidebarButton';
import { MessageCirclePlus } from 'lucide-react';

export default function EmptyConversation() {
  const { startNewConversation } = useNavigation();

  return (
    <div className={styles.container}>
      {/* Menu button in the top-left for mobile */}
      <div className={styles.mobileNav}>
        <OpenSidebarButton />
      </div>

      <div className={styles.content}>
        <h2>No conversations yet</h2>
        <p>Start a new conversation to begin messaging</p>

        {/* Button to start a new conversation */}
        <Button
          onClick={startNewConversation}
          className={styles.newChatButton}
          variant="primary"
          size="medium"
        >
          <MessageCirclePlus
            size={20}
            strokeWidth={1.5}
            style={{ marginRight: '8px' }}
          />
          Start New Conversation
        </Button>
      </div>
    </div>
  );
}

import styles from './ConversationsSidebar.module.css';
import ConversationItem from './ConversationItem';
import NewChatButton from './NewChatButton';
import ProfileButton from './ProfileButton';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  onNewChat: () => void;
}

export default function ConversationsSidebar({ onNewChat }): Props {
  const { user } = useAuth();
  
  // Don't render until we have user with profile data
  if (!user?.profile) return null;
  
  return (
    <aside className={styles.container}>
      <header className={styles.header}>
        <h2>Messages App</h2>
      </header>
      
      <main className={styles.main}>
        <NewChatButton onClick={onNewChat} />
        {/* TODO: Load conversations */}
        <ConversationItem />
        <ConversationItem />
        <ConversationItem />
      </main>
      
      <footer className={styles.footer}>
        <ProfileButton user={user} />
      </footer>
    </aside>
  );
}
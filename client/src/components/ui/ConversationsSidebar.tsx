import styles from './ConversationSidebar.module.css';
import ConversationItem from './ConversationItem';
import NewChatButton from './NewChatButton';
import ProfileButton from './ProfileButton';
import { useAuth } from '../../hooks/useAuth';

export default function ConversationsSidebar() {
  const { user } = useAuth();
  
  // Don't render until we have user with profile data
  if (!user?.profile) return null;
  
  return (
    <aside className={styles.container}>
      <header className={styles.header}>
        <h2>Messages</h2>
        <NewChatButton />
      </header>
      
      <main className={styles.main}>
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
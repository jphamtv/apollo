import ConversationItem from './ConversationItem';
import styles from './ConversationSidebar.module.css'
import Button from './Button';

export default function ConversationsSidebar() {
  return (
    <aside className={styles.container}>
      <header className={styles.header}>
        <Button>
          New Chat
        </Button>
      </header>
      <div className={styles.list}>
        <ConversationItem />
        <ConversationItem />
      </div>
      <footer className={styles.footer}>
        <Button>Profile Settings</Button>
      </footer>
    </aside>
  )
}
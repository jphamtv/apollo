import styles from './EmptyConversation.module.css'

export default function EmptyConversation() {
  return (
    <div className={styles.container}>
      <h2>Select a conversation</h2>
      <p>Choose a conversation from the sidebar or start a new one</p>
    </div>
  );
}
import styles from './ConversationItem.module.css'

export default function ConversationsItem() {
  return (
    <div className={styles.container}>
      <div className={styles.profilePic}>JP</div>
      <div className={styles.info}>
        <p className={styles.displayName}>Test User</p>
        <p className={styles.conversationPreview}>This is a preview of the last message sent.</p>
      </div>
    </div>
  )
}
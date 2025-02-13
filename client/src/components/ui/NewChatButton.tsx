import { Plus } from 'lucide-react';
import styles from './NewChatButton.module.css';

export default function NewChatButton() {
  return (
    <button className={styles.button}>
      <Plus size={16} />
      New Message
    </button>
  );
}
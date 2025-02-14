import { Plus } from 'lucide-react';
import styles from './NewChatButton.module.css';

interface Props {
  onClick: () => void;
}

export default function NewChatButton({ onClick }): Props {
  return (
    <button className={styles.button} onClick={onClick}>
      <Plus size={16} />
      New Message
    </button>
  );
}
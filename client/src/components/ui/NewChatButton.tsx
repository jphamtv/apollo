import { MessageCirclePlus } from 'lucide-react';
import styles from './NewChatButton.module.css';

interface Props {
  onClick: () => void;
}

export default function NewChatButton({ onClick }: Props) {
  return (
    <button className={styles.button} onClick={onClick}>
      <MessageCirclePlus size={24} strokeWidth={1.5}/>
      New Conversation
    </button>
  );
}
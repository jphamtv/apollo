import { ChevronUp } from 'lucide-react';
import styles from './ProfileButton.module.css';

interface Props {
  username: string;
}

export default function ProfileButton({ username }: Props) {
  return (
    <button className={styles.container}>
      <span className={styles.username}>{username}</span>
      <ChevronUp size={16} className={styles.chevron} />
    </button>
  );
}
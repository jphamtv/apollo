import { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import styles from './ProfileButton.module.css';
import ProfileMenu from './ProfileMenu';
import { User } from '../../types/user';

interface Props {
  user: User;
}

export default function ProfileButton({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const initial = user.profile?.displayName.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase();

  return (
    <div className={styles.wrapper}>
      <button 
        className={styles.container}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.avatar}>
          {user.profile?.imageUrl ? (
            <img src={user.profile.imageUrl} alt="" className={styles.avatarImage} />
          ) : (
            initial
          )}
        </div>
        <span className={styles.displayName}>{user.profile?.displayName || user.username}</span>
        <ChevronUp size={16} className={styles.chevron} />
      </button>
      
      {isOpen && <ProfileMenu user={user} />}
    </div>
  );
}
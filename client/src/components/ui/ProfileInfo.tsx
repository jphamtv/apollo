import styles from './ProfileInfo.module.css';
import { UserIcon } from 'lucide-react';

interface ProfileInfoProps {
  recipient: {
    username: string;
    email: string;
    profile: {
      displayName?: string;
      imageUrl?: string;
      bio?: string;
    };
  };
}

export default function ProfileInfo({ recipient }: ProfileInfoProps) {
  return (
    <div className={styles.container}>
      <div className={styles.userDetails}>
        <div className={styles.avatar}>
          {recipient?.profile.imageUrl ? (
            <img 
              src={recipient.profile.imageUrl} 
              alt="" 
              className={styles.avatarImage} 
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <UserIcon size={40} />
            </div>
          )}
        </div>
        <div>
          <p className={styles.displayName}>{recipient.profile.displayName}</p>
          <p className={styles.username}>@{recipient.username}</p>
        </div>
      </div>
      <div className={styles.bio}>
          {recipient.profile.bio}
      </div>
    </div>
  );
}
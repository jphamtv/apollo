import styles from './ProfileInfo.module.css';
import { UserIcon } from 'lucide-react';

interface ProfileInfoProps {
  user: {
    username: string;
    email: string;
    profile: {
      displayName?: string;
      imageUrl?: string;
      bio?: string;
    };
  };
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <div className={styles.container}>
      <div className={styles.userDetails}>
        <div className={styles.avatar}>
          {user?.profile.imageUrl ? (
            <img 
              src={user.profile.imageUrl} 
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
          <p className={styles.displayName}>{user.profile.displayName}</p>
          <p className={styles.username}>@{user.username}</p>
        </div>
      </div>
      <div className={styles.bio}>
          {user.profile.bio}
      </div>
    </div>
  );
}
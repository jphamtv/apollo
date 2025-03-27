import { useAuth } from '../../../hooks/useAuth';
import { useNavigation } from '../../../hooks/useNavigation';
import ThemeToggle from './ThemeToggle';
import styles from './ProfileMenu.module.css';

interface ProfileMenuProps {
  user: {
    username: string;
    email?: string;
    profile: {
      displayName: string;
      imageUrl?: string;
    };
  };
  onClose: () => void;
}

export default function ProfileMenu({ user, onClose }: ProfileMenuProps) {
  const { logout } = useAuth();
  const { openSettings } = useNavigation();
  const initials = user.profile.displayName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const handleSettingsClick = () => {
    openSettings();
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className={styles.container}>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          {user.profile.imageUrl ? (
            <img
              src={user.profile.imageUrl}
              alt=""
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.initials}>{initials}</span>
          )}
        </div>
        <div className={styles.userDetails}>
          <p className={styles.username}>@{user.username}</p>
          <p className={styles.email}>{user.email || 'No email'}</p>
        </div>
      </div>

      <div className={styles.menuItems}>
        <div className={styles.menuItem}>
          <ThemeToggle />
        </div>
        <button onClick={handleSettingsClick} className={styles.menuItem}>
          Settings
        </button>
        <button onClick={handleLogout} className={styles.menuItem}>
          Log Out
        </button>
      </div>
    </div>
  );
}

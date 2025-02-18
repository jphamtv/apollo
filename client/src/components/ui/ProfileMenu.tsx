import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../contexts/NavigationContext';
import styles from './ProfileMenu.module.css';

interface ProfileMenuProps {
  user: {
    username: string;
    email: string;
    profile?: {
      displayName?: string;
      imageUrl?: string;
    };
  };
  onClose: () => void;
}

export default function ProfileMenu({ user, onClose }: ProfileMenuProps) {
  const { logout } = useAuth();
  const { navigateToSettings } = useNavigation();
  const initial = user.profile?.displayName?.charAt(0).toUpperCase() || '';

  const handleSettingsClick = () => {
    navigateToSettings();
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className={styles.menu}>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          {user.profile?.imageUrl ? (
            <img src={user.profile.imageUrl} alt="" className={styles.avatarImage} />
          ) : (
            initial
          )}
        </div>
        <div className={styles.userDetails}>
          <p className={styles.username}>@{user.username}</p>
          <p className={styles.email}>{user.email}</p>
        </div>
      </div>

      <div className={styles.menuItems}>
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
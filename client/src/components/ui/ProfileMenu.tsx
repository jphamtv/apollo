import { useState } from 'react';
import styles from './ProfileMenu.module.css';

interface ProfileMenuProps {
  user: {
    username: string;
    email: string;
    profile?: {
      displayName?: string;
      imageUrl?: string;
    };
  }
}

export default function ProfileMenu({ user }: ProfileMenuProps) {
  const [displayName, setDisplayName] = useState(user.profile?.displayName || '');
  const initial = user.profile?.displayName?.charAt(0).toUpperCase() || '';

  return (
    <div className={styles.menu}>
      {/* User Info */}
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

      <div className={styles.section}>
        {/* Display Name Form */}
        <label htmlFor="displayName">Display name:</label>
        <input
          type="text"
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={styles.input}
          placeholder={user.profile?.displayName || ''}
        />
        
        {/* Image Upload */}
        <label>Image Profile:</label>
        <button className={styles.uploadButton}>
          {user.profile?.imageUrl ? 'Replace Image' : 'Upload Image'}
        </button>
        {user.profile?.imageUrl && (
          <button className={styles.removeButton}>
            Remove Image
          </button>
        )}
      </div>

      {/* Logout */}
      <button className={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
}
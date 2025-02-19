import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from './Modal';
import styles from './SettingsModal.module.css';
import { User as UserIcon } from 'lucide-react';

export default function SettingsModal() {
  const { user, updateProfile } = useAuth();
  const { isSettingsOpen, closeSettings } = useNavigation();
  const [displayName, setDisplayName] = useState(user?.profile?.displayName || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        displayName,
        bio,
      });
      closeSettings();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isSettingsOpen} onClose={closeSettings}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Profile Settings</h1>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.imageSection}>
            <div className={styles.avatar}>
              {user?.profile?.imageUrl ? (
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
            <div className={styles.imageControls}>
              <input
                type="file"
                id="image"
                accept="image/*"
                className={styles.fileInput}
              />
              <label htmlFor="image" className={styles.uploadButton}>
                {user?.profile?.imageUrl ? 'Change Image' : 'Upload Image'}
              </label>
              {user?.profile?.imageUrl && (
                <button
                  type="button"
                  onClick={() => {/* Handle image removal */}}
                  className={styles.removeButton}
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="displayName">Display Name</label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.textarea}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Update Profile'}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
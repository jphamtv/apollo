import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.profile?.displayName || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('bio', bio);
      if (image) {
        formData.append('image', image);
      }

      await updateProfile(formData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile Settings</h1>
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
                {user?.profile?.displayName?.charAt(0).toUpperCase() || 
                 user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.imageControls}>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
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
  );
}
import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from './Modal';
import { logger } from '../../utils/logger';
import styles from './SettingsModal.module.css';
import { User as UserIcon, Trash2Icon } from 'lucide-react';

export default function SettingsModal() {
  const { user, updateProfile, uploadProfileImage, deleteProfileImage } = useAuth();
  const { isSettingsOpen, closeSettings } = useNavigation();
  const [displayName, setDisplayName] = useState<string>(user?.profile.displayName || '');
  const [bio, setBio] = useState<string>(user?.profile.bio || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profile.imageUrl || null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      logger.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);

    // Upload the image immediately
    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      await uploadProfileImage(formData);
    } catch (err) {
      logger.error('Failed to upload image:', err);
      setImagePreview(user?.profile.imageUrl || null); // Revert preview on error      
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!imagePreview) return;

    setIsUploading(true);
    try {
      await deleteProfileImage();
      setImagePreview(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      logger.error('Failed to remove image:', err);
    } finally {
      setIsUploading(false);
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
              {isUploading && (
                <div className={styles.uploading}>
                  <span>Uploading...</span>
                </div>
              )}

              {(!isUploading && imagePreview) ? (
                <div className={styles.imagePreviewContainer}>
                  <img 
                    src={imagePreview} 
                    alt="" 
                    className={styles.avatarImage} 
                  />
                </div>
              ) : (!isUploading) ? (
                <div className={styles.avatarPlaceholder}>
                  <UserIcon size={60} strokeWidth={1}/>
                </div>                  
              ) : null}
            </div>
            <div className={styles.imageControls}>
              <input
                ref={fileInputRef}
                type="file"
                id="image"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className={styles.fileInput}
                onChange={handleImageChange}
                disabled={isUploading}
              />
              <label htmlFor="image" className={styles.uploadButton} aria-disabled={isUploading}>
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={styles.removeButton}
                  disabled={isUploading}
                >
                  <Trash2Icon size={16} strokeWidth={1}/>
                  Remove Image
                </button>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="displayName">Full Name</label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your full name"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="bio">What do you want people to know about you?</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.textarea}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <div className={styles.buttonContainer}>
            <Button
              type="submit"
              disabled={isLoading}
              className={styles.button}
            >
              {isLoading ? 'Saving...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
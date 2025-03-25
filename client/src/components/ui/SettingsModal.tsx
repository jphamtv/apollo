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
  const {
    user,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
    deleteUserAccount,
  } = useAuth();
  const { isSettingsOpen, closeSettings } = useNavigation();
  const [displayName, setDisplayName] = useState<string>(
    user?.profile.displayName || ''
  );
  const [bio, setBio] = useState<string>(user?.profile.bio || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.profile.imageUrl || null
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
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

  const handleDeleteAccount = async () => {
    try {
      await deleteUserAccount(); // AuthProvider handles removing token and setting user to null
    } catch (error) {
      logger.error('Failed to delete account:', error);
      setShowDeleteConfirmation(false);
    }
  };

  const openDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
  };

  return (
    <Modal isOpen={isSettingsOpen} onClose={closeSettings}>
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.title}>Profile</h2>
          <div className={styles.imageSection}>
            <div className={styles.avatar}>
              {isUploading && (
                <div className={styles.uploading}>
                  <span>Uploading...</span>
                </div>
              )}

              {!isUploading && imagePreview ? (
                <div className={styles.imagePreviewContainer}>
                  <img
                    src={imagePreview}
                    alt=""
                    className={styles.avatarImage}
                  />
                </div>
              ) : !isUploading ? (
                <div className={styles.avatarPlaceholder}>
                  <UserIcon size={60} strokeWidth={1} />
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
              <label
                htmlFor="image"
                className={styles.uploadButton}
                aria-disabled={isUploading}
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={styles.removeButton}
                  disabled={isUploading}
                >
                  <Trash2Icon size={16} strokeWidth={1} />
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
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Enter your full name"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="bio">
              What do you want people to know about you?
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
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

        <div className={styles.dangerZone}>
          <h2 className={styles.title}>Account Management</h2>
          <p className={styles.dangerText}>
            Deleting your account will permanently remove all your data,
            including all conversations and messages. Other users will no longer
            be able to see conversations with you. This action cannot be undone.
          </p>
          <Button
            onClick={openDeleteConfirmation}
            variant="danger"
            className={styles.deleteButton}
            aria-label="Delete account"
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirmation && (
        <Modal
          isOpen={showDeleteConfirmation}
          onClose={closeDeleteConfirmation}
          hideCloseButton
        >
          <div className={styles.confirmationModal}>
            <h3 id="modal-title">Delete Account</h3>
            <p>
              Are you sure you want to permanently delete your account? This
              will delete all conversations you are part of. Other users will no
              longer be able to see any messages you've sent. This action cannot
              be undone.
            </p>
            <div className={styles.modalActions}>
              <Button
                onClick={closeDeleteConfirmation}
                variant="secondary"
                tabIndex={0}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                variant="danger"
                tabIndex={0}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}

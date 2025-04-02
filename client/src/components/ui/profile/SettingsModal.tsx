import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigation } from '../../../hooks/useNavigation';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { logger } from '../../../utils/logger';
import styles from './SettingsModal.module.css';
import { User as UserIcon, Trash2Icon, CheckCircle } from 'lucide-react';

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
  const [textChanged, setTextChanged] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Store original values for comparison
  const [originalDisplayName, setOriginalDisplayName] = useState(user?.profile.displayName || '');
  const [originalBio, setOriginalBio] = useState(user?.profile.bio || '');
  
  // Reset form values when modal opens/closes
  useEffect(() => {
    if (isSettingsOpen && user) {
      // Reset to current user values when modal opens
      setDisplayName(user.profile.displayName || '');
      setBio(user.profile.bio || '');
      setOriginalDisplayName(user.profile.displayName || '');
      setOriginalBio(user.profile.bio || '');
      setTextChanged(false);
    }
  }, [isSettingsOpen, user]);
  
  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textChanged) return;
    
    setIsLoading(true);

    try {
      // Only send text fields to the backend - image updates are handled separately
      await updateProfile({
        displayName,
        bio
      });
      
      // Update the original values to match current state after successful save
      setOriginalDisplayName(displayName);
      setOriginalBio(bio);
      setTextChanged(false);
      setSaveSuccess(true);
      
      // Success message will auto-hide via useEffect
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

  // Cancel handler for text changes
  const handleCancel = useCallback(() => {
    // Reset form to original values
    setDisplayName(originalDisplayName);
    setBio(originalBio);
    setTextChanged(false);
  }, [originalDisplayName, originalBio]);

  // Custom close handler to check for unsaved changes
  const handleClose = useCallback(() => {
    // If there are unsaved changes, reset the form
    if (textChanged) {
      handleCancel();
    }
    closeSettings();
  }, [textChanged, handleCancel, closeSettings]);

  return (
    <Modal isOpen={isSettingsOpen} onClose={handleClose}>
      <div className={styles.container}>
        {/* Image Section - Completely separate from text form */}
        <h2 className={styles.title}>Settings</h2>
        <div className={styles.profileSection}>
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
        </div>

        {/* Text Profile Form - Separate section */}
        <div className={styles.profileSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="displayName">Display Name</label>
              <Input
                id="displayName"
                value={displayName}
                onChange={e => {
                  setDisplayName(e.target.value);
                  setTextChanged(
                    e.target.value !== originalDisplayName || bio !== originalBio
                  );
                }}
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
                onChange={e => {
                  setBio(e.target.value);
                  setTextChanged(
                    displayName !== originalDisplayName || e.target.value !== originalBio
                  );
                }}
                className={styles.textarea}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            <div className={styles.buttonContainer}>
              {saveSuccess && (
                <div className={styles.successMessage}>
                  <CheckCircle size={16} />
                  Profile updated!
                </div>
              )}
              
              <div className={styles.buttonGroup}>
                {textChanged && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading || !textChanged}
                  className={styles.button}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className={styles.dangerZone}>
          <h2 className={styles.dangerTitle}>Delete Account</h2>
          <p className={styles.dangerText}>
            Deleting your account will permanently remove all your data,
            including all conversations and messages. Other users will no longer
            be able to see conversations with you. This action cannot be undone.
          </p>
          <Button
            onClick={openDeleteConfirmation}
            variant="danger"
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

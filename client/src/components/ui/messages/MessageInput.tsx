import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Image, X } from 'lucide-react';
import heic2any from 'heic2any';
import Button from '../common/Button';
import styles from './MessageInput.module.css';

interface Props {
  conversationId?: string;
  onSendMessage: (text: string, imageFile: File | null) => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({
  conversationId,
  onSendMessage,
  isDisabled,
  isSending,
  onTyping,
}: Props) {
  const [messageText, setMessageText] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset textarea height when message is sent or conversation changes
  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Reset input when conversation changes
  useEffect(() => {
    setMessageText('');
    resetTextareaHeight();
  }, [conversationId]);

  // Reset input when message is empty
  useEffect(() => {
    if (messageText === '') {
      resetTextareaHeight();
    }
  }, [messageText]);

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !imageFile) || isDisabled) {
      return;
    }

    // Store current values in case of error
    const currentText = messageText;
    const currentImageFile = imageFile;

    try {
      // Clear the input and image preview immediately
      setImageFile(null);
      setImagePreview(null);
      setMessageText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Send the message
      await onSendMessage(currentText, currentImageFile);

      // Stop typing indicator
      onTyping(false);
    } catch {
      // On error, restore the previous message text and image
      setMessageText(currentText);
      
      // Only restore image file if it was part of the failed message
      if (currentImageFile) {
        setImageFile(currentImageFile);
        
        // Create a new preview from the file
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(currentImageFile);
      }
      
      // Error is handled by parent component
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      // User is typing
      onTyping(true);
    }
  };

  const autoResizeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    // Update the message state
    setMessageText(textarea.value);

    // Reset height to auto
    textarea.style.height = 'auto';

    // Set the height based on the new content (with a max height)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;

    // Send typing indicator
    onTyping(textarea.value.trim().length > 0);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    // Check file size
    if (file.size > 20 * 1024 * 1024) {
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // This error will be caught by onSendMessage in the parent component
      throw new Error("Image too large. Please select an image under 20MB.");
    }
    
    try {
      setIsUploading(true);

      // Check if the file is HEIC format
      if (file.type === 'image/heic') {
        // Convert HEIC to JPEG for preview
        const jpegBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        });
        
        // Create a new File object (for sending to the server)
        const convertedFile = new File(
          [jpegBlob as Blob], 
          file.name.replace(/\.heic$/i, '.jpg'), 
          { type: 'image/jpeg' }
        );
        
        // Update the file reference for sending
        setImageFile(convertedFile);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(jpegBlob as Blob);
      } else {
        // Regular image handling
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
        setImageFile(file);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setIsUploading(false);
      throw new Error("Failed to process image. Please try again or use a different format.");
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={styles.inputContainer}
      role="region"
      aria-label="Message input"
    >
    {(imagePreview || isUploading) && (
      <div className={styles.imagePreviewContainer}>
        {isUploading ? (
          <div className={styles.uploadingContainer}>
            <span>Uploading...</span>
          </div>
        ) : (
          <>
            <img
              src={imagePreview || ''}
              className={styles.imagePreview}
              alt="Preview"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className={styles.removeImageButton}
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
    )}

      <textarea
        ref={textareaRef}
        value={messageText}
        onChange={autoResizeTextArea}
        onKeyDown={handleKeyPress}
        onPaste={() => onTyping(true)}
        placeholder="Type a message..."
        className={styles.messageInput}
        rows={1}
        disabled={isDisabled || isSending}
        aria-label="Message text input"
        aria-multiline="true"
        aria-disabled={isDisabled || isSending}
      />

      <div className={styles.inputActions}>
        <input
          ref={fileInputRef}
          type="file"
          id="messageImage"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif"
          className={styles.fileInput}
          onChange={handleImageChange}
          disabled={isDisabled || isSending}
        />

        <label
          htmlFor="messageImage"
          className={styles.imageButton}
          aria-disabled={isDisabled || isSending}
        >
          <Image size={20} strokeWidth={1} />
        </label>

        <Button
          className={styles.sendButton}
          onClick={handleSendMessage}
          disabled={
            isDisabled || isSending || (!messageText.trim() && !imageFile)
          }
          size="small"
          aria-label="Send message"
        >
          <ArrowUp size={20} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}

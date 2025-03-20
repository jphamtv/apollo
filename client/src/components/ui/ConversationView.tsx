import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { useMessaging } from '../../hooks/useMessaging';
import { useSocket } from '../../hooks/useSocket';
import NewConversationHeader from './NewConversationHeader';
import Button from './Button';
import ProfileInfo from './ProfileInfo';
import Modal from './Modal';
import TypingIndicators from './TypingIndicators';
import BotBadge from './BotBadge';
import { ArrowUp, Trash2, ChevronDown, Image, X } from 'lucide-react';
import MenuButton from './MenuButton';
import styles from './ConversationView.module.css';
import { User } from '../../types/user';
import { Conversation } from '../../types/conversation';
import { Message } from '../../types/message';
import { formatMessageFeedTimestamp } from '../../utils/formatTime';

interface Props {
  conversation?: Conversation;
}

export default function ConversationView({ conversation }: Props) {
  const { user } = useAuth();
  const { messages, sendMessage, sendMessageWithImage, loadMessages, clearMessages, createConversation, deleteConversation, markConversationAsRead, isCreatingConversation } = useMessaging();
  const { isNewConversation, navigateToConversation } = useNavigation();
  const { handleTyping, getTypingUsers } = useSocket();

  const [newMessage, setNewMessage] = useState('');
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [profileInfoPosition, setProfileInfoPosition] = useState({ top: 0, left: 0 });
  const [landscapeImages, setLandscapeImages] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileInfoRef = useRef<HTMLDivElement>(null);
  const displayProfileLinkRef = useRef<HTMLAnchorElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRecipient = conversation ?
    conversation.participants.find(p => p.userId !== user?.id)?.user : null;
  
  // Get typing users for the current conversation
  const typingUsers = conversation ? getTypingUsers(conversation.id) : [];

  // Filter out current user from typing indicators
  const otherTypingUsers = typingUsers.filter(id => id !== user?.id);

  // Get display name of the first typing user
  const typingUserName = otherTypingUsers.length > 0 && activeRecipient
    ? activeRecipient.profile.displayName || activeRecipient.username
    : '';
  
  // Add typing indicators to dependencies to auto-scroll when they appear/disappear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages, otherTypingUsers]);

  useEffect(() => {
    if (isNewConversation) {
      clearMessages();
    } else if (conversation) {
      loadMessages(conversation.id);
    }
  }, [conversation, isNewConversation, loadMessages, clearMessages]);

  useEffect(() => {
    if (conversation) {
      loadMessages(conversation.id);
    }
  }, [conversation, loadMessages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileInfoRef.current &&
        !profileInfoRef.current.contains(event.target as Node) &&
        !displayProfileLinkRef.current?.contains(event.target as Node)
      ) {
        setShowProfileInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (newMessage === '' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }    
  }, [newMessage]);

  useEffect(() => {
    if (conversation && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [conversation]);

  useEffect(() => {
    // Reset input when conversation changes
    setNewMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [conversation?.id]);

  useEffect(() => {
    if (conversation && !isNewConversation) {
      // Mark as read when user views the conversation
      markConversationAsRead(conversation.id);
      loadMessages(conversation.id);
    }
  }, [conversation, isNewConversation, markConversationAsRead, loadMessages]);

  const handleUserSelect = async (selected: User) => {
    if (isCreatingConversation) return;
    
    try {
      const newConversation = await createConversation(selected.id);
      navigateToConversation(newConversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !imageFile) || !conversation) {
      return;
    }

    try {
      if (imageFile) {
        setIsSendingImage(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        if (newMessage.trim()) {
          formData.append('text', newMessage.trim());
        }
        await sendMessageWithImage(conversation.id, formData);

        // Clear image preview and file after sending
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        await sendMessage(conversation.id, newMessage.trim());
      }
      setNewMessage('');

      // Stop typing indicator when message is sent
      if (conversation) {
        handleTyping(conversation.id, false);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSendingImage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      // User is typing something other than Enter
      handleTypingIndicator(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInfoClick = () => {
    // Get the position of the link that was clicked
    if (displayProfileLinkRef.current) {
      const rect = displayProfileLinkRef.current.getBoundingClientRect();
      // Position just below the name with a small offset for the triangle
      setProfileInfoPosition({
        top: rect.bottom + window.scrollY + 8, // Add extra space for the triangle
        left: Math.max(rect.left + window.scrollX - 20, 10) // Offset so triangle points to middle of name
      });
    }
    setShowProfileInfo(prev => !prev);
  };
  
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!conversation) return;

    try {
      await deleteConversation(conversation.id);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete conversation: ', err);
    }
  };

  const handleTypingIndicator = (isTyping: boolean) => {
    if (!conversation) return;

    handleTyping(conversation.id, isTyping);
  };

  const autoResizeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    
    // First update the message state
    setNewMessage(textarea.value);
    
    // Reset height to auto so scrollHeight is correctly calculated based on content
    textarea.style.height = 'auto';

    // Force a reflow to ensure the browser recalculates dimensions
    // textarea.scrollHeight;
    
    // Then set the height based on the new content (with a max height of 160px)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;

    // Send typing indicator when the user is typing
    handleTypingIndicator(textarea.value.trim().length > 0);
  };

  const shouldShowTimestamp = (currentMsg: Message, prevMsg: Message | null): boolean => {
    if (!prevMsg) return true; // Always show for first message
    
    const currentTime = new Date(currentMsg.createdAt);
    const prevTime = new Date(prevMsg.createdAt);
    
    // Show timestamp if more than 2 hours between messages
    return (currentTime.getTime() - prevTime.getTime()) > 2 * 60 * 60 * 1000;
  };

  const shouldShowDateDivider = (currentMsg: Message, prevMsg: Message | null): boolean => {
    if (!prevMsg) return true; // Always show date for first message
    
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    
    return currentDate !== prevDate;
  };
  
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, messageId: string) => {
    const img = e.target as HTMLImageElement;
    if (img.naturalWidth > img.naturalHeight) {
      setLandscapeImages(prev => new Set(prev).add(messageId));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        {/* Mobile menu button */}
        <div className={styles.mobileMenuContainer}>
          <MenuButton />
        </div>
        
        <div className={styles.label}>
          To:
        </div>
        
        {isNewConversation ? (
          <div className={styles.headerContent}>
            <NewConversationHeader 
              onUserSelect={handleUserSelect} 
              disabled={isCreatingConversation || false}
            />
          </div>
        ) : (
          <div className={styles.headerContent}>
            <div className={styles.activeConversationHeader}>
              {conversation && (
                <a ref={displayProfileLinkRef} onClick={handleInfoClick} className={styles.profileLink}>
                  <div className={styles.recipientName}>
                    {activeRecipient?.profile.displayName || 
                    activeRecipient?.username || 
                    'Unknown User'}
                    {activeRecipient?.isBot && <BotBadge />}
                  </div>
                  <ChevronDown size={16} className={styles.chevronIcon} strokeWidth={1}/>
                </a>
              )}
              <div className={styles.actions}>
                <button onClick={handleDeleteClick}>
                  <Trash2 size={20} strokeWidth={1} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showProfileInfo && activeRecipient && (
        <div 
          ref={profileInfoRef} 
          className={styles.profileInfoContainer}
          style={{
            position: 'absolute',
            top: `${profileInfoPosition.top}px`,
            left: `${profileInfoPosition.left}px`,
          }}
        >
          <ProfileInfo recipient={activeRecipient} />
        </div>
      )}
      
      <div className={styles.messagesContainer}>
        {Array.isArray(messages) && messages.length > 0 && messages.map((message, index) => {
          const isImageOnly = message.imageUrl && !message.text;
          const prevMessage = index > 0 ? messages[index - 1] : null;
          
          // Check if we need a date divider or timestamp
          const showDateDivider = shouldShowDateDivider(message, prevMessage);
          const showTimestamp = !showDateDivider && shouldShowTimestamp(message, prevMessage);
          
          return (
            <React.Fragment key={message.id}>
              {/* Date divider with time */}
              {showDateDivider && (
                <div className={styles.timestampDivider}>
                  <span className={styles.timestampText}>
                    {formatMessageFeedTimestamp(message.createdAt)}
                  </span>
                </div>
              )}
              
              {/* Time separator with date */}
              {showTimestamp && (
                <div className={styles.timestampDivider}>
                  <span className={styles.timestampText}>
                    {formatMessageFeedTimestamp(message.createdAt)}
                  </span>
                </div>
              )}
              
              {/* Message content */}
              <div 
                className={`${styles.message} ${
                  message.senderId === user?.id ? styles.sent : styles.received
                } ${isImageOnly ? styles.imageOnly : ''}`}
              >
                {isImageOnly ? (
                  <div className={`${styles.messageImageOnly} ${landscapeImages.has(message.id) ? styles.landscape : ''}`}>
                    <img
                      src={message.imageUrl || undefined}
                      alt=""
                      onLoad={(e) => handleImageLoad(e, message.id)}
                    />
                  </div>
                ) : (
                  <div className={styles.messageContent}>
                    {message.imageUrl && (
                      <div className={`${styles.messageImage} ${landscapeImages.has(message.id) ? styles.landscape : ''}`}>
                        <img
                          src={message.imageUrl}
                          alt=""
                          onLoad={(e) => handleImageLoad(e, message.id)}
                        />
                      </div>
                    )}
                    {message.text}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}

        {otherTypingUsers.length > 0 && typingUserName && (
          <TypingIndicators displayName={typingUserName} />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        {imagePreview && (
          <div className={styles.imagePreviewContainer}>
            <img src={imagePreview} className={styles.imagePreview} />
            <button
              type='button'
              onClick={handleRemoveImage}
              className={styles.removeImageButton}
              aria-label='Remove image'
            >
              <X size={16} />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={newMessage}
          onChange={autoResizeTextArea}
          onKeyDown={handleKeyPress}
          onPaste={() => handleTypingIndicator(true)}
          placeholder="Type a message..."
          className={styles.messageInput}
          rows={1}
          disabled={isNewConversation || isCreatingConversation || isSendingImage}
        />

        <div className={styles.inputActions}>
          <input
            ref={fileInputRef}
            type="file"
            id='messageImage'
            accept='image/jpeg,image/png,image/gif,image/webp'
            className={styles.fileInput}
            onChange={handleImageChange}
            disabled={isNewConversation || isCreatingConversation || isSendingImage}
          />
          <label
            htmlFor="messageImage"
            className={styles.imageButton}
            aria-disabled={isNewConversation || isCreatingConversation || isSendingImage}
          >
            <Image size={24} strokeWidth={1} />
          </label>

          <Button 
            className={styles.sendButton}
            onClick={handleSendMessage}
            disabled={
              isNewConversation ||
              isCreatingConversation ||
              isSendingImage ||
              (!newMessage.trim() && !imageFile)
            }
            size='small'
            >
            <ArrowUp size={24} strokeWidth={2}/>
          </Button>
        </div>
      </div>


      {showDeleteModal && conversation && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} hideCloseButton>
          <div className={styles.confirmationModal}>
            <h3>Delete Conversation</h3>
            <p>Are you sure you want to delete this conversation? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <Button
                onClick={() => setShowDeleteModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                variant="danger"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { useMessaging } from '../../hooks/useMessaging';
import NewConversationHeader from './NewConversationHeader';
import Button from './Button';
import ProfileInfo from './ProfileInfo';
import Modal from './Modal';
import { ArrowUp, Trash2Icon, ChevronDown } from 'lucide-react';
import styles from './ConversationView.module.css';
import { User } from '../../types/user';
import { Conversation } from '../../types/conversation';

interface Props {
  conversation?: Conversation;
}

export default function ConversationView({ conversation }: Props) {
  const { user } = useAuth();
  const { messages, sendMessage, loadMessages, clearMessages, createConversation, deleteConversation, markConversationAsRead, isCreatingConversation } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isNewConversation, navigateToConversation } = useNavigation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileInfoRef = useRef<HTMLDivElement>(null);
  const displayProfileLinkRef = useRef<HTMLAnchorElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [profileInfoPosition, setProfileInfoPosition] = useState({ top: 0, left: 0 });
  const activeRecipient = conversation ?
    conversation.participants.find(p => p.userId !== user?.id)?.user : null;
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

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
    if (!newMessage.trim() || !conversation) return;

    try {
      await sendMessage(conversation.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  const autoResizeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    
    // First update the message state
    setNewMessage(textarea.value);
    
    // Reset height to auto so scrollHeight is correctly calculated based on content
    textarea.style.height = 'auto';
    
    // Then set the height based on the new content (with a max height of 160px)
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

  return (
    <div className={styles.container}>

      <div className={styles.headerContainer}>

          <div className={styles.label}>
            To:
          </div>
          {isNewConversation ? (
            <NewConversationHeader 
              onUserSelect={handleUserSelect} 
              disabled={isCreatingConversation || false}
            />
          ) : (
            <div className={styles.activeConversationHeader}>
              {conversation && (
                <a ref={displayProfileLinkRef} onClick={handleInfoClick} className={styles.profileLink}>
                  <div>
                    {activeRecipient?.profile.displayName || 
                    activeRecipient?.username || 
                    'Unknown User'}
                  </div>
                  <ChevronDown size={16} className={styles.chevronIcon} />
                </a>
              )}
              <div className={styles.actions}>
                <button onClick={handleDeleteClick}>
                  <Trash2Icon size={20}/>
                </button>
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
        {Array.isArray(messages) && messages.map(message => (
          <div 
            key={message.id}
            className={`${styles.message} ${
              message.senderId === user?.id ? styles.sent : styles.received
            }`}
          >
            <div className={styles.messageContent}>
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={newMessage}
          onChange={autoResizeTextArea}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className={styles.messageInput}
          rows={1}
          disabled={isNewConversation || (isCreatingConversation || false)}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={isNewConversation || (isCreatingConversation || false)}
          size='small'
        >
          <ArrowUp size={24} />
        </Button>
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
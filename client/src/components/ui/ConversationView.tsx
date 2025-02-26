import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { useMessaging } from '../../hooks/useMessaging';
import NewConversationHeader from './NewConversationHeader';
import Button from './Button';
import ProfileInfo from './ProfileInfo';
import Model from './Modal';
import { ArrowUp, InfoIcon, Trash2Icon } from 'lucide-react';
import styles from './ConversationView.module.css';
import { User } from '../../types/user';
import { Conversation } from '../../types/conversation';

interface Props {
  conversation?: Conversation;
}

export default function ConversationView({ conversation }: Props) {
  const { user } = useAuth();
  const { messages, sendMessage, loadMessages, clearMessages, createConversation, deleteConversation, isCreatingConversation } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isNewConversation, navigateToConversation } = useNavigation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileInfoRef = useRef<HTMLDivElement>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
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
        !infoButtonRef.current?.contains(event.target as Node)
      ) {
        setShowProfileInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                <div>
                  {activeRecipient?.profile.displayName || 
                  activeRecipient?.username || 
                  'Unknown User'}
                </div>
              )}
              <div className={styles.actions}>
                <button ref={infoButtonRef} onClick={handleInfoClick}>
                  <InfoIcon size={20}/>
                </button>
                <button onClick={handleDeleteClick}>
                  <Trash2Icon size={20}/>
                </button>
              </div>
            </div>
          )}
      </div>
      
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
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
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

      {showProfileInfo && activeRecipient && (
        <div ref={profileInfoRef}>
          <ProfileInfo recipient={activeRecipient} />
        </div>
      )}

      {showDeleteModal && conversation && (
        <Model isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
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
        </Model>
      )}
    </div>
  );
}
import { useMessages } from '../../hooks/useMessages';import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useConversations } from '../../hooks/useConversations';
import NewConversationHeader from './NewConversationHeader';
import Button from './Button';
import styles from './ConversationView.module.css';

interface User {
  id: string;
  username: string;
  profile?: {
    displayName: string;
    imageUrl?: string;
  };
}

interface Props {
  conversationId?: string;
}

export default function ConversationView({ conversationId }: Props) {
  const { user } = useAuth();
  const { createConversation, activeConversation } = useConversations();
  const { messages, sendMessage, loadMessages } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [isNewConversation, setIsNewConversation] = useState(!conversationId);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation, loadMessages]);

  useEffect(() => {
    console.log('State change - activeConversation:', activeConversation);
    console.log('State change - isNewConversation:', isNewConversation);
    console.log('State change - isCreatingConversation:', isCreatingConversation);
    // If we have an active conversation, we're no longer in new conversation mode
    if (activeConversation) {
      setIsNewConversation(false);
    } else if (conversationId) {
      setIsNewConversation(false);
    } else {
      setIsNewConversation(true);
    }
  }, [conversationId, activeConversation]);

  const handleUserSelect = async (selected: User) => {
    if (isCreatingConversation) return;
    
    try {
      setIsCreatingConversation(true);
      await createConversation(selected.id);
      setIsNewConversation(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const getOtherParticipant = () => {
    if (!activeConversation || !user) return null;
    return activeConversation.participants
      .find(p => p.userId !== user.id)?.user;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await sendMessage(activeConversation.id, newMessage.trim());
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

  return (
    <div className={styles.container}>
      {isNewConversation ? (
        <NewConversationHeader 
          onUserSelect={handleUserSelect} 
          disabled={isCreatingConversation}
        />
      ) : (
        <div className={styles.header}>
          {activeConversation && (
            <div className={styles.participantInfo}>
              <h3>
                {getOtherParticipant()?.profile?.displayName || 
                 getOtherParticipant()?.username || 
                 'Unknown User'}
              </h3>
            </div>
          )}
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
      </div>

      <div className={styles.inputContainer}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className={styles.messageInput}
          rows={1}
          disabled={isNewConversation || isCreatingConversation}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={isNewConversation || isCreatingConversation}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
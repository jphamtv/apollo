import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useConversations } from '../../hooks/useConversations';
import NewConversationHeader from './NewConversationHeader';
import Button from './Button';
import styles from './ConversationView.module.css';

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

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
  onMessageSent?: () => void;
}

export default function ConversationView({ conversationId, onMessageSent }: Props) {
  const { user } = useAuth();
  const { createConversation, activeConversation } = useConversations();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isNewConversation, setIsNewConversation] = useState(!conversationId);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  useEffect(() => {
    // If conversationId changes, update isNewConversation
    setIsNewConversation(!conversationId);
  }, [conversationId]);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      // TODO: Send message API call coming in next step
      setNewMessage('');
      onMessageSent?.();
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
          {/* TODO: Add conversation header with participant info */}
        </div>
      )}
      
      <div className={styles.messagesContainer}>
        {messages.map(message => (
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
          disabled={!activeConversation || isNewConversation}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={!activeConversation || isNewConversation}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
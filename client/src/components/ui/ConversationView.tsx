import { useMessages } from '../../hooks/useMessages';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useConversations } from '../../hooks/useConversations';
import { useNavigation } from '../../contexts/NavigationContext';
import NewConversationHeader from './NewConversationHeader';
import Button from './Button';
import styles from './ConversationView.module.css';
import { User } from '../../types/user';
import { Conversation } from '../../types/conversation';

interface Props {
  conversation?: Conversation;
}

export default function ConversationView({ conversation }: Props) {
  const { user } = useAuth();
  const { messages, sendMessage, loadMessages, clearMessages } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const { createConversation } = useConversations();
  const { isNewConversation, navigateToConversation } = useNavigation();

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

  const handleUserSelect = async (selected: User) => {
    if (isCreatingConversation) return;
    
    try {
      setIsCreatingConversation(true);
      const newConversation = await createConversation(selected.id);
      navigateToConversation(newConversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const getOtherParticipant = () => {
    if (!conversation || !user) return null;
    return conversation.participants
      .find(p => p.userId !== user.id)?.user;
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

  return (
    <div className={styles.container}>
      {isNewConversation ? (
        <NewConversationHeader 
          onUserSelect={handleUserSelect} 
          disabled={isCreatingConversation}
        />
      ) : (
        <div className={styles.header}>
          {conversation && (
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
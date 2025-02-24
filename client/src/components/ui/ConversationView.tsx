import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { useMessaging } from '../../hooks/useMessaging';
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
  const { messages, sendMessage, loadMessages, clearMessages, createConversation, isCreatingConversation } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const { isNewConversation, navigateToConversation } = useNavigation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleUserSelect = async (selected: User) => {
    if (isCreatingConversation) return;
    
    try {
      const newConversation = await createConversation(selected.id);
      navigateToConversation(newConversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
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
      <div className={styles.headerWrapper}>
        <div className={styles.label}>To:</div>
        {isNewConversation ? (
          <NewConversationHeader 
            onUserSelect={handleUserSelect} 
            disabled={isCreatingConversation || false}
          />
        ) : (
          <div>
            {conversation && (
              <div>
                {getOtherParticipant()?.profile?.displayName || 
                getOtherParticipant()?.username || 
                'Unknown User'}
              </div>
            )}
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
        >
          Send
        </Button>
      </div>
    </div>
  );
}
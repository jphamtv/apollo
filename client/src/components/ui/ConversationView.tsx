import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isNewConversation, setIsNewConversation] = useState(!conversationId);

  const handleUserSelect = (selected: User) => {
    setSelectedUser(selected);
    // TODO: If user has existing conversation, load it
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // TODO: Send message API call
      // If new conversation:
      // 1. Create conversation
      // 2. Send message
      // If existing conversation:
      // 1. Just send message

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
      {isNewConversation && (
        <NewConversationHeader onUserSelect={handleUserSelect} />
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
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
}
import styles from './ConversationsSidebar.module.css';
import ConversationItem from './ConversationItem';
import NewChatButton from './NewChatButton';
import ProfileButton from './ProfileButton';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import { Conversation } from '../../types/conversation';

interface Props {
  onNewChat: () => void;
  conversations: Conversation[];
  loadConversations: () => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  activeConversation: Conversation | null;
}

export default function ConversationsSidebar({ 
  onNewChat,
  conversations = [], 
  loadConversations,
  selectConversation,
  activeConversation
}: Props) {
  const { user } = useAuth();
  
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Don't render until we have user with profile data
  if (!user?.profile) return null;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };
  
  const handleConversationClick = (conversation: Conversation) => {
    selectConversation(conversation);
  };
  
  return (
    <aside className={styles.container}>
      <header className={styles.header}>
        <h2>Messages App</h2>
      </header>
      
      <main className={styles.main}>
        <NewChatButton onClick={onNewChat} />
        {conversations?.map(conversation => {
          // Find the other participant (for 1:1 chats)
          const otherParticipant = conversation.participants.find(
            p => p.user.id !== user.id
          )?.user;

          if (!otherParticipant) return null;

          return (
            <ConversationItem
              key={conversation.id}
              displayName={otherParticipant.profile?.displayName ?? otherParticipant.username}
              lastMessage={conversation.lastMessage?.text ?? 'No messages yet'}
              timestamp={conversation.lastMessage ? 
                formatTimestamp(conversation.lastMessage.createdAt) : 
                formatTimestamp(conversation.createdAt)
              }
              isActive={activeConversation?.id === conversation.id}
              onClick={() => handleConversationClick(conversation)}
            />
          );
        })}
      </main>
      
      <footer className={styles.footer}>
        <ProfileButton user={user} />
      </footer>
    </aside>
  );
}
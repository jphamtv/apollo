import styles from './ConversationsSidebar.module.css';
import ConversationItem from './ConversationItem';
import NewChatButton from './NewChatButton';
import ProfileButton from './ProfileButton';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { useMessaging } from '../../hooks/useMessaging';

export default function ConversationsSidebar() {
  const { user } = useAuth();
  const { 
    activeConversation, 
    navigateToConversation,
    startNewConversation
  } = useNavigation();
  const { conversations } = useMessaging();

  if (!user?.profile) return null;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };
  
  return (
    <aside className={styles.container}>
      <header className={styles.header}>
        <h2>Messages App</h2>
      </header>
      
      <main className={styles.main}>
        <NewChatButton onClick={startNewConversation} />
        {conversations?.map(conversation => {
          const otherParticipant = conversation.participants.find(
            p => p.user.id !== user.id
          )?.user;

          if (!otherParticipant) return null;

          return (
            <ConversationItem
              key={conversation.id}
              displayName={otherParticipant.profile.displayName ?? otherParticipant.username}
              lastMessage={conversation.lastMessage?.text ?? 'No messages yet'}
              timestamp={conversation.lastMessage ? 
                formatTimestamp(conversation.lastMessage.createdAt) : 
                formatTimestamp(conversation.createdAt)
              }
              isActive={activeConversation?.id === conversation.id}
              onClick={() => navigateToConversation(conversation)}
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
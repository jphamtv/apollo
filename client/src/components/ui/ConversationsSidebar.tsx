import styles from './ConversationsSidebar.module.css';
import ConversationItem from './ConversationItem';
import NewChatButton from './NewChatButton';
import ProfileButton from './ProfileButton';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { useMessaging } from '../../hooks/useMessaging';
import { formatMessageTime } from '../../utils/formatTime';

export default function ConversationsSidebar() {
  const { user } = useAuth();
  const { 
    activeConversation, 
    navigateToConversation,
    startNewConversation
  } = useNavigation();
  const { conversations } = useMessaging();

  if (!user?.profile) return null;

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
                formatMessageTime(conversation.lastMessage.createdAt) : 
                formatMessageTime(conversation.createdAt)
              }
              isActive={activeConversation?.id === conversation.id}
              hasUnread={conversation.hasUnread}
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
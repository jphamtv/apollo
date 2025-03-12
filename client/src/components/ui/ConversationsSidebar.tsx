import styles from './ConversationsSidebar.module.css';
import ConversationItem from './ConversationItem';
import NewChatButton from './NewChatButton';
import ProfileButton from './ProfileButton';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { useMessaging } from '../../hooks/useMessaging';
import { useSidebar } from '../../hooks/useSidebar';
import { formatLastMessageTimestamp } from '../../utils/formatTime';
import { Conversation } from '../../types/conversation';

export default function ConversationsSidebar() {
  const { user } = useAuth();
  const { 
    activeConversation, 
    navigateToConversation,
    startNewConversation
  } = useNavigation();
  const { conversations } = useMessaging();
  const { isMobileSidebarOpen, closeMobileSidebar } = useSidebar();

  if (!user?.profile) return null;

  const handleConversationClick = (conversation: Conversation) => {
    navigateToConversation(conversation);
    closeMobileSidebar();
  };

  const handleNewChat = () => {
    startNewConversation();
    closeMobileSidebar();
  };

  return (
    <aside className={`${styles.container} ${isMobileSidebarOpen ? styles.open : ''}`}>
      <header className={styles.header}>
        <h2>Apollo</h2>
        <button 
          className={styles.closeButton}
          onClick={closeMobileSidebar}
          aria-label="Close menu"
        >
          <X size={24} strokeWidth={1.5} />
        </button>
      </header>
      
      <main className={styles.main}>
        <NewChatButton onClick={handleNewChat} />
        {conversations?.map(conversation => {
          const otherParticipant = conversation.participants.find(
            p => p.user.id !== user.id
          )?.user;

          if (!otherParticipant) return null;

          return (
            <ConversationItem
              key={conversation.id}
              displayName={otherParticipant.profile.displayName ?? otherParticipant.username}
              lastMessage={
                conversation.lastMessage
                  ? (
                    conversation.lastMessage.text.trim() === "" && conversation.lastMessage.hasImage
                      ? "📷 Image"
                      : conversation.lastMessage.text
                  ) : 'No messages yet'
              }
              timestamp={conversation.lastMessage ? 
                formatLastMessageTimestamp(conversation.lastMessage.createdAt) : 
                formatLastMessageTimestamp(conversation.createdAt)
              }
              isActive={activeConversation?.id === conversation.id}
              hasUnread={conversation.hasUnread}
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
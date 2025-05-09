import { useMemo } from 'react';
import ConversationItem from './ConversationItem';
import NewChatButton from './NewChatButton';
import ProfileButton from '../profile/ProfileButton';
import Logo from '../common/Logo';
import { ArrowLeftFromLine } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigation } from '../../../hooks/useNavigation';
import { useMessaging } from '../../../hooks/useMessaging';
import { useSidebar } from '../../../hooks/useSidebar';
import { formatLastMessageTimestamp } from '../../../utils/formatTime';
import { Conversation } from '../../../types/conversation';
import styles from './ConversationsSidebar.module.css';

export default function ConversationsSidebar() {
  const { user } = useAuth();
  const { activeConversation, navigateToConversation, startNewConversation } =
    useNavigation();
  const { conversations } = useMessaging();
  const { isMobileSidebarOpen, closeMobileSidebar } = useSidebar();

  // Memoize the conversations processing
  const conversationItems = useMemo(() => {
    if (!conversations || !user) return [];

    return conversations
      .map(conversation => {
        const otherParticipant = conversation.participants.find(
          p => p.user.id !== user.id
        )?.user;

        if (!otherParticipant) return null;

        return {
          id: conversation.id,
          conversation,
          displayName:
            otherParticipant.profile.displayName ?? otherParticipant.username,
          lastMessageText: conversation.lastMessage
            ? conversation.lastMessage.text.trim() === '' &&
              conversation.lastMessage.hasImage
              ? '📷 Image'
              : conversation.lastMessage.text
            : 'No messages yet',
          imageUrl: otherParticipant.profile.imageUrl ?? '',
          timestamp: conversation.lastMessage
            ? formatLastMessageTimestamp(conversation.lastMessage.createdAt)
            : formatLastMessageTimestamp(conversation.createdAt),
          isActive: activeConversation?.id === conversation.id,
          hasUnread: conversation.hasUnread,
          isBot: otherParticipant.isBot,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [conversations, user, activeConversation?.id]);

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
    <aside
      className={`${styles.container} ${isMobileSidebarOpen ? styles.open : ''}`}
      aria-label="Conversations sidebar"
      role="region"
    >
      <header className={styles.header}>
        <h1>
          <Logo height="32px" />
        </h1>
        <button
          className={styles.closeButton}
          onClick={closeMobileSidebar}
          aria-label="Close menu"
        >
          <ArrowLeftFromLine size={20} strokeWidth={1} />
        </button>
      </header>

      <main className={styles.main} aria-label="Conversation list">
        <NewChatButton onClick={handleNewChat} />
        {conversationItems.map(item => (
          <ConversationItem
            key={item.conversation.id}
            displayName={item.displayName}
            imageUrl={item.imageUrl}
            lastMessage={item.lastMessageText}
            timestamp={item.timestamp}
            isActive={item.isActive}
            hasUnread={item.hasUnread}
            isBot={item.isBot}
            onClick={() => handleConversationClick(item.conversation)}
            aria-selected={item.isActive}
            aria-current={item.isActive ? 'page' : undefined}
          />
        ))}
      </main>

      <footer className={styles.footer}>
        <ProfileButton user={user} />
      </footer>
    </aside>
  );
}

import { useEffect } from "react";
import ConversationsSidebar from "../components/ui/ConversationsSidebar";
import ConversationView from "../components/ui/ConversationView";
import Settings from "./Settings";
import EmptyConversation from "../components/ui/EmptyConversation";
import { useConversations } from "../hooks/useConversations";
import { useNavigation } from "../contexts/NavigationContext";
import styles from './MessagesLayout.module.css';

export default function MessagesLayout() {
  const { conversations, loadConversations } = useConversations();
  const { view, activeConversation, isNewConversation } = useNavigation();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const renderMainContent = () => {
    if (view === 'settings') {
      return <Settings />;
    }

    if (isNewConversation) {
      return <ConversationView />;
    }

    if (activeConversation) {
      return <ConversationView conversation={activeConversation} />;
    }

    return <EmptyConversation />;
  };

  return (
    <div className={styles.container}>
      <ConversationsSidebar 
        conversations={conversations}
      />
      <main className={styles.main}>
        {renderMainContent()}
      </main>
    </div>
  );
}
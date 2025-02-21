import { useEffect } from "react";
import ConversationsSidebar from "../components/ui/ConversationsSidebar";
import ConversationView from "../components/ui/ConversationView";
import SettingsModal from "../components/ui/SettingsModal";
import EmptyConversation from "../components/ui/EmptyConversation";
import { useMessaging } from "../hooks/useMessaging";
import { useNavigation } from '../hooks/useNavigation';
import styles from './MessagesLayout.module.css';

export default function MessagesLayout() {
  const { loadConversations } = useMessaging();
  const { activeConversation, isNewConversation } = useNavigation();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const renderMainContent = () => {
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
      <ConversationsSidebar />
      <main className={styles.main}>
        {renderMainContent()}
      </main>
      <SettingsModal />
    </div>
  );
}
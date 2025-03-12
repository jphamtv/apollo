import { useEffect, useState } from "react";
import ConversationsSidebar from "../components/ui/ConversationsSidebar";
import ConversationView from "../components/ui/ConversationView";
import SettingsModal from "../components/ui/SettingsModal";
import EmptyConversation from "../components/ui/EmptyConversation";
import SidebarOverlay from "../components/ui/SidebarOverlay";
import { useMessaging } from "../hooks/useMessaging";
import { useNavigation } from '../hooks/useNavigation';
import styles from './MessagesLayout.module.css';

export default function MessagesLayout() {
  const { loadConversations } = useMessaging();
  const { activeConversation, isNewConversation } = useNavigation();
  const [dateRefresh, setDateRefresh] = useState(new Date());
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    // Calculate time until midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // Set a timeout to trigger at midnight
    const timerId = setTimeout(() => {
      setDateRefresh(new Date());
    }, timeUntilMidnight);

    return () => clearTimeout(timerId);
  }, [dateRefresh]);

  useEffect(() => {
    // Function to update time displays when tab or window becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Force a re-render by updating state
        setForceUpdate(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });

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
      <SidebarOverlay />
      <ConversationsSidebar />
      <main className={styles.main}>
        {renderMainContent()}
      </main>
      <SettingsModal />
    </div>
  );
}
/**
 * Main layout component for the messaging interface
 * 
 * Architecture decisions:
 * 1. Uses a single-page application (SPA) approach with context-based routing
 *    instead of URL-based routing for better state persistence between views
 * 
 * 2. Component structure:
 *    - ConversationsSidebar: Always visible list of conversations
 *    - Main content area: Dynamically shows EmptyConversation or ConversationView
 *    - Settings modal: Only visible when triggered
 * 
 * 3. Time-based rendering optimizations:
 *    - Tracks date changes at midnight to refresh time displays
 *    - Updates time displays when tab becomes visible after being hidden
 *      to avoid stale timestamps
 */
import { useEffect, useState } from 'react';
import ConversationsSidebar from '../components/ui/ConversationsSidebar';
import ConversationView from '../components/ui/ConversationView';
import SettingsModal from '../components/ui/SettingsModal';
import EmptyConversation from '../components/ui/EmptyConversation';
import SidebarOverlay from '../components/ui/SidebarOverlay';
import { useMessaging } from '../hooks/useMessaging';
import { useNavigation } from '../hooks/useNavigation';
import styles from './MessagesLayout.module.css';

export default function MessagesLayout() {
  /**
   * Handles time-based refreshes for accurate timestamp displays
   * dateRefresh: Date state that changes at midnight to trigger rerender
   * forceUpdate: Simple counter to force rerender when tab becomes visible
   */
  const { loadConversations } = useMessaging();
  const { activeConversation, isNewConversation } = useNavigation();
  const [dateRefresh, setDateRefresh] = useState<Date>(new Date());
  const [, setForceUpdate] = useState<number>(0);

  /**
   * Initial data loading on component mount
   * Fetches all conversations for the user
   */
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /**
   * Sets a timer to trigger at midnight
   * This ensures that "Yesterday", "Today", etc. timestamps update correctly
   * when the date changes without requiring user interaction
   */
  useEffect(() => {
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

  /**
   * Handles visibility changes (tab switching, window focus)
   * Updates timestamps when user returns to the application after
   * it has been in the background
   */
  useEffect(() => {
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

  /**
   * Renders the appropriate component in the main content area based on navigation state
   * - New conversation mode: Empty conversation view with search
   * - Active conversation: Full conversation view with messages
   * - No selection: Empty state with instructions
   */
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
      <main className={styles.main}>{renderMainContent()}</main>
      <SettingsModal />
    </div>
  );
}

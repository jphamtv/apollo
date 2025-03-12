import { useContext } from 'react';
import { NavigationContext } from '../contexts/navigationContext';
import { Conversation } from '../types/conversation';
import { MessageContext } from '../contexts/messageContext';
import { SidebarContext } from '../contexts/sidebarContext';

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }

  const { state, dispatch } = context;
  const messageContext = useContext(MessageContext);
  const sidebarContext = useContext(SidebarContext);

  return {
    view: state.view,
    isNewConversation: state.isNewConversation,
    isSettingsOpen: state.isSettingsOpen,
    activeConversation: messageContext?.state.activeConversation || null,

    startNewConversation: () => {
      if (messageContext) {
        messageContext.clearActiveConversation();
      }
      dispatch({ type: 'START_NEW_CONVERSATION' });
      // Close mobile sidebar when starting a new conversation
      if (sidebarContext) {
        sidebarContext.closeMobileSidebar();
      }
    },

    navigateToConversation: (conversation: Conversation) => {
      if (messageContext) {
        messageContext.setActiveConversation(conversation);
      }
      dispatch({ type: 'NAVIGATE_TO_CONVERSATION' });
      // Close mobile sidebar when navigating to a conversation
      if (sidebarContext) {
        sidebarContext.closeMobileSidebar();
      }
    },

    navigateToMessages: () => {
      dispatch({ type: 'NAVIGATE_TO_MESSAGES' });
      if (sidebarContext) {
        sidebarContext.closeMobileSidebar();
      }
    },
    openSettings: () => {
      dispatch({ type: 'OPEN_SETTINGS' });
      if (sidebarContext) {
        sidebarContext.closeMobileSidebar();
      }
    },
    closeSettings: () => dispatch({ type: 'CLOSE_SETTINGS' }),
  };
}

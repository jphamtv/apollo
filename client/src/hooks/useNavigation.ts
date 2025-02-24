import { useContext } from 'react';
import { NavigationContext } from '../contexts/navigationContext';
import { Conversation } from '../types/conversation';
import { MessageContext } from '../contexts/messageContext';

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }

  const { state, dispatch } = context;
  const messageContext = useContext(MessageContext);

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
    },

    navigateToConversation: (conversation: Conversation) => {
      if (messageContext) {
        messageContext.setActiveConversation(conversation);
      }
      dispatch({ type: 'NAVIGATE_TO_CONVERSATION' });
    },

    navigateToMessages: () => dispatch({ type: 'NAVIGATE_TO_MESSAGES' }),
    openSettings: () => dispatch({ type: 'OPEN_SETTINGS' }),
    closeSettings: () => dispatch({ type: 'CLOSE_SETTINGS' }),
  };
}

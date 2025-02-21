import { useContext } from 'react';
import { NavigationContext } from '../contexts/navigationContext';
import { Conversation } from '../types/conversation';
import { MessageContext } from '../contexts/messageContext';

/**
 * A safer version of useNavigation that doesn't throw errors when 
 * used outside the navigation provider. Used primarily by AuthProvider.
 */
export function useSafeNavigation() {
  const navContext = useContext(NavigationContext);
  const messageContext = useContext(MessageContext);
  
  // If the context is not available, provide default/noop functions
  if (!navContext) {
    return {
      view: 'messages' as const,
      activeConversation: null,
      isNewConversation: false,
      isSettingsOpen: false,
      startNewConversation: () => {},
      navigateToConversation: () => {},
      navigateToMessages: () => {},
      openSettings: () => {},
      closeSettings: () => {},
      reset: () => {}
    };
  }

  const { state, dispatch } = navContext;
  
  // Get the message context directly to avoid circular dependency
  const setActiveConversation = messageContext?.setActiveConversation;
  const clearActiveConversation = messageContext?.clearActiveConversation;
  
  return {
    ...state,
    // Add activeConversation from MessageContext if available
    activeConversation: messageContext?.state.activeConversation || null,
    startNewConversation: () => {
      if (clearActiveConversation) {
        clearActiveConversation();
      }
      dispatch({ type: 'START_NEW_CONVERSATION' });
    },
    navigateToConversation: (conversation: Conversation) => {
      if (setActiveConversation) {
        setActiveConversation(conversation);
      }
      dispatch({ type: 'NAVIGATE_TO_CONVERSATION' });
    },
    navigateToMessages: () => dispatch({ type: 'NAVIGATE_TO_MESSAGES' }),
    openSettings: () => dispatch({ type: 'OPEN_SETTINGS' }),
    closeSettings: () => dispatch({ type: 'CLOSE_SETTINGS' }),
    reset: () => {
      if (clearActiveConversation) {
        clearActiveConversation();
      }
      dispatch({ type: 'RESET' });
    }
  };
}
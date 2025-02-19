import { useContext } from 'react';
import { NavigationContext } from '../contexts/NavigationContext';
import { Conversation } from '../types/conversation';

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }

  const { state, dispatch } = context;

  return {
    ...state,
    startNewConversation: () => dispatch({ type: 'START_NEW_CONVERSATION' }),
    navigateToConversation: (conversation: Conversation) => 
      dispatch({ type: 'NAVIGATE_TO_CONVERSATION', conversation }),
    navigateToMessages: () => dispatch({ type: 'NAVIGATE_TO_MESSAGES' }),
    openSettings: () => dispatch({ type: 'OPEN_SETTINGS' }),
    closeSettings: () => dispatch({ type: 'CLOSE_SETTINGS' }),
    reset: () => dispatch({ type: 'RESET' })
  };
}
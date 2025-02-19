import { createContext } from 'react';
import { Conversation } from '../types/conversation';

export type NavigationState = {
  view: 'messages';
  activeConversation: Conversation | null;
  isNewConversation: boolean;
  isSettingsOpen: boolean;
};

export type NavigationAction = 
  | { type: 'START_NEW_CONVERSATION' }
  | { type: 'NAVIGATE_TO_CONVERSATION'; conversation: Conversation }
  | { type: 'NAVIGATE_TO_MESSAGES' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'CLOSE_SETTINGS' }
  | { type: 'RESET' };

export function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'START_NEW_CONVERSATION':
      return {
        ...state,
        view: 'messages',
        isNewConversation: true,
        activeConversation: null
      };
    case 'NAVIGATE_TO_CONVERSATION':
      return {
        ...state,
        view: 'messages',
        activeConversation: action.conversation,
        isNewConversation: false
      };
    case 'NAVIGATE_TO_MESSAGES':
      return { 
        ...state, 
        view: 'messages', 
        isNewConversation: false 
      };
    case 'OPEN_SETTINGS':
      return { ...state, isSettingsOpen: true };
    case 'CLOSE_SETTINGS':
      return { ...state, isSettingsOpen: false };
    case 'RESET':
      return {
        view: 'messages',
        activeConversation: null,
        isNewConversation: false,
        isSettingsOpen: false
      };
    default:
      return state;
  }
}

export const NavigationContext = createContext<{
  state: NavigationState;
  dispatch: React.Dispatch<NavigationAction>;
} | null>(null);
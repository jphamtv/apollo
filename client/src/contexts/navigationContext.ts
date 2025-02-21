import { createContext } from 'react';

export type NavigationState = {
  view: 'messages';
  isNewConversation: boolean;
  isSettingsOpen: boolean;
};

export type NavigationAction = 
  | { type: 'START_NEW_CONVERSATION' }
  | { type: 'NAVIGATE_TO_CONVERSATION' }
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
        isNewConversation: true
      };
    case 'NAVIGATE_TO_CONVERSATION':
      return {
        ...state,
        view: 'messages',
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
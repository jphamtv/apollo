import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Conversation } from '../types/conversation';

type NavigationState = {
  view: 'messages' | 'settings';
  activeConversation: Conversation | null;
  isNewConversation: boolean;
};

type NavigationAction = 
  | { type: 'START_NEW_CONVERSATION' }
  | { type: 'NAVIGATE_TO_CONVERSATION'; conversation: Conversation }
  | { type: 'NAVIGATE_TO_SETTINGS' }
  | { type: 'NAVIGATE_TO_MESSAGES' };

function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'START_NEW_CONVERSATION':
      return {
        view: 'messages',
        isNewConversation: true,
        activeConversation: null
      };
    case 'NAVIGATE_TO_CONVERSATION':
      return {
        view: 'messages',
        activeConversation: action.conversation,
        isNewConversation: false
      };
    case 'NAVIGATE_TO_SETTINGS':
      return { ...state, view: 'settings', isNewConversation: false };
    case 'NAVIGATE_TO_MESSAGES':
      return { ...state, view: 'messages', isNewConversation: false };
    default:
      return state;
  }
}

const NavigationContext = createContext<{
  state: NavigationState;
  dispatch: React.Dispatch<NavigationAction>;
} | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(navigationReducer, {
    view: 'messages',
    activeConversation: null,
    isNewConversation: false
  });

  return (
    <NavigationContext.Provider value={{ state, dispatch }}>
      {children}
    </NavigationContext.Provider>
  );
}

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
    navigateToSettings: () => dispatch({ type: 'NAVIGATE_TO_SETTINGS' }),
    navigateToMessages: () => dispatch({ type: 'NAVIGATE_TO_MESSAGES' })
  };
}
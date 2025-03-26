/**
 * Navigation provider that manages app navigation state
 * Used instead of URL-based routing for better SPA experience
 * Handles views for messages, settings, and new conversation states
 */
import { useReducer, ReactNode, useEffect } from 'react';
import { NavigationContext, navigationReducer } from './navigationContext';
import { useAuth } from '../hooks/useAuth';

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(navigationReducer, {
    view: 'messages',
    isNewConversation: false,
    isSettingsOpen: false,
  });

  const { user } = useAuth();

  // Reset navigation when user logs out
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET' });
    }
  }, [user]);

  return (
    <NavigationContext.Provider value={{ state, dispatch }}>
      {children}
    </NavigationContext.Provider>
  );
}

import { useReducer, ReactNode } from 'react';
import { NavigationContext, navigationReducer } from './navigationContext';

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(navigationReducer, {
    view: 'messages',
    activeConversation: null,
    isNewConversation: false,
    isSettingsOpen: false
  });

  return (
    <NavigationContext.Provider value={{ state, dispatch }}>
      {children}
    </NavigationContext.Provider>
  );
}
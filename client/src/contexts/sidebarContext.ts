import { createContext } from 'react';

export interface SidebarContextType {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => {},
  closeMobileSidebar: () => {},
});

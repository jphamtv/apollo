import { ReactNode, useEffect, useState } from 'react';
import { SidebarContext } from './sidebarContext';
import { useAuth } from '../hooks/useAuth';

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);
  const { user } = useAuth();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Ensure sidebar is closed on mount
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // Ensure sidebar is closed when user logs in
  useEffect(() => {
    if (user) {
      setIsMobileSidebarOpen(false);
    }
  }, [user]);

  // Close sidebar when window resizes beyond mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 750) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{ isMobileSidebarOpen, toggleMobileSidebar, closeMobileSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

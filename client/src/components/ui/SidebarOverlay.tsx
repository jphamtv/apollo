import { useSidebar } from '../../hooks/useSidebar';
import styles from './SidebarOverlay.module.css';

export default function SidebarOverlay() {
  const { isMobileSidebarOpen, closeMobileSidebar } = useSidebar();
  
  if (!isMobileSidebarOpen) return null;
  
  return (
    <div 
      className={styles.overlay}
      onClick={closeMobileSidebar}
      aria-hidden="true"
    />
  );
}
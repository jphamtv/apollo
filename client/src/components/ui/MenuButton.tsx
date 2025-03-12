import styles from './MenuButton.module.css';
import { Menu } from 'lucide-react';
import { useSidebar } from '../../hooks/useSidebar';

export default function MenuButton() {
  const { toggleMobileSidebar } = useSidebar();

  return (
    <button 
      className={styles.menuButton} 
      onClick={toggleMobileSidebar}
      aria-label="Toggle menu"
    >
      <Menu size={24} strokeWidth={1.5} />
    </button>
  );
}
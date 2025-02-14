import { useState, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import styles from './ProfileButton.module.css';
import ProfileMenu from './ProfileMenu';
import { User } from '../../types/user';

interface Props {
  user: User;
}

export default function ProfileButton({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const initial = user.profile?.displayName?.charAt(0).toUpperCase() || 
                 user.username.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button 
        className={`${styles.container} ${isOpen ? styles.active : ''}`}
        onClick={handleToggle}
        type="button"
      >
        <div className={styles.avatar}>
          {user.profile?.imageUrl ? (
            <img src={user.profile.imageUrl} alt="" className={styles.avatarImage} />
          ) : (
            initial
          )}
        </div>
        <span className={styles.displayName}>
          {user.profile?.displayName || user.username}
        </span>
        <ChevronUp 
          size={16} 
          className={styles.chevron}
        />
      </button>
      
      {isOpen && (
        <ProfileMenu 
          user={user} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
}
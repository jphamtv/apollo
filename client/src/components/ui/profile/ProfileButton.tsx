import { useState, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import styles from './ProfileButton.module.css';
import ProfileMenu from './ProfileMenu';
import { User } from '../../../types/user';

interface Props {
  user: User;
}

export default function ProfileButton({ user }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const initials = user.profile.displayName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
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
      <button className={styles.container} onClick={handleToggle} type="button">
        <div className={styles.avatar}>
          {user.profile.imageUrl ? (
            <img
              src={user.profile.imageUrl}
              alt=""
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.initials}>{initials}</span>
          )}
        </div>
        <span className={styles.displayName}>
          {user.profile.displayName || user.username}
        </span>
        <ChevronUp size={16} strokeWidth={1} className={styles.chevron} />
      </button>

      {isOpen && <ProfileMenu user={user} onClose={() => setIsOpen(false)} />}
    </div>
  );
}

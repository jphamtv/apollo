import { useState, useEffect, useRef } from 'react';
import { useUserSearch } from '../../../hooks/useUserSearch';
import Input from '../common/Input';
import styles from './NewConversationHeader.module.css';
import { User } from '../../../types/user';
import BotBadge from '../common/BotBadge';

interface Props {
  onUserSelect: (user: User) => void;
  disabled?: boolean;
}

export default function NewConversationHeader({
  onUserSelect,
  disabled = false,
}: Props) {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { users, isLoading, searchQuery, setSearchQuery } = useUserSearch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials = (displayName: string) => {
    return displayName
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled) {
      setShowDropdown(false);
      return;
    }
    setShowDropdown(true);
  }, [disabled]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!disabled) {
      // Always show dropdown when focused on search field
      setShowDropdown(true);
    }
  };

  const handleSelectUser = (user: User) => {
    if (disabled) return;
    onUserSelect(user);
    setSearchQuery(user.profile.displayName || user.username);
    setShowDropdown(false);
  };

  return (
    <div>
      <div className={styles.searchContainer}>
        <Input
          type="text"
          placeholder={
            disabled ? 'Creating conversation...' : 'Search or select a user...'
          }
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => !disabled && setShowDropdown(true)}
          className={styles.searchInput}
          disabled={disabled}
          autoFocus
        />
        {showDropdown && !disabled && (
          <div ref={dropdownRef} className={styles.dropdown}>
            {isLoading ? (
              <div className={styles.dropdownMessage}>Searching...</div>
            ) : users.length > 0 ? (
              users.map(user => (
                <div
                  key={user.id}
                  className={styles.userItem}
                  onClick={() => handleSelectUser(user)}
                >
                  {user.profile.imageUrl ? (
                    <img
                      src={user.profile.imageUrl}
                      alt=""
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {initials(user.profile.displayName)}
                    </div>
                  )}
                  <div className={styles.userInfo}>
                    <div className={styles.displayName}>
                      <span className={styles.nameText}>
                        {user.profile.displayName || user.username}
                      </span>
                      {user.isBot && <BotBadge />}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.dropdownMessage}>No users found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

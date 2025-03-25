import { useState, useEffect, useRef } from 'react';
import { useUserSearch } from '../../hooks/useUserSearch';
import Input from './Input';
import styles from './NewConversationHeader.module.css';
import { User } from '../../types/user';
import BotBadge from './BotBadge';

interface Props {
  onUserSelect: (user: User) => void;
  disabled?: boolean;
}

export default function NewConversationHeader({
  onUserSelect,
  disabled = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { users, isLoading, searchUsers } = useUserSearch();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers, disabled]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!disabled) {
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
          placeholder={disabled ? 'Creating conversation...' : 'Type a name...'}
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => !disabled && setShowDropdown(true)}
          className={styles.searchInput}
          disabled={disabled}
          autoFocus
        />
        {showDropdown && !disabled && (searchQuery || users.length > 0) && (
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
                      {user.profile.displayName?.[0].toUpperCase() ||
                        user.username[0].toUpperCase()}
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
            ) : searchQuery ? (
              <div className={styles.dropdownMessage}>No users found</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

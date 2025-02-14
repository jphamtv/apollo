import { useState, useEffect, useRef } from 'react';
import { useUserSearch } from '../../hooks/useUserSearch';
import Input from './Input';
import styles from './NewConversationHeader.module.css';
import { User } from '../../types/user';

interface Props {
  onUserSelect: (user: User) => void;
}

export default function NewConversationHeader({ onUserSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { users, isLoading, searchUsers } = useUserSearch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowDropdown(true);
  };

  const handleSelectUser = (user: User) => {
    onUserSelect(user);
    setSearchQuery(user.profile?.displayName || user.username);
    setShowDropdown(false);
  };

  return (
    <div className={styles.header}>
      <div className={styles.searchContainer}>
        <Input
          type="text"
          placeholder="Type a name..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          className={styles.searchInput}
        />
        {showDropdown && (searchQuery || users.length > 0) && (
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
                  {user.profile?.imageUrl ? (
                    <img 
                      src={user.profile.imageUrl} 
                      alt="" 
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user.profile?.displayName?.[0].toUpperCase() || 
                       user.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className={styles.userInfo}>
                    <div className={styles.displayName}>
                      {user.profile?.displayName || user.username}
                    </div>
                    {user.profile?.displayName && (
                      <div className={styles.username}>@{user.username}</div>
                    )}
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
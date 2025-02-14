import { useState } from 'react';
import Input from './Input';
import styles from './NewConversationHeader.module.css';

interface User {
  id: string;
  username: string;
  profile?: {
    displayName: string;
    imageUrl?: string;
  };
}

interface Props {
  onUserSelect: (user: User) => void;
}

export default function NewConversationHeader({ onUserSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [users, setUsers] = useState<User[]>([]);  // TODO: Load users

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowDropdown(true);
    // TODO: Load/filter users based on query
  };

  const handleSelectUser = (user: User) => {
    onUserSelect(user);
    setShowDropdown(false);
    setSearchQuery(user.profile?.displayName || user.username);
  };

  return (
    <div className={styles.header}>
      <div className={styles.searchContainer}>
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchInput}
        />
        {showDropdown && users.length > 0 && (
          <div className={styles.dropdown}>
            {users.map(user => (
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
                    {user.profile?.displayName?.[0] || user.username[0]}
                  </div>
                )}
                <span>{user.profile?.displayName || user.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import ConversationsSidebar from "../components/ui/ConversationsSidebar";
import ConversationView from "../components/ui/ConversationView";
import styles from './MessagesLayout.module.css';

export default function MessagesLayout() {
  const navigate = useNavigate();
  const [isNewConversation, setIsNewConversation] = useState(false);

  const handleNewChat = () => {
    setIsNewConversation(true);
  };

  const handleMessageSent = (conversationId: string) => {
    setIsNewConversation(false);
    navigate(`/conversations/${conversationId}`);
  };

  return (
    <div className={styles.container}>
      <ConversationsSidebar onNewChat={handleNewChat} />
      <main className={styles.main}>
        {isNewConversation ? (
          <ConversationView onMessageSent={handleMessageSent} />
        ) : (
          <Outlet />            
        )}
      </main>
    </div>
  );
}
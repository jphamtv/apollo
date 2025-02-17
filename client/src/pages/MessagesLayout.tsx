import { useState } from "react";
import { Outlet } from "react-router-dom";
import ConversationsSidebar from "../components/ui/ConversationsSidebar";
import ConversationView from "../components/ui/ConversationView";
import styles from './MessagesLayout.module.css';
import { useConversations } from "../hooks/useConversations";

export default function MessagesLayout() {
  const [isNewConversation, setIsNewConversation] = useState(false);
  const conversationsData = useConversations();

  const handleNewChat = () => {
    setIsNewConversation(true);
  };

  return (
    <div className={styles.container}>
      <ConversationsSidebar 
        onNewChat={handleNewChat} 
        {...conversationsData} 
      />
      <main className={styles.main}>
        {isNewConversation ? (
          <ConversationView />
        ) : (
          <Outlet />            
        )}
      </main>
    </div>
  );
}
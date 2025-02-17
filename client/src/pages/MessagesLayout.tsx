import { useState } from "react";
import { Outlet } from "react-router-dom";
import ConversationsSidebar from "../components/ui/ConversationsSidebar";
import ConversationView from "../components/ui/ConversationView";
import { useConversations } from "../hooks/useConversations";
import styles from './MessagesLayout.module.css';

export default function MessagesLayout() {
  const [isNewConversation, setIsNewConversation] = useState(false);
  const conversationsData = useConversations();

  const handleNewChat = () => {
    setIsNewConversation(true);
  };

  const handleConversationSelect = () => {
    setIsNewConversation(false);
  };

  return (
    <div className={styles.container}>
      <ConversationsSidebar 
        onNewChat={handleNewChat} 
        conversations={conversationsData.conversations}
        loadConversations={conversationsData.loadConversations}
        selectConversation={(conversation) => {
          conversationsData.selectConversation(conversation);
          handleConversationSelect();
        }}
        activeConversation={conversationsData.activeConversation}
      />
      <main className={styles.main}>
        {isNewConversation ? (
          <ConversationView conversationsData={conversationsData} />
        ) : conversationsData.activeConversation ? (
          <ConversationView 
            conversationsData={conversationsData}
            conversationId={conversationsData.activeConversation.id} 
          />
        ) : (
          <Outlet />            
        )}
      </main>
    </div>
  );
}
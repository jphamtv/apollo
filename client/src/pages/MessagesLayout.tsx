import { Outlet } from "react-router-dom";
import ConversationsSidebar from "../components/ui/ConversationsSidebar";
import styles from './MessagesLayout.module.css';

export default function MessagesLayout() {
  return (
    <div className={styles.container}>
      <ConversationsSidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
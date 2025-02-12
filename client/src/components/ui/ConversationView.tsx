import { useParams } from 'react-router-dom';

export default function ConversationView() {
  const { id } = useParams();
  
  return (
    <div>
      <header>
        {/* Conversation header with participant info */}
      </header>

      <div>
        {/* Messages list */}
      </div>

      <footer>
        {/* Message input */}
      </footer>
    </div>
  );
}
import { User } from './user';
import { Message } from './message';

export interface Participant {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: string;
  leftAt: string | null;
  user: User;
}

export interface Conversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  participants: Participant[];
  lastMessage?: {
    text: string;
    createdAt: string;
  };
  messages: Message[];
  hasUnread?: boolean;
  createdAt: string;
  updatedAt: string;
}
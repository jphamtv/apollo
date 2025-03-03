import { User } from './user';

export interface Message {
  id: string;
  text: string;
  imageUrl?: string | null;
  conversationId: string;
  senderId: string;
  sender?: User;
  isRead: boolean;
  createdAt: string;
}

export interface MessageCreate {
  text: string;
  conversationId: string;
}

export interface MessageWithSender extends Message {
  sender: User;
}
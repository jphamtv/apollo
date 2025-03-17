import { createContext } from 'react';
import { Conversation } from '../types/conversation';
import { Message } from '../types/message';

// Define the Message Context State
export interface MessageState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isCreatingConversation: boolean;
  conversationsError: string | null;
  messagesError: string | null;
}

// Define the initial state
export const initialMessageState: MessageState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  isCreatingConversation: false,
  conversationsError: null,
  messagesError: null,
};

// Define all possible actions
export type MessageAction =
  | { type: 'LOAD_CONVERSATIONS_REQUEST' }
  | { type: 'LOAD_CONVERSATIONS_SUCCESS'; conversations: Conversation[] }
  | { type: 'LOAD_CONVERSATIONS_FAILURE'; error: string }
  | { type: 'SET_ACTIVE_CONVERSATION'; conversation: Conversation }
  | { type: 'CLEAR_ACTIVE_CONVERSATION' }
  | { type: 'LOAD_MESSAGES_REQUEST' }
  | { type: 'LOAD_MESSAGES_SUCCESS'; messages: Message[] }
  | { type: 'LOAD_MESSAGES_FAILURE'; error: string }
  | { type: 'SEND_MESSAGE_REQUEST' }
  | { type: 'SEND_MESSAGE_SUCCESS'; message: Message }
  | { type: 'SEND_MESSAGE_FAILURE'; error: string }
  | { type: 'CREATE_CONVERSATION_REQUEST' }
  | { type: 'CREATE_CONVERSATION_SUCCESS'; conversation: Conversation }
  | { type: 'CREATE_CONVERSATION_FAILURE'; error: string }
  | { type: 'DELETE_CONVERSATION_REQUEST' }
  | { type: 'DELETE_CONVERSATION_SUCCESS'; conversation: Conversation }
  | { type: 'DELETE_CONVERSATION_FAILURE'; error: string }
  | { type: 'MARK_CONVERSATION_READ_SUCCESS'; conversationId: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'RESET_STATE' }
  | { type: 'RECEIVE_MESSAGE'; message: Message };
  
// Helper function to update conversations with a new message
const updateConversationsWithMessage = (state: MessageState, message: Message, isReceived = false) => {
  // Update conversations with the new message
  const updatedConversations = state.conversations.map(conversation => {
    if (conversation.id === message.conversationId) {
      return {
        ...conversation,
        lastMessage: {
          text: message.text,
          createdAt: message.createdAt,
          hasImage: !!message.imageUrl
        },
        // Set hasUnread flag only for received messages and if not active conversation
        hasUnread: isReceived ? state.activeConversation?.id !== conversation.id : conversation.hasUnread,
        messages: [...(conversation.messages || []), message]
      };
    }
    return conversation;
  });
  
  // Sort conversations to move the updated one to the top
  return [...updatedConversations].sort((a, b) => {
    const aTime = a.lastMessage?.createdAt || a.createdAt;
    const bTime = b.lastMessage?.createdAt || b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
};

// Message reducer function
export function messageReducer(state: MessageState, action: MessageAction): MessageState {
  switch (action.type) {
    // Conversation loading actions
    case 'LOAD_CONVERSATIONS_REQUEST':
      return {
        ...state,
        isLoadingConversations: true,
        conversationsError: null
      };
    case 'LOAD_CONVERSATIONS_SUCCESS':
      return {
        ...state,
        conversations: action.conversations,
        isLoadingConversations: false
      };
    case 'LOAD_CONVERSATIONS_FAILURE':
      return {
        ...state,
        isLoadingConversations: false,
        conversationsError: action.error
      };
      
    // Active conversation actions
    case 'SET_ACTIVE_CONVERSATION':
      return {
        ...state,
        activeConversation: action.conversation
      };
    case 'CLEAR_ACTIVE_CONVERSATION':
      return {
        ...state,
        activeConversation: null,
        messages: []
      };
      
    // Message loading actions
    case 'LOAD_MESSAGES_REQUEST':
      return {
        ...state,
        isLoadingMessages: true,
        messagesError: null
      };
    case 'LOAD_MESSAGES_SUCCESS':
      return {
        ...state,
        messages: action.messages,
        isLoadingMessages: false
      };
    case 'LOAD_MESSAGES_FAILURE':
      return {
        ...state,
        isLoadingMessages: false,
        messagesError: action.error
      };
      
    // Send message actions
    case 'SEND_MESSAGE_REQUEST':
      return {
        ...state,
        isSendingMessage: true
      };
    case 'SEND_MESSAGE_SUCCESS': {
      const newMessage = action.message;
      const sortedConversations = updateConversationsWithMessage(state, newMessage);      
      
      // Update active conversation
      const updatedActiveConversation = state.activeConversation && 
        state.activeConversation.id === newMessage.conversationId
        ? {
            ...state.activeConversation,
            lastMessage: {
              text: newMessage.text,
              createdAt: newMessage.createdAt,
              hasImage: !!newMessage.imageUrl
            },
            messages: [...(state.activeConversation.messages || []), newMessage]
          }
        : state.activeConversation;
        
      return {
        ...state,
        conversations: sortedConversations,
        activeConversation: updatedActiveConversation,
        messages: [...state.messages, newMessage],
        isSendingMessage: false
      };
    }
    case 'SEND_MESSAGE_FAILURE':
      return {
        ...state,
        isSendingMessage: false,
        messagesError: action.error
      };
      
    // Create conversation actions
    case 'CREATE_CONVERSATION_REQUEST':
      return {
        ...state,
        isCreatingConversation: true
      };
    case 'CREATE_CONVERSATION_SUCCESS': {
      const newConversation = action.conversation;
      
      // Check if the conversation already exists in the state
      const exists = state.conversations.some(conv => conv.id === newConversation.id);
      
      // Add new conversation to the beginning of the array if it doesn't exist
      const updatedConversations = exists 
        ? state.conversations 
        : [newConversation, ...state.conversations];
      
      return {
        ...state,
        conversations: updatedConversations,
        activeConversation: newConversation,
        isCreatingConversation: false
      };
    }
    case 'CREATE_CONVERSATION_FAILURE':
      return {
        ...state,
        isCreatingConversation: false,
        conversationsError: action.error
      };
      
    // Delete conversation actions
    case 'DELETE_CONVERSATION_REQUEST':
      return {
        ...state
      };    
    case 'DELETE_CONVERSATION_SUCCESS': {
      const updatedConversations = state.conversations.filter(
        conv => conv.id !== action.conversation.id
      );

      return {
        ...state,
        conversations: updatedConversations,
      };
    }
    case 'DELETE_CONVERSATION_FAILURE':
      return {
        ...state,
        conversationsError: action.error
      }
    
    // Mark conversation as read action
    case 'MARK_CONVERSATION_READ_SUCCESS': {
      const updatedConversations = state.conversations.map(conversation => {
        if (conversation.id === action.conversationId) {
          return {
            ...conversation,
            hasUnread: false
          };
        }
        return conversation;
      });

      return {
        ...state,
        conversations: updatedConversations
      }
    }
      
    // Clear messages action
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: []
      };
      
    // Reset entire state to initial values
    case 'RESET_STATE':
      return initialMessageState;
    
    case 'RECEIVE_MESSAGE': {
      const newMessage = action.message;
      const sortedConversations = updateConversationsWithMessage(state, newMessage, true)
      
      // Update active conversation if it's the one we received the message in
      const updatedActiveConversation = state.activeConversation && 
        state.activeConversation.id === newMessage.conversationId
        ? {
            ...state.activeConversation,
            lastMessage: {
              text: newMessage.text,
              createdAt: newMessage.createdAt,
              hasImage: !!newMessage.imageUrl
            },
            messages: [...(state.activeConversation.messages || []), newMessage]
          }
        : state.activeConversation;
        
      // Only update messages array if this is for the active conversation
      const updatedMessages = state.activeConversation?.id === newMessage.conversationId
        ? [...state.messages, newMessage]
        : state.messages;
        
      return {
        ...state,
        conversations: sortedConversations,
        activeConversation: updatedActiveConversation,
        messages: updatedMessages
      };
    }    
      
    default:
      return state;
  }
}

// Create the context with state and dispatch
export type MessageContextType = {
  state: MessageState;
  dispatch: React.Dispatch<MessageAction>;
  
  // Helper methods for components to use
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => Promise<Message>;
  sendMessageWithImage: (conversationId: string, formData: FormData) => Promise<Message>;
  createConversation: (userId: string) => Promise<Conversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversation: Conversation) => void;
  clearActiveConversation: () => void;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  clearMessages: () => void;
  findConversationByParticipant: (userId: string) => Conversation | undefined;
};

// Create the context with a default undefined value
export const MessageContext = createContext<MessageContextType | undefined>(undefined);

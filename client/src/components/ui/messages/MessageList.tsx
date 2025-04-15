/**
 * Component that renders the messages area with advanced features:
 *
 * UI optimizations:
 * 1. Auto-scrolling - Automatically scrolls to newest messages
 * 2. Timestamp grouping - Shows timestamps only when time gaps are significant
 * 3. Date separators - Groups messages by date for better context
 * 4. Image orientation detection - Renders landscape/portrait images appropriately
 * 5. Typing indicators - Shows when users are typing with different styling for bots
 *
 * Performance considerations:
 * - Uses refs for smooth scrolling without layout thrashing
 * - Minimal re-renders with proper dependency arrays
 * - Efficient image dimension detection after loading
 * - Uses Set for landscape image tracking to avoid array scans
 *
 * Accessibility features:
 * - Proper ARIA roles (log, live region)
 * - Semantic structure with fragments
 * - Descriptive labels for screen readers
 */
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../../types/message';
import { formatMessageFeedTimestamp } from '../../../utils/formatTime';
import MessageItem from './MessageItem';
import TimestampDivider from './TimestampDivider';
import TypingIndicators from './TypingIndicators';
import styles from './MessageList.module.css';

interface Props {
  messages: Message[];
  currentUserId: string | undefined;
  typingUserName: string;
  isTyping: boolean;
  isConversationWithBot: boolean;
  sendingImageMessage?: boolean;
}

export default function MessageList({
  messages,
  currentUserId,
  typingUserName,
  isTyping,
  isConversationWithBot,
  sendingImageMessage,
}: Props) {
  /**
   * References and state:
   * - messagesEndRef: Used for scrolling to the latest message
   * - landscapeImages: Tracks which images are landscape orientation for proper styling
   */
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [landscapeImages, setLandscapeImages] = useState<Set<string>>(
    new Set()
  );

  /**
   * Automatic scrolling effect
   * Scrolls to the bottom of the messages container whenever:
   * - New messages are received
   * - Someone starts/stops typing
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages, isTyping, sendingImageMessage]);

  /**
   * Image orientation detection handler
   * Uses the native image dimensions to determine if an image is landscape
   * or portrait, then stores the result in state for styling purposes
   */
  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement>,
    messageId: string
  ) => {
    const img = e.target as HTMLImageElement;
    if (img.naturalWidth > img.naturalHeight) {
      setLandscapeImages(prev => new Set(prev).add(messageId));
    }

    // Scroll to bottom after image loads
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Timestamp display logic
   * Determines if a timestamp should be shown between messages
   * Shows timestamp if there's a gap of more than 2 hours between messages
   * for better conversation context without excessive timestamps
   */
  const shouldShowTimestamp = (
    currentMsg: Message,
    prevMsg: Message | null
  ): boolean => {
    if (!prevMsg) return true; // Always show for first message

    const currentTime = new Date(currentMsg.createdAt);
    const prevTime = new Date(prevMsg.createdAt);

    // Show timestamp if more than 2 hours between messages
    return currentTime.getTime() - prevTime.getTime() > 2 * 60 * 60 * 1000;
  };

  /**
   * Date divider display logic
   * Determines if a date divider should be shown between messages
   * Shows a divider whenever the date changes (midnight boundary)
   */
  const shouldShowDateDivider = (
    currentMsg: Message,
    prevMsg: Message | null
  ): boolean => {
    if (!prevMsg) return true; // Always show date for first message

    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();

    return currentDate !== prevDate;
  };

  return (
    <div
      className={styles.messagesContainer}
      role="log"
      aria-label="Message history"
      aria-live="polite"
    >
      {Array.isArray(messages) &&
        messages.length > 0 &&
        messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null;

          // Check if we need a date divider or timestamp
          const showDateDivider = shouldShowDateDivider(message, prevMessage);
          const showTimestamp =
            !showDateDivider && shouldShowTimestamp(message, prevMessage);

          return (
            <React.Fragment key={message.id}>
              {/* Date divider with time */}
              {showDateDivider && (
                <TimestampDivider
                  timestamp={formatMessageFeedTimestamp(message.createdAt)}
                />
              )}

              {/* Time separator */}
              {showTimestamp && (
                <TimestampDivider
                  timestamp={formatMessageFeedTimestamp(message.createdAt)}
                />
              )}

              {/* Message content */}
              <MessageItem
                message={message}
                isCurrentUser={message.senderId === currentUserId}
                landscapeImages={landscapeImages}
                onImageLoad={handleImageLoad}
              />
            </React.Fragment>
          );
        })}

      {sendingImageMessage && (
        <div className={styles.sendingIndicator}>
          <span>Sending...</span>
        </div>
      )}

      {isTyping && typingUserName && (
        <TypingIndicators
          displayName={typingUserName}
          isConversationWithBot={isConversationWithBot}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types/message';
import { formatMessageFeedTimestamp } from '../../utils/formatTime';
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
}

export default function MessageList({
  messages,
  currentUserId,
  typingUserName,
  isTyping,
  isConversationWithBot,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [landscapeImages, setLandscapeImages] = useState<Set<string>>(
    new Set()
  );

  // Scroll to bottom when messages change or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages, isTyping]);

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement>,
    messageId: string
  ) => {
    const img = e.target as HTMLImageElement;
    if (img.naturalWidth > img.naturalHeight) {
      setLandscapeImages(prev => new Set(prev).add(messageId));
    }
  };

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

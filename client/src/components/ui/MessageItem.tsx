import { Message } from '../../types/message';
import styles from './MessageItem.module.css';

interface Props {
  message: Message;
  isCurrentUser: boolean;
  landscapeImages: Set<string>;
  onImageLoad: (
    e: React.SyntheticEvent<HTMLImageElement>,
    messageId: string
  ) => void;
}

export default function MessageItem({
  message,
  isCurrentUser,
  landscapeImages,
  onImageLoad,
}: Props) {
  const isImageOnly = message.imageUrl && !message.text;

  // For screen readers, identify message sender
  const messageSender = isCurrentUser
    ? 'You'
    : message.sender?.profile?.displayName ||
      message.sender?.username ||
      'Other user';
  const timestamp = new Date(message.createdAt).toLocaleString();
  const messageType = message.imageUrl
    ? message.text
      ? 'message with image'
      : 'image message'
    : 'text message';

  return (
    <div
      className={`${styles.message} ${
        isCurrentUser ? styles.sent : styles.received
      } ${isImageOnly ? styles.imageOnly : ''}`}
      role="listitem"
      aria-label={`${messageSender} sent ${messageType} at ${timestamp}`}
    >
      {isImageOnly ? (
        <div
          className={`${styles.messageImageOnly} ${landscapeImages.has(message.id) ? styles.landscape : ''}`}
        >
          <img
            src={message.imageUrl || undefined}
            alt="Shared image"
            onLoad={e => onImageLoad(e, message.id)}
          />
        </div>
      ) : (
        <div className={styles.messageContent}>
          {message.imageUrl && (
            <div
              className={`${styles.messageImage} ${landscapeImages.has(message.id) ? styles.landscape : ''}`}
            >
              <img
                src={message.imageUrl}
                alt="Shared image"
                onLoad={e => onImageLoad(e, message.id)}
              />
            </div>
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}

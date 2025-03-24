import { Message } from '../../types/message';
import styles from './MessageItem.module.css';

interface Props {
  message: Message;
  isCurrentUser: boolean;
  landscapeImages: Set<string>;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>, messageId: string) => void;
}

export default function MessageItem({
  message,
  isCurrentUser,
  landscapeImages,
  onImageLoad
}: Props) {
  const isImageOnly = message.imageUrl && !message.text;
  
  return (
    <div className={`${styles.message} ${
      isCurrentUser ? styles.sent : styles.received
    } ${isImageOnly ? styles.imageOnly : ''}`}>
      {isImageOnly ? (
        <div className={`${styles.messageImageOnly} ${landscapeImages.has(message.id) ? styles.landscape : ''}`}>
          <img
            src={message.imageUrl || undefined}
            alt=""
            onLoad={(e) => onImageLoad(e, message.id)}
          />
        </div>
      ) : (
        <div className={styles.messageContent}>
          {message.imageUrl && (
            <div className={`${styles.messageImage} ${landscapeImages.has(message.id) ? styles.landscape : ''}`}>
              <img
                src={message.imageUrl}
                alt=""
                onLoad={(e) => onImageLoad(e, message.id)}
              />
            </div>
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}

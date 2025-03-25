/**
 * Format the timestamp for the conversation feed (both day dividers and interval markers)
 * Includes both date context and specific time
 * Examples: "Today at 3:45 PM", "Yesterday at 10:30 AM", "Monday at 2:15 PM"
 */
export function formatMessageFeedTimestamp(timestamp: string | Date): string {
  const messageDate = new Date(timestamp);
  const now = new Date();

  // Set times to midnight for day comparison
  const messageDateDay = new Date(messageDate);
  messageDateDay.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Format the time portion consistently
  const timeString = messageDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Calculate difference in days
  const diffDays = Math.floor(
    (today.getTime() - messageDateDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Same day: Show time
  if (diffDays === 0) {
    return `Today at ${timeString}`;
  }

  // Yesterday: Show "Yesterday"
  if (diffDays === 1) {
    return `Yesterday at ${timeString}`;
  }

  // Within last week: Show "DayOfWeek at [time]"
  if (diffDays >= 2 && diffDays < 7) {
    const dayName = messageDate.toLocaleDateString([], { weekday: 'long' });
    return `${dayName} at ${timeString}`;
  }

  // More than a week: Show full date with time
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year:
      messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  };

  const dateString = messageDate.toLocaleDateString([], dateOptions);
  return `${dateString} at ${timeString}`;
}

/**
 * Format the timestamp for the last message in conversation sidebar
 * Shows relative time without specifics
 * Examples: "3:45 PM", "Yesterday", "Monday", "03/15/24"
 */
export function formatLastMessageTimestamp(timestamp: string | Date): string {
  const messageDate = new Date(timestamp);
  const now = new Date();

  // Set times to midnight for day comparison
  const messageDateDay = new Date(messageDate);
  messageDateDay.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Calculate difference in days
  const diffDays = Math.floor(
    (today.getTime() - messageDateDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Same day: Show time
  if (diffDays === 0) {
    return messageDate.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  // Yesterday: Show "Yesterday"
  if (diffDays === 1) {
    return 'Yesterday';
  }

  // 2-6 days ago: Show day of week
  if (diffDays >= 2 && diffDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'long' });
  }

  // 7+ days ago: Show date as mm/dd/yy
  return messageDate.toLocaleDateString([], {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

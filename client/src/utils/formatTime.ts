/**
 * Formats timestamp based on how recent it is:
 * - Same day: Display time (e.g., "3:45 PM")
 * - Yesterday: Display "Yesterday"
 * - 2-6 days ago: Display day of week (e.g., "Monday")
 * - 7+ days ago: Display date (e.g., "02/15/24")
 */
export function formatMessageTime(timestamp: string | Date): string {
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // Set times to midnight for day comparison
  const messageDateDay = new Date(messageDate);
  messageDateDay.setHours(0, 0, 0, 0);
  
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffDays = Math.floor((today.getTime() - messageDateDay.getTime()) / (1000 * 60 * 60 * 24));
  
  // Same day: Show time
  if (diffDays === 0) {
    return messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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
    year: '2-digit' 
  });
}
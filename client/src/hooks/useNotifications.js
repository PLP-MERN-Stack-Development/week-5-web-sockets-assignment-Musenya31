import { useEffect, useRef, useState } from 'react';

export default function useNotifications({ messages, currentUser, chatActive }) {
  const lastMessageRef = useRef(null);
  const [unread, setUnread] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMessageRef.current === lastMsg) return;
    lastMessageRef.current = lastMsg;
    
    // Only notify if not sent by current user and chat is not active
    if (lastMsg.sender !== currentUser && !chatActive) {
      // Browser notification (no sound)
      if (window.Notification && Notification.permission === 'granted') {
        new Notification(`${lastMsg.sender}: ${lastMsg.text}`, {
          silent: true
        });
      }
      
      // Update unread count
      setUnread(prev => prev + 1);
    }
  }, [messages, currentUser, chatActive]);

  // Request notification permission on mount
  useEffect(() => {
    if (window.Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Reset unread count when chat becomes active
  useEffect(() => {
    if (chatActive) {
      setUnread(0);
    }
  }, [chatActive]);

  return { unread, setUnread };
} 
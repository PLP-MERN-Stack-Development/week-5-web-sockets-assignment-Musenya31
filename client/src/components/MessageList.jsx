import React, { useState, useEffect, useRef } from 'react';
import ReactionBar from './ReactionBar';

function formatTime(time) {
  if (!time) return '';
  if (time instanceof Date) return time.toLocaleTimeString();
  return time;
}

function MessageList({ messages, currentUser, unreadCount = 0, deliveredIds = [], onLoadMore, currentRoom }) {
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);
  const unreadStartIdx = messages.length - unreadCount;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && onLoadMore && !isLoading) {
      setIsLoading(true);
      onLoadMore().finally(() => setIsLoading(false));
    }
  };

  return (
    <div className="mb-4 h-64 overflow-y-auto bg-gray-50 border rounded p-2" onScroll={handleScroll}>
      {isLoading && (
        <div className="text-center text-gray-500 text-sm py-2">
          Loading older messages...
        </div>
      )}
      
      {messages.length === 0 && (
        <p className="text-gray-400 text-center">No messages yet.</p>
      )}
      
      {messages.map((msg, idx) => {
        let status = '';
        if (msg.sender === currentUser) {
          if (msg.readBy && msg.readBy.length > 1) {
            status = '✓✓ Read';
          } else if (deliveredIds.includes(msg._id)) {
            status = '✓ Delivered';
          } else {
            status = '✓ Sent';
          }
        }
        
        return msg.system ? (
          <div key={idx} className="text-center text-gray-400 text-sm my-2">
            {msg.text} <span className="text-xs">({formatTime(msg.time)})</span>
          </div>
        ) : (
          <div
            key={msg._id || idx}
            className={
              (msg.sender === currentUser ? 'text-right' : 'text-left') +
              (unreadCount > 0 && idx >= unreadStartIdx ? ' bg-yellow-100' : '')
            }
          >
            <span className="font-semibold text-blue-600">{msg.sender}</span>
            <span className="text-xs text-gray-400 ml-2">{formatTime(msg.time)}</span>
            <div className="inline-block bg-white rounded px-2 py-1 my-1 shadow-sm max-w-xs sm:max-w-md md:max-w-lg break-words">
              {msg.text}
            </div>
            {msg.sender === currentUser && (
              <span className="text-xs text-green-500 ml-2">
                {status}
              </span>
            )}
            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
              <ReactionBar 
                messageId={msg._id} 
                currentReactions={msg.reactions}
                room={currentRoom}
              />
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList; 
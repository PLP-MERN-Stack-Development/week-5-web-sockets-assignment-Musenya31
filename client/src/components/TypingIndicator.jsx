import React from 'react';

function TypingIndicator({ typingUsers, currentUser }) {
  const othersTyping = typingUsers.filter(u => u !== currentUser);
  if (othersTyping.length === 0) return null;
  return (
    <div className="text-sm text-gray-500 mb-2">
      {othersTyping.join(', ')} {othersTyping.length === 1 ? 'is' : 'are'} typing...
    </div>
  );
}

export default TypingIndicator; 
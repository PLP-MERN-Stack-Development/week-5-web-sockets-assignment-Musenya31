import React from 'react';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';

const reactions = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

function ReactionBar({ messageId, currentReactions, room }) {
  const { username } = useAuth();

  const handleReact = (emoji) => {
    socket.emit('reaction', { messageId, emoji, username, room });
  };

  return (
    <div className="flex space-x-2 mt-1">
      {reactions.map((emoji) => (
        <button
          key={emoji}
          className="text-xl hover:scale-110 transition-transform"
          onClick={() => handleReact(emoji)}
          title={`React with ${emoji}`}
        >
          {emoji} {currentReactions && currentReactions[emoji] ? currentReactions[emoji].length : ''}
        </button>
      ))}
    </div>
  );
}

export default ReactionBar; 
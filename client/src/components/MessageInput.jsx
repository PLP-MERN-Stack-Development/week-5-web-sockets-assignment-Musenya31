import React, { useState, useRef } from 'react';
import socket from '../socket';

function MessageInput({ onSend, username }) {
  const [text, setText] = useState('');
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!isTyping.current) {
      socket.emit('typing', username);
      isTyping.current = true;
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop-typing', username);
      isTyping.current = false;
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      socket.emit('stop-typing', username);
      isTyping.current = false;
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex mt-2">
      <input
        type="text"
        className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700">Send</button>
    </form>
  );
}

export default MessageInput; 
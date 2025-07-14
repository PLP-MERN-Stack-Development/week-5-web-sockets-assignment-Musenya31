import React from 'react';

function UserList({ users, currentUser, onSelect, onPrivateMessage }) {
  const handleInvite = (user) => {
    console.log('UserList: Inviting user:', user);
    if (onSelect) {
      onSelect(user);
    }
  };

  const handlePrivateMessage = (user) => {
    console.log('UserList: Starting private message with:', user);
    if (onPrivateMessage) {
      onPrivateMessage(user);
    }
  };

  return (
    <ul className="space-y-2">
      {users.filter(u => u !== currentUser).map((user, idx) => (
        <li key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
          <div className="flex items-center">
            <span className="mr-2">🟢</span>
            <span className="font-medium">{user}</span>
          </div>
          <div className="flex gap-2">
            {onSelect && (
              <button
                className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                onClick={() => handleInvite(user)}
                title="Invite to room"
              >
                Invite
              </button>
            )}
            {onPrivateMessage && (
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                onClick={() => handlePrivateMessage(user)}
                title="Send private message"
              >
                Message
              </button>
            )}
          </div>
        </li>
      ))}
      {users.filter(u => u !== currentUser).length === 0 && (
        <li className="text-gray-500 text-center py-4">No other users online</li>
      )}
    </ul>
  );
}

export default UserList; 
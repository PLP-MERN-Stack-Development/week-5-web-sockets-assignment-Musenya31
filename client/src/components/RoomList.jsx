import React from 'react';

function RoomList({ rooms, onJoin }) {
  return (
    <ul>
      {rooms.map((room, idx) => (
        <li key={idx}>
          <button className="text-blue-600 underline" onClick={() => onJoin(room)}>{room}</button>
        </li>
      ))}
    </ul>
  );
}

export default RoomList; 
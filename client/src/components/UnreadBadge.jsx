import React from 'react';

function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
      {count}
    </span>
  );
}

export default UnreadBadge; 
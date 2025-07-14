import React from 'react';

function FileInput({ onSendFile }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onSendFile({
          name: file.name,
          type: file.type,
          data: ev.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <input type="file" onChange={handleChange} className="my-2" />
  );
}

export default FileInput; 
# ChatApp

## Project Overview
ChatApp is a real-time chat application built with the MERN stack and Socket.io. It allows users to join chat rooms, send public and private messages, see who is online, and interact with others in real time. The app supports file sharing, typing indicators, message reactions, and more, providing a modern chat experience.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn
- MongoDB (local or cloud instance)

### 1. Clone the Repository
```bash
https://github.com/PLP-MERN-Stack-Development/week-5-web-sockets-assignment-Musenya31.git
cd CHATAPP
```

### 2. Install Server Dependencies
```bash
cd server
npm install
```

### 3. Install Client Dependencies
```bash
cd ../client
npm install
```

### 4. Configure Environment Variables
- In the `server` directory, create a `.env` file:
  ```env
  PORT=5000
  CLIENT_URL=http://localhost:5173
  MONGO_URI=your_mongodb_connection_string
  ```
- Replace `your_mongodb_connection_string` with your actual MongoDB URI.

### 5. Start the Server
```bash
cd ../server
npm start
```

### 6. Start the Client
```bash
cd ../client
npm run dev
```

- The client will run on `http://localhost:5173` by default.
- The server will run on `http://localhost:5000` by default.

## Features Implemented
- **User Authentication**: Login and join chat rooms with a username.
- **Real-Time Messaging**: Send and receive messages instantly using Socket.io.
- **Chat Rooms**: Join public rooms or create private chats.
- **Private Messaging**: Send direct messages to other users.
- **Online Users List**: See who is currently online.
- **Typing Indicators**: See when other users are typing.
- **Message Reactions**: React to messages with emojis.
- **File Sharing**: Upload and share files in chat.
- **Unread Message Badges**: See unread message counts per room.
- **Message Search**: Search through chat history.
- **Notifications**: Audio and visual notifications for new messages.

## Folder Structure
```
CHATAPP/
  client/    # React frontend
  server/    # Express/Socket.io backend
```

## License
This project is for educational purposes as part of the PLP MERN Stack Development course. 
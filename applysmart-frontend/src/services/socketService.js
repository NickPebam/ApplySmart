import { io } from 'socket.io-client';

let socket = null;
let activeUserId = null;

export const initSocket = () => {
  if (socket?.connected) return socket;

  // Clean up any dead socket first
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io('http://localhost:3001', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  return socket;
};

export const subscribeToNotifications = (userId, callback) => {
  // If already subscribed for this user, skip
  if (activeUserId === userId && socket?.connected) return;

  activeUserId = userId;
  const s = initSocket();
  // Remove any stale listener for this event before adding a fresh one
  s.off(`notification-${userId}`);
  s.on(`notification-${userId}`, callback);
};

export const unsubscribeNotifications = (userId) => {
  if (socket) {
    socket.off(`notification-${userId}`);
  }
  activeUserId = null;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    activeUserId = null;
  }
};

export const getSocket = () => socket;
import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    // Connect to current origin
    socket = io(window.location.origin, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to real-time server with ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });
  }
  return socket;
}

export function onFoodAvailabilityUpdated(callback) {
  const s = getSocket();
  s.on('food:availabilityUpdated', callback);
  return () => s.off('food:availabilityUpdated', callback);
}

export function onFoodNewPosted(callback) {
  const s = getSocket();
  s.on('food:newPosted', callback);
  return () => s.off('food:newPosted', callback);
}

export function onFoodUpdated(callback) {
  const s = getSocket();
  s.on('food:updated', callback);
  return () => s.off('food:updated', callback);
}

export function onFoodDeleted(callback) {
  const s = getSocket();
  s.on('food:deleted', callback);
  return () => s.off('food:deleted', callback);
}

export function onNewIncomingOrder(callback) {
  const s = getSocket();
  s.on('order:newIncoming', callback);
  return () => s.off('order:newIncoming', callback);
}

export function onOrderStatusChanged(callback) {
  const s = getSocket();
  s.on('order:statusChanged', callback);
  return () => s.off('order:statusChanged', callback);
}

export function onVendorUpdated(callback) {
  const s = getSocket();
  s.on('radar:vendorUpdated', callback);
  return () => s.off('radar:vendorUpdated', callback);
}

export function joinVendorRoom(vendorId) {
  if (!vendorId) return;
  const s = getSocket();
  s.emit('join:vendor', vendorId);
}

export function joinUserRoom(userId) {
  if (!userId) return;
  const s = getSocket();
  s.emit('join:user', userId);
}

'use client';

import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './constants';
import type { SeatUpdateEvent, ViewerCountEvent } from './types';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectSocket(token?: string) {
  const s = getSocket();
  if (token) s.auth = { token };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}

export function joinShowtime(showtimeId: string) {
  getSocket().emit('join:showtime', { showtimeId });
}

export function leaveShowtime(showtimeId: string) {
  getSocket().emit('leave:showtime', { showtimeId });
}

export function onSeatUpdate(handler: (e: SeatUpdateEvent) => void) {
  getSocket().on('seat:update', handler);
  return () => getSocket().off('seat:update', handler);
}

export function onBulkSeatUpdate(handler: (e: SeatUpdateEvent[]) => void) {
  getSocket().on('seat:bulk-update', handler);
  return () => getSocket().off('seat:bulk-update', handler);
}

export function onViewerCount(handler: (e: ViewerCountEvent) => void) {
  getSocket().on('viewer:count', handler);
  return () => getSocket().off('viewer:count', handler);
}

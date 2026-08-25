import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const listeners: Array<(event: string, data: any) => void> = [];

export const socketService = {
  connect(token: string, onEvent?: (event: string, data: any) => void) {
    if (onEvent && !listeners.includes(onEvent)) {
      listeners.push(onEvent);
    }

    if (socket) return;

    socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ Live Control Room realtime socket connected:', socket?.id);
    });

    const events = [
      'new_incident',
      'incident_synced',
      'priority_updated',
      'alert_created',
      'assignment_created',
      'verification_completed',
      'status_changed',
      'observation_received',
      'tip:submitted',
      'tip:created',
      'tip:updated',
    ];

    events.forEach((eventName) => {
      socket?.on(eventName, (data) => {
        listeners.forEach((listener) => {
          try {
            listener(eventName, data);
          } catch (e) {
            console.warn('Socket listener error:', e);
          }
        });
      });
    });
  },

  addListener(onEvent: (event: string, data: any) => void) {
    if (!listeners.includes(onEvent)) {
      listeners.push(onEvent);
    }
  },

  removeListener(onEvent: (event: string, data: any) => void) {
    const idx = listeners.indexOf(onEvent);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
};

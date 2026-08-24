import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const socketService = {
  connect(token: string, onEvent: (event: string, data: any) => void) {
    if (socket) return;

    socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('⚡ Live Control Room realtime socket connected');
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
    ];

    events.forEach((eventName) => {
      socket?.on(eventName, (data) => {
        onEvent(eventName, data);
      });
    });
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
};

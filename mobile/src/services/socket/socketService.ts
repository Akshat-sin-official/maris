import { ENV } from '../../constants/env';

export class SocketService {
  private socket: any = null;
  private connectedToken: string | null = null;

  public connect(token: string) {
    this.connectedToken = token;
    // Architecture placeholder for Socket.IO connection handling
    console.log(`Connecting Socket.IO client to ${ENV.SOCKET_URL} with token: ${token.substring(0, 10)}...`);
  }

  public getConnectedToken(): string | null {
    return this.connectedToken;
  }

  public disconnect() {
    this.connectedToken = null;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();

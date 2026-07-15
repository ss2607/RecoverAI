import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;

  connect(token: string) {
    if (!token) {
      this.disconnect();
      return;
    }

    // Deduplication check: if socket already exists and token is unchanged, do nothing
    if (this.socket && this.currentToken === token) {
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return;
    }

    // Disconnect previous connection if token changes
    this.disconnect();

    this.currentToken = token;

    // Connect to server (using relative path since development uses proxy or same origin)
    const backendUrl = window.location.origin;

    this.socket = io(backendUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5, // Avoid infinite reconnection loops on bad tokens
      reconnectionDelay: 3000
    });

    this.socket.on('connect', () => {
      console.log('Socket client connected successfully');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      // If error indicates auth failure (e.g. invalid/expired token), stop reconnection attempts
      if (error.message.includes('Authentication error') || error.message.includes('auth')) {
        console.warn('Auth token expired or invalid. Disconnecting socket.');
        this.disconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket client disconnected:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();

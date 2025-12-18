import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect(token: string, tenantId: string) {
    if (this.socket?.connected) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    
    this.socket = io(wsUrl, {
      auth: { token, tenantId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('WebSocket conectado');
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket desconectado:', reason);
      this.emit('disconnected', { reason });
      
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erro de conexão WebSocket:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Máximo de tentativas de reconexão atingido');
        this.emit('connection_failed');
      }
    });

    this.socket.on('notification', (data) => {
      window.dispatchEvent(new CustomEvent('websocket:notification', { detail: data }));
      this.notifyListeners('notification', data);
    });

    this.socket.on('task:updated', (data) => {
      window.dispatchEvent(new CustomEvent('websocket:task:updated', { detail: data }));
      this.notifyListeners('task:updated', data);
    });

    this.socket.on('project:updated', (data) => {
      window.dispatchEvent(new CustomEvent('websocket:project:updated', { detail: data }));
      this.notifyListeners('project:updated', data);
    });

    this.socket.on('task:created', (data) => {
      window.dispatchEvent(new CustomEvent('websocket:task:created', { detail: data }));
      this.notifyListeners('task:created', data);
    });

    this.socket.on('project:created', (data) => {
      window.dispatchEvent(new CustomEvent('websocket:project:created', { detail: data }));
      this.notifyListeners('project:created', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Erro ao executar listener para ${event}:`, error);
      }
    });
  }

  private emit(event: string, data?: any) {
    window.dispatchEvent(new CustomEvent(`websocket:${event}`, { detail: data }));
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  emitEvent(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;


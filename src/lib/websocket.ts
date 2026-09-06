/**
 * WebSocket Client for Real-time Communication
 * Connects to the Event Streamer service
 */

type MessageHandler = (message: WebSocketMessage) => void;

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: Date;
  id: string;
  sessionId?: string;
}

export interface WebSocketClientOptions {
  url: string;
  sessionId?: string;
  onOpen?: () => void;
  onClose?: (code: number, reason: string) => void;
  onError?: (error: Event) => void;
  onMessage?: MessageHandler;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketClientOptions>;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionallyClosed = false;

  constructor(options: WebSocketClientOptions) {
    this.options = {
      url: options.url,
      sessionId: options.sessionId || "",
      onOpen: options.onOpen || (() => {}),
      onClose: options.onClose || (() => {}),
      onError: options.onError || (() => {}),
      onMessage: options.onMessage || (() => {}),
      reconnect: options.reconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 3000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isIntentionallyClosed = false;
    
    try {
      this.ws = new WebSocket(this.options.url);
      this.setupEventListeners();
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      this.scheduleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      
      // Subscribe to session events if sessionId provided
      if (this.options.sessionId) {
        this.send({
          type: "subscribe",
          payload: {
            sessionId: this.options.sessionId,
            events: [
              "log:stdout",
              "log:stderr",
              "container:created",
              "container:started",
              "container:stopped",
              "container:error",
              "process:started",
              "process:stopped",
              "process:error",
              "port:mapped",
            ],
          },
          timestamp: new Date(),
          id: crypto.randomUUID(),
          sessionId: this.options.sessionId,
        });
      }

      this.options.onOpen();
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      this.options.onClose(event.code, event.reason);
      
      if (!this.isIntentionallyClosed && this.options.reconnect) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.options.onError(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        message.timestamp = new Date(message.timestamp);
        
        // Notify all handlers
        this.messageHandlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            console.error("Message handler error:", error);
          }
        });
        
        // Also call the legacy onMessage
        this.options.onMessage(message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error("Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectInterval * Math.min(this.reconnectAttempts, 5);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected, queuing message");
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
      return false;
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  close(): void {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, "Client closed");
      this.ws = null;
    }
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance for app-wide use
let globalClient: WebSocketClient | null = null;

export function getWebSocketClient(options?: WebSocketClientOptions): WebSocketClient {
  if (!globalClient && options) {
    globalClient = new WebSocketClient(options);
  }
  return globalClient!;
}

export function setWebSocketClient(client: WebSocketClient | null): void {
  globalClient = client;
}
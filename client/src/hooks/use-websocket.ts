import { useEffect, useState, useRef, useCallback } from "react";

type WebSocketStatus = "connecting" | "open" | "closing" | "closed" | "error";

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  autoReconnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const [lastMessage, setLastMessage] = useState<any>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef<number>(0);
  const reconnectTimerRef = useRef<number | null>(null);

  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 3000,
    reconnectAttempts = 5,
    autoReconnect = true,
  } = options;

  const connect = useCallback(() => {
    // Clean up any existing connection
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }

    // Determine the right protocol based on the current page URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    setStatus("connecting");
    const socket = new WebSocket(wsUrl);
    webSocketRef.current = socket;

    socket.onopen = () => {
      setStatus("open");
      reconnectCount.current = 0;
      if (onOpen) onOpen();
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        if (onMessage) onMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onclose = (event) => {
      setStatus("closed");
      if (onClose) onClose();

      // Attempt to reconnect if enabled
      if (autoReconnect && reconnectCount.current < reconnectAttempts) {
        reconnectTimerRef.current = window.setTimeout(() => {
          reconnectCount.current += 1;
          connect();
        }, reconnectInterval);
      }
    };

    socket.onerror = (event) => {
      setStatus("error");
      if (onError) onError(event);
      socket.close();
    };
  }, [onMessage, onOpen, onClose, onError, reconnectInterval, reconnectAttempts, autoReconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.close();
      setStatus("closing");
    }
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    connect,
    disconnect,
    sendMessage,
    lastMessage,
  };
}

import { useEffect, useState, useRef, useCallback } from "react";

// Dummy implementation to disable WebSocket functionality
type WebSocketStatus = "closed";

export function useWebSocket() {
  // Always return closed status and no-ops
  return {
    status: "closed" as WebSocketStatus,
    connect: () => {},
    disconnect: () => {},
    sendMessage: () => false,
    lastMessage: null,
  };
}

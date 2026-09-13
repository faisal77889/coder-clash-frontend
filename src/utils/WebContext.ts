import { createContext, useContext } from 'react';

export const WebsocketContext = createContext<WebSocket | null>(null);

export const useWebSocket = () => useContext(WebsocketContext);
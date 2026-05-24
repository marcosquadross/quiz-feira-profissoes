import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SessionSocketContextData {
  socket: Socket | null;
  isConnected: boolean;
}

const SessionSocketContext = createContext<SessionSocketContextData>({} as SessionSocketContextData);

const URL_FRONT = import.meta.env.VITE_API_URL;

export const SessionSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    const newSocket = io(`${URL_FRONT}/session`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      auth: {
        token: token || null,
      },
      transports: ['websocket'],
      autoConnect: true, // conecta imediatamente
    });

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));
    // Socket.IO emite 'connect' também após reconexão automática,
    // mas o evento abaixo garante que o estado seja atualizado
    newSocket.on('reconnect', () => setIsConnected(true));

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('reconnect');
      newSocket.disconnect();
    };
  }, []); // ← roda UMA vez, socket vive junto com o Provider

  return (
    <SessionSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SessionSocketContext.Provider>
  );
};

export const useSessionSocket = () => useContext(SessionSocketContext);
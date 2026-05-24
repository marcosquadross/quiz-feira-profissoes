import { createContext } from "react";
import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL;

export const socket: Socket = io(URL);

export const WebSocketContext = createContext<Socket>(socket);

export const WebSocketProvider = WebSocketContext.Provider;

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useSnackbar } from "notistack";
// import { useParams } from "react-router-dom";

interface SocketAuth {
  token: string;
  userId: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

interface SocketProviderProps {
  token?: string;
  userId?: string;
  children: ReactNode;
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<SocketProviderProps> = ({
  token,
  userId,
  children,
}) => {

  // const { sessionId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // if (!token || !userId) return;
    const savedPlayerId = localStorage.getItem("playerId");

    const socket: Socket = io(`${BASE_URL}/quiz`, {
      transports: ["websocket"],
      auth: { token, userId, playerId: savedPlayerId } as SocketAuth,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("Socket conectado");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Erro na conexão do socket:", err.message);
    });

    socket.on("quizError", (data) => {
      enqueueSnackbar(data.message, { variant: "error" });
    })

    // socket.on("error", (data) => {
    //   enqueueSnackbar(data.message, { variant: "error" });
    // })

    socketRef.current = socket;

    return () => {
      console.log("Desconectando socket...");
      socket.disconnect();
    };
  }, [token, userId]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  return useContext(SocketContext);
};

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Style } from "../interfaces/style.interface";
import { Session } from "../interfaces/session.interface";
import { loadFontOnce } from "../utils/fontLoader";
import { useSocket } from "./SocketContext"; // supondo que exista
import { createTheme } from "@mui/material";

interface SessionStyleContextValue {
  style?: Style;
  setStyle: (s?: Style) => void;
  isFontReady: boolean;
  muiTheme: ReturnType<typeof createTheme>;
}

const SessionStyleContext = createContext<SessionStyleContextValue | undefined>(undefined);

interface SessionStyleProviderProps {
  children: React.ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL;

export const SessionStyleProvider = ({ children }: SessionStyleProviderProps) => {
  const { socket } = useSocket();
  const [style, setStyle] = useState<Style | undefined>(() => {
    try {
      const s = localStorage.getItem("sessionStyle");
      return s ? JSON.parse(s) : undefined;
    } catch { return undefined; }
  });
  const [isFontReady, setIsFontReady] = useState<boolean>(false);

  // Quando style muda: persistir e carregar fonte
  useEffect(() => {
    if (!style) {
      setIsFontReady(true);
      localStorage.removeItem("sessionStyle");
      return;
    }
    localStorage.setItem("sessionStyle", JSON.stringify(style));
    setIsFontReady(false);
    loadFontOnce(style.fontFamily ?? "", API_URL).finally(() => setIsFontReady(true));
  }, [style]);

  // Ouvir socket (ex.: sessionCreated, hostJoined, playerReconnected)
  useEffect(() => {
    if (!socket) return;

    const onSessionCreated = ({ style: s }: { style: Style }) => setStyle(s);
    const onHostJoined = ({ style: s }: { style: Style }) => setStyle(s);
    const onPlayerJoined = ({ style: s }: { style: Style }) => setStyle(s);
    const onJoined = ({ style: s }: { style: Style }) => setStyle(s);
    const getResult = ({ result: r }: { result: Session }) => setStyle(r.quiz.style);
    
    socket.on("sessionCreated", onSessionCreated);
    socket.on("hostJoined", onHostJoined);
    socket.on("playerJoined", onPlayerJoined);
    socket.on("joined", onJoined)

    return () => {
      socket.off("sessionCreated", onSessionCreated);
      socket.off("hostJoined", onHostJoined);
      socket.off("playerJoined", onPlayerJoined);
      socket.off("joined", onJoined);
      socket.off("sessionResult", getResult);
    };
  }, [socket]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: { text: { primary: style?.textColor ?? "#000" } },
        typography: { fontFamily: style?.fontFamily ?? undefined },
      }),
    [style],
  );

  return (
    <SessionStyleContext.Provider value={{ style, setStyle, isFontReady, muiTheme }}>
      {children}
    </SessionStyleContext.Provider>
  );
};

export function useSessionStyle() {
  const ctx = useContext(SessionStyleContext);
  if (!ctx) throw new Error("useSessionStyle must be used within SessionStyleProvider");
  return ctx;
}

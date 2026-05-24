import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  createTheme,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useSessionSocket } from "../../contexts/SessionSocketContext";
import { useDynamicFont } from "../../hooks/useDynamicFont";
import { Style } from "../../interfaces/style.interface";

export function PlayerLobby() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { socket, isConnected } = useSessionSocket(); // ← removido connect

  const [nickname, setNickname] = useState<string>(
    localStorage.getItem("userName") || localStorage.getItem("nickname") || ""
  );
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<{ userId: string; nickname: string }[]>([]);
  const [style, setStyle] = useState<Style | null>(null);

  useDynamicFont(style?.fontFamily);

  const theme = useMemo(() => createTheme({
    palette: {
      text: { primary: style?.textColor || '#000000' },
      background: { default: style?.backgroundColor || '#ffffff' },
    },
    typography: {
      fontFamily: style?.fontFamily || 'Roboto',
    },
  }), [style?.textColor, style?.fontFamily, style?.backgroundColor]);

  const joinSession = useCallback((nicknameToJoin: string) => {
    if (!nicknameToJoin || !socket || !isConnected || !sessionId) return;

    const savedPlayerId = localStorage.getItem("playerId");
    const loggedUserId = localStorage.getItem("userId");

    socket.emit("join_session", {
      sessionAccessId: sessionId,
      nickname: nicknameToJoin,
      playerId: savedPlayerId || undefined,
      userId: loggedUserId || undefined,
    }, (response: any) => {
      if (response?.status === 'ok') {
        localStorage.setItem("playerId", response.userId);
        localStorage.setItem("nickname", nicknameToJoin);
        localStorage.setItem("lastSessionId", sessionId);
        setPlayers(response.players);
        if (response.style) setStyle(response.style);
        setJoined(true);
      }
    });
  }, [socket, isConnected, sessionId]);

  useEffect(() => {
    if (!isConnected || !socket || joined) return;

    const lastSessionId = localStorage.getItem("lastSessionId");
    const savedNickname = localStorage.getItem("username")
      || localStorage.getItem("nickname");

    if (lastSessionId && lastSessionId !== sessionId) {
      localStorage.removeItem("playerId");
      return;
    }

    if (savedNickname) {
      joinSession(savedNickname);
    }
  }, [isConnected, socket, sessionId, joined, joinSession]);

  useEffect(() => {
    if (!socket || !isConnected || !joined) return;

    socket.on("players_list_updated", (data: { id: string; nickname: string }[]) => {
      setPlayers(data.map(p => ({ userId: p.id, nickname: p.nickname })));
    });

    socket.on("session_started", () => {
      navigate(`/${sessionId}/question-session`);
    });

    return () => {
      socket.off("players_list_updated");
      socket.off("session_started");
    };
  }, [socket, isConnected, joined, sessionId, navigate]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ background: style?.backgroundColor, minHeight: "100vh", py: 4 }}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>

            <Box mb={3}>
              <Typography variant="h5" fontWeight={600}>
                {joined ? "Aguardando Início" : "Entrar no Quiz"}
              </Typography>
            </Box>

            {!joined ? (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  fullWidth
                  label="Seu apelido"
                  variant="outlined"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={!isConnected}
                  onKeyDown={(e) => e.key === 'Enter' && joinSession(nickname)} // ← bônus de UX
                />
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => joinSession(nickname)}
                  disabled={!nickname.trim() || !isConnected}
                  fullWidth
                >
                  Entrar na sala
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" color="primary" gutterBottom>
                  Olá, {nickname}!
                </Typography>

                <Typography variant="subtitle1" fontWeight={500} mt={2}>
                  Jogadores conectados ({players.length})
                </Typography>

                <Box display="flex" flexWrap="wrap" gap={1} mt={2} justifyContent="center">
                  {players.length === 0 ? (
                    <Typography color="text.secondary">
                      Aguardando jogadores...
                    </Typography>
                  ) : (
                    players.map((p) => (
                      <Box
                        key={p.userId}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          backgroundColor: "primary.light",
                          color: "white",
                          fontSize: 14,
                        }}
                      >
                        {p.nickname}
                      </Box>
                    ))
                  )}
                </Box>

                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    O host iniciará em breve...
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
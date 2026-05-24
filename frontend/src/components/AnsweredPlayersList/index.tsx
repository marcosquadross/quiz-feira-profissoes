import { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import { useSessionSocket } from "../../contexts/SessionSocketContext";
import "./style.css";

interface PlayerStatus {
  id: string;
  nickname: string;
  answered: boolean;
}

interface AnsweredPlayersListProps {
  sessionId?: string;
}

export function AnsweredPlayersList({ sessionId }: AnsweredPlayersListProps) {
  const { socket } = useSessionSocket();
  const [players, setPlayers] = useState<PlayerStatus[]>([]);

  useEffect(() => {
    if (!socket || !sessionId || sessionId.trim() === "" || sessionId === "undefined") {
      return;
    }

    const handlePlayersStatus = (playersStatus: PlayerStatus[]) => {
      console.log("Received players status:", playersStatus);
      setPlayers(playersStatus);
    };

    socket.on("playersStatus", handlePlayersStatus);
    socket.emit("getPlayersStatus", { sessionAccessId: sessionId });

    return () => {
      socket.off("playersStatus", handlePlayersStatus);
    };
  }, [socket, sessionId]);

  const answered = players.filter((p) => p.answered).length;
  const waiting = players.filter((p) => !p.answered).length;
  const total = players.length;

  return (
    <Paper className="players-card" elevation={2}>
      <Typography variant="h6" className="players-title">
        Jogadores
      </Typography>

      {players.length > 0 ? (
        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1.5}>
          <Box
            sx={{
              bgcolor: "warning.50",
              borderRadius: 2,
              p: 1.5,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "warning.main", fontWeight: 500, display: "block", mb: 0.5 }}
            >
              Esperando
            </Typography>
            <Typography variant="h5" sx={{ color: "warning.main", fontWeight: 500 }}>
              {waiting}
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "success.50",
              borderRadius: 2,
              p: 1.5,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "success.main", fontWeight: 500, display: "block", mb: 0.5 }}
            >
              Respondido
            </Typography>
            <Typography variant="h5" sx={{ color: "success.main", fontWeight: 500 }}>
              {answered}
            </Typography>
          </Box>

          <Box
            sx={{
              bgcolor: "grey.100",
              borderRadius: 2,
              p: 1.5,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 500, display: "block", mb: 0.5 }}
            >
              Total
            </Typography>
            <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 500 }}>
              {total}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" py={2} gap={1}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Carregando jogadores...
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
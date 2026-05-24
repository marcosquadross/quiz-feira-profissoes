import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Paper, Typography, Container, FormControlLabel, Switch, createTheme, ThemeProvider } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSnackbar } from "notistack";
import { useSessionSocket } from "../../contexts/SessionSocketContext";
import { useDynamicFont } from "../../hooks/useDynamicFont";
import { Style } from "../../interfaces/style.interface";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5173";

export function HostLobby() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const { socket, isConnected } = useSessionSocket();

  const [players, setPlayers] = useState<{ userId: string; nickname: string }[]>([]);
  const [autoRelease, setAutoRelease] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [style, setStyle] = useState<Style | null>(null);

  useDynamicFont(style?.fontFamily);

  const theme = useMemo(() => createTheme({
    palette: {
      text: { primary: style?.textColor || '#000000' },
    },
    typography: {
      fontFamily: style?.fontFamily || 'Roboto',
    },
  }), [style?.textColor, style?.fontFamily]);

  useEffect(() => {
    if (!socket || !isConnected || !sessionId || isJoined) return;

    socket.emit("join_session", {
      sessionAccessId: sessionId,
      nickname: "",
    }, (res: any) => {
      if (res?.status === 'ok' && res.role === 'host') {
        if (res.style) setStyle(res.style);

        if (res.players?.length) {
          setPlayers(res.players.map((p: any) => ({
            userId: p.id,
            nickname: p.nickname,
          })));
        }

        setIsJoined(true);
      } else {
        enqueueSnackbar("Erro ao entrar na sala como host", { variant: "error" });
      }
    });
  }, [socket, isConnected, sessionId, isJoined, enqueueSnackbar]);

  useEffect(() => {
    if (!socket || !isConnected || !isJoined) return;

    socket.on("player_joined", (data: { userId: string; nickname: string }) => {
      setPlayers((prev) => {
        if (prev.find(p => p.userId === data.userId)) return prev;
        return [...prev, data];
      });
      enqueueSnackbar(`${data.nickname} entrou!`, { variant: "success" });
    });

    socket.on("player_left", (userId: string) => {
      setPlayers((prev) => prev.filter(p => p.userId !== userId));
    });

    socket.on("session_started", () => {
      navigate(`/${sessionId}/question-session`);
    });

    return () => {
      socket.off("player_joined");
      socket.off("player_left");
      socket.off("session_started");
    };
  }, [socket, isConnected, isJoined, sessionId, navigate, enqueueSnackbar]);

  const handleStartQuiz = () => {
    if (!socket || !isConnected || !isJoined) return;
    socket.emit("start_session", { sessionAccessId: sessionId });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${BASE_URL}/session/${sessionId}`);
      enqueueSnackbar("Link copiado!", { variant: "info" });
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  const handleToggleAutoRelease = (value: boolean) => {
    setAutoRelease(value);
    if (!socket || !isConnected) return;
    socket.emit("update_session_settings", {
      sessionAccessId: sessionId,
      autoRelease: value
    });
    enqueueSnackbar(`Auto liberar: ${value ? "Ativado" : "Desativado"}`, { variant: "info" });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        backgroundColor: style?.backgroundColor || "#F7F9FC",
        minHeight: "100vh",
        py: 4,
        fontFamily: style?.fontFamily,
      }}>
        <Container maxWidth="md">
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: isConnected ? "success.main" : "error.main",
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {isConnected ? "Conectado ao servidor" : "Desconectado - Tentando reconectar..."}
            </Typography>
          </Box>

          <Box mb={4} textAlign="center">
            <Typography variant="h4" fontWeight={600}>
              Sala do Quiz
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Compartilhe o código ou link com os jogadores
            </Typography>
          </Box>

          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "grey.200",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Box textAlign="center" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Código: {sessionId}
              </Typography>
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={copyToClipboard}
                sx={{ mt: 1, textTransform: "none" }}
              >
                Copiar link
              </Button>
            </Box>

            <Box mb={4}>
              <Typography variant="subtitle1" fontWeight={500}>
                Jogadores conectados ({players.length})
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                {players.length === 0 ? (
                  <Typography color="text.secondary">
                    Aguardando jogadores...
                  </Typography>
                ) : (
                  players.map((p, index) => (
                    <Box
                      key={index}
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
            </Box>

            <Box
              sx={{
                mb: 4,
                p: 2,
                borderRadius: 2,
                backgroundColor: "grey.50",
                border: "1px dashed",
                borderColor: "grey.300",
                display: "flex",
                justifyContent: "center"
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRelease}
                    onChange={(e) => handleToggleAutoRelease(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Auto liberar questões
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      As perguntas iniciam o tempo sozinhas ao mudar de tela
                    </Typography>
                  </Box>
                }
              />
            </Box>

            <Box textAlign="center">
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<PlayArrowIcon />}
                disabled={players.length === 0 || !isJoined}
                onClick={handleStartQuiz}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 4,
                  minWidth: 200,
                }}
              >
                Começar agora
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, Button, Container, createTheme, ThemeProvider } from "@mui/material";

import { useSessionSocket } from "../../contexts/SessionSocketContext";
import { useDynamicFont } from "../../hooks/useDynamicFont";

import { PartialResultsSession } from "../../interfaces/partial.result.session.interface";
import { Session } from "../../interfaces/session.interface";
import { Style } from "../../interfaces/style.interface";

import { Header } from "../../components/Header";
import { QuizEndScreen } from "../../components/QuizEnd";
import { ScoreRanking } from "../../components/ScoreRanking";
import { SessionEndMessage } from "../../components/SessionEndMessage";

import "./style.css";

const DATA_URL = import.meta.env.VITE_DATA_URL;

export function SessionRanking() {
    const location = useLocation();
    const navigate = useNavigate();
    const { sessionId } = useParams();
    const { socket, isConnected } = useSessionSocket();
    const [style, setStyle] = useState<Style | undefined>(undefined);

    const [isHost, setIsHost] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [openResult, setOpenResult] = useState(false);
    const [responses, setResponses] = useState<PartialResultsSession[] | Session>([]);

    useDynamicFont(style?.fontFamily);

    const theme = useMemo(() => createTheme({
        palette: {
            text: { primary: style?.textColor || "#000000" },
        },
        typography: {
            fontFamily: style?.fontFamily || "Roboto",
        },
    }), [style?.textColor, style?.fontFamily]);

    const handleCloseDialog = () => setOpenResult(false);

    const handleNextQuestion = () => {
        socket?.emit("next_question", { sessionAccessId: sessionId });
    };

    const handleFinishSession = () => {
        navigate("/");
    };

    useEffect(() => {
        if (!socket || !isConnected) return;

        const playerId = localStorage.getItem("playerId");
        const nickname = localStorage.getItem("nickname");

        socket.emit("join_session", {
            sessionAccessId: sessionId,
            playerId: playerId || undefined,
            nickname: nickname || undefined,
        }, (response: any) => {
            if (response?.role === "host") setIsHost(true);
        });
    }, [socket, isConnected, sessionId]);
    
    useEffect(() => {
        if (!socket || !sessionId) return;

        socket.emit("requestResult", { sessionId });
    }, [socket, sessionId]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        if (location.state?.leaderboard) {
            const initialRanking = location.state.leaderboard.map((item: any) => ({
                nickname: item.nickname,
                finalScore: item.score,
            }));
            setResponses(initialRanking);
            setIsEnded(location.state.isLastQuestion || false);
        }
        if (location.state?.style) setStyle(location.state.style);

        socket.on("session_finished", (data: { podium: any[], style: Style }) => {
            setResponses(data.podium);
            setIsEnded(true);
            setShowMessage(true);
            if (data.style) setStyle(data.style);
        });

        return () => {
            socket.off("session_finished");
        };
    }, [socket, isConnected, sessionId, navigate, location.state]);

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: style?.backgroundColor || "#F7F9FC",
                    fontFamily: style?.fontFamily,
                }}
            >
                <Header
                    rightContent={
                        isHost && (
                            <Box display="flex" gap={1}>
                                {!isEnded ? (
                                    <Button variant="contained" onClick={handleNextQuestion}>
                                        Próxima Questão
                                    </Button>
                                ) : (
                                    <Button variant="contained" onClick={handleFinishSession}>
                                        Finalizar Sessão
                                    </Button>
                                )}
                            </Box>
                        )
                    }
                />

                <Box
                    sx={{
                        flex: 1,
                        position: "relative",
                        ...(style?.backgroundImage && {
                            backgroundImage: `url(${DATA_URL}/${style.backgroundImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }),
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: style?.backgroundColor || "#F7F9FC",
                            opacity: style?.backgroundImage ? 0.85 : 1,
                        }}
                    />

                    <Container maxWidth={false} sx={{ position: "relative", py: 4 }}>
                        {showMessage ? (
                            <SessionEndMessage onComplete={() => setShowMessage(false)} />
                        ) : (
                            <ScoreRanking responses={responses} />
                        )}
                    </Container>
                </Box>

                {openResult && (
                    <QuizEndScreen
                        score={Number(localStorage.getItem("score") || 0)}
                        totalTime={localStorage.getItem("totalTime") || "0s"}
                        onRestart={handleCloseDialog}
                    />
                )}
            </Box>
        </ThemeProvider>
    );
}
import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, Container, createTheme, ThemeProvider } from "@mui/material";

import { QuizAPI } from "../../api/quiz";
import { WebSocketContext } from "../../contexts/WebSocketContexts";

import { Response } from "../../interfaces/response.interface";
import { Style } from "../../interfaces/style.interface";

import { useDynamicFont } from "../../hooks/useDynamicFont";

import { FullScreenButton } from "../../components/FullScreenButton";
import { Header } from "../../components/Header";
import { HomeButton } from "../../components/HomeButton";
import { QuizEndScreen } from "../../components/QuizEnd";
import { ScoreRanking } from "../../components/ScoreRanking";

import "./style.css";

const DATA_URL = import.meta.env.VITE_DATA_URL;

type QuizResponsePayload = {
    quizId: string;
    title: string;
    accessIdentifier: string;
    responses: Response[];
};

export function Ranking() {
    const location = useLocation();
    const socket = useContext(WebSocketContext);

    const searchParams = new URLSearchParams(location.search);
    const accessIdentifiers = searchParams.get('ids') || "";
    const accessIdentifiersArray = accessIdentifiers.split(",");

    const [responses, setResponses] = useState<QuizResponsePayload[]>([]);
    const [openResult, setOpenResult] = useState(false);
    const [style, setStyle] = useState<Style>(() => {
        const saved = localStorage.getItem("quizStyle");
        return saved ? JSON.parse(saved) : undefined;
    });

    useDynamicFont(style?.fontFamily);

    const theme = useMemo(() => createTheme({
        palette: {
            text: { primary: style?.textColor || '#000000' },
        },
        typography: {
            fontFamily: style?.fontFamily || 'Roboto',
        },
    }), [style?.textColor, style?.fontFamily]);

    const handleSocketMessage = (data: QuizResponsePayload[]) => {
        const filteredQuizzes = data.filter((quiz) =>
            accessIdentifiersArray.includes(String(quiz.accessIdentifier))
        );
        setResponses(filteredQuizzes);
    };

    const handleGetResponses = async () => {
        const nickname = localStorage.getItem("nickname");
        if (nickname) setOpenResult(true);

        if (accessIdentifiersArray.length === 1) {
            const getQuiz = await QuizAPI.getQuiz(accessIdentifiersArray[0]);
            if (getQuiz) {
                setStyle(getQuiz.style);
                localStorage.setItem("quizStyle", JSON.stringify(getQuiz.style));
            }
        }

        const data = await QuizAPI.getIds(accessIdentifiers);
        setResponses(data);
    };

    const handleCloseDialog = () => setOpenResult(false);

    useEffect(() => {
        if (accessIdentifiers) handleGetResponses();
    }, [location.search]);

    useEffect(() => {
        socket.on('newResponse', handleSocketMessage);
        return () => { socket.off("newResponse", handleSocketMessage); };
    }, [socket]);

    useEffect(() => {
        if (typeof window.history.pushState !== 'function') return;

        window.history.pushState({}, 'hide-back-button', null);
        const onPopState = () => window.history.pushState({}, 'hide-back-button', null);
        window.addEventListener('popstate', onPopState);

        return () => {
            window.history.pushState({}, '', '');
            window.removeEventListener('popstate', onPopState);
        };
    }, []);

    useEffect(() => {
        const handleUnload = () => {
            localStorage.removeItem("nickname");
            localStorage.removeItem("score");
            localStorage.removeItem("totalTime");
            localStorage.removeItem("responseId");
            localStorage.removeItem("quizStyle");
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => {
            handleUnload();
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#F7F9FC", display: "flex", flexDirection: "column" }}>
                <Header
                    rightContent={
                        accessIdentifiersArray.length === 1 && (
                            <Box display="flex" gap={1} alignItems="center">
                                <HomeButton accessIdentifier={accessIdentifiersArray[0]} />
                                <FullScreenButton />
                            </Box>
                        )
                    }
                />

                <Box
                    sx={{
                        flex: 1,
                        position: "relative",
                        ...(accessIdentifiersArray.length === 1 && {
                            backgroundImage: `url(${DATA_URL}/${style?.backgroundImage})`,
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
                        <ScoreRanking responses={responses} />
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

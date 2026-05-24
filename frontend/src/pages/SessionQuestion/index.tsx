import { useEffect, useState, useCallback, useRef, useMemo } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, createTheme, ThemeProvider } from "@mui/material";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";

import { useSessionSocket } from "../../contexts/SessionSocketContext";
import { useDynamicFont } from "../../hooks/useDynamicFont";

import { AnsweredPlayersList } from "../../components/AnsweredPlayersList";
import { ControlButtons } from "../../components/ControlButtons";
import { FullScreenButton } from "../../components/FullScreenButton";
import { NewTimer } from "../../components/NewTimer";
import { QuestionLayout } from "../../components/QuestionProgress";
import { QuestionTransitionWrapper } from "../../components/QuestionTransitionWrapper";
import { ScoreDisplay } from "../../components/ScoreDisplay";

import { Style } from "../../interfaces/style.interface";

import "./style.css";

export function SessionQuestion() {
    const { sessionId } = useParams();
    const { socket, isConnected } = useSessionSocket();
    const navigate = useNavigate();
    const [style, setStyle] = useState<Style | undefined>(undefined);

    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answersOptions, setAnswersOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [isHost, setIsHost] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isReleased, setIsReleased] = useState(false);

    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [endTime, setEndTime] = useState<number>(0);
    const [currentMaxScore, setCurrentMaxScore] = useState<number>(0);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [autoRelease, setAutoRelease] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [isAnswerSent, setIsAnswerSent] = useState(false);

    const prevQuestionIndexRef = useRef<number | null>(null);
    const hasJoinedRef = useRef(false);
    const [isScoreReady, setIsScoreReady] = useState(false);

    useDynamicFont(style?.fontFamily);

    const theme = useMemo(() => createTheme({
        palette: {
            text: { primary: style?.textColor || "#000000" },
        },
        typography: {
            fontFamily: style?.fontFamily || "Roboto",
        },
    }), [style?.textColor, style?.fontFamily]);

    useEffect(() => {
        if (isReleased) {
            if (endTime) {
                const duration = currentQuestion?.duration || currentQuestion?.time || 30;
                setStartTime(endTime - (duration * 1000));
            } else {
                setStartTime(Date.now());
            }
        }
    }, [isReleased, currentQuestion]);

    const handleAnswerChange = (option: string) => {
        if (isAnswerSent || !isReleased || isPaused) return;
        setSelectedAnswer(option);
    };

    const handleToggleAutoRelease = (value: boolean) => {
        setAutoRelease(value);
        socket?.emit("update_session_settings", {
            sessionAccessId: sessionId,
            autoRelease: value,
        });
    };

    const setupQuestion = useCallback((question: any) => {
        if (!question) return;

        setIsScoreReady(false);
        setCurrentQuestion(question);
        setQuestionIndex(question.index || 0);
        setIsPaused(false);

        if (prevQuestionIndexRef.current !== question.index) {
            setIsAnswerSent(false);
            setSelectedAnswer("");
            prevQuestionIndexRef.current = question.index;
        }

        if (question.time && question.time > Date.now()) {
            setEndTime(question.time);
            setIsReleased(true);
        } else {
            setRemainingTime(question.duration);
            setIsReleased(false);
        }

        setCurrentMaxScore(question.maxScore);

        const options = question.options || [
            question.answer1, question.answer2, question.answer3,
            question.answer4, question.answer5, question.answer6,
        ].filter(Boolean);

        setAnswersOptions(options);
    }, [isHost]);

    const handleRelease = () => {
        socket?.emit("release_question", {
            sessionAccessId: sessionId,
        });
    };

    const confirmQuestion = () => {
        if (
            !selectedAnswer ||
            !currentQuestion ||
            isPaused ||
            !isReleased ||
            isAnswerSent
        )
            return;

        const timeSpent = (Date.now() - startTime) / 1000;

        socket?.emit(
            "send_answer",
            {
                sessionAccessId: sessionId,
                selectedOption: selectedAnswer,
                timeSpent,
            },
            (response: any) => {
                if (response?.status === "success") {
                    setIsAnswerSent(true);
                }
            }
        );
    };

    const handlePause = () =>
        socket?.emit("pause_session", { sessionAccessId: sessionId });

    const handleResume = () =>
        socket?.emit("resume_session", {
            sessionAccessId: sessionId,
            remainingTime,
        });

    const handleNext = () =>
        socket?.emit("next_question", { sessionAccessId: sessionId });

    useEffect(() => {
        if (!socket || !isConnected) return;

        // socket.once("session_started", (data: any) => {
        //     setupQuestion(data.question);
        //     console.log("Session started with question:", data.question);
        //     if (data.style) setStyle(data.style);
        // });

        socket.on("new_question", (data: any) => {
            setIsAnswerSent(false);
            setSelectedAnswer("");
            setupQuestion(data.question);
        });

        socket.on("session_paused", () => setIsPaused(true));

        socket.on("session_resumed", (data: { endTime: number }) => {
            setIsPaused(false);
            setEndTime(data.endTime);
        });

        socket.on("current_state_data", (data: any) => {
            if (data.status === 'waiting') return;

            if (data.role === 'host') setIsHost(true);

            if (data.autoRelease !== undefined) setAutoRelease(data.autoRelease);

            if (data.style && !style) setStyle(data.style);

            if (data.question) {
                setupQuestion(data.question);
                setTotalQuestions(data.totalQuestions || 0);
                setIsPaused(data.isPaused ?? false);

                if (data.endTime) {
                    setEndTime(data.endTime);
                    setIsReleased(true);
                } else {
                    setIsReleased(data.isReleased ?? false);
                }

                if (data.userStatus?.answered) {
                    setSelectedAnswer(data.userStatus.selectedOption);
                    setIsAnswerSent(true);
                }
            }
        });

        socket.on("question_released", (data: { endTime: number }) => {
            setEndTime(data.endTime);
            setIsReleased(true);
            setIsPaused(false);
        });

        socket.on("session_finished", (data: any) => {
            navigate(`/${sessionId}/session-ranking`, {
                state: {
                    leaderboard: data.podium,
                    isLastQuestion: true,
                    style: data.style,
                },
            });
        });

        socket.on("time_expired", () => {
            setIsReleased(false);
        });

        return () => {
            socket.off("new_question");
            socket.off("session_paused");
            socket.off("session_resumed");
            socket.off("current_state_data");
            socket.off("question_released");
            socket.off("session_finished");
            socket.off("time_expired");
        };
    }, [socket, isConnected, sessionId, navigate, setupQuestion]);

    useEffect(() => {
        if (!endTime || isPaused) return;

        const timer = setInterval(() => {
            const diff = endTime - Date.now();
            const seconds = Math.max(0, Math.ceil(diff / 1000));

            setRemainingTime(seconds);

            if (seconds <= 0) {
                clearInterval(timer);
                if (isHost) {
                    socket?.emit("time_up", { sessionAccessId: sessionId });
                }
            }
        }, 250);

        return () => clearInterval(timer);
    }, [endTime, isPaused]);

    useEffect(() => {
        if (!currentQuestion || isHost || isPaused || remainingTime <= 0) return;
        if (!currentQuestion.duration || !currentQuestion.maxScore) {
            console.warn("[SessionQuestion] duration ou maxScore ausentes:", currentQuestion);
            return;
        }

        const timeRatio = remainingTime / currentQuestion.duration;
        const scoreFactor = 0.6 + 0.4 * timeRatio;

        setCurrentMaxScore(Math.floor(currentQuestion.maxScore * scoreFactor));
        setIsScoreReady(true);
    }, [remainingTime, currentQuestion, isHost, isPaused]);

    useEffect(() => {
        if (!isConnected || !socket || !sessionId) return;

        return () => {
            hasJoinedRef.current = false;
        };
    }, [isConnected]);

    useEffect(() => {
        if (!isConnected || !socket || !sessionId) return;
        if (hasJoinedRef.current) return;

        hasJoinedRef.current = true;

        const playerId = localStorage.getItem("playerId");
        const nickname = localStorage.getItem("nickname");

        socket.emit("join_session", {
            sessionAccessId: sessionId,
            playerId: playerId || undefined,
            nickname: nickname || undefined,
        }, (res: any) => {
            if (res?.status === 'ok') {
                if (res.role === 'host') setIsHost(true);

                if (res.userId) {
                    localStorage.setItem("playerId", res.userId);
                }

                socket.emit("get_current_state", {
                    sessionAccessId: sessionId,
                    playerId: res.userId ?? playerId,
                });
            }
        });
    }, [isConnected, socket, sessionId]);

    if (!currentQuestion) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6">Carregando questão...</Typography>
            </Box>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <div
                className={`question-container ${!isReleased ? "waiting-release" : ""}`}
                style={{
                    backgroundColor: style?.backgroundColor || "#F7F9FC",
                    color: style?.textColor || "#000",
                    fontFamily: style?.fontFamily,
                }}
            >
                {!isReleased && !isHost && (
                    <div className="pause-overlay">
                        <Typography variant="h4">Prepare-se!</Typography>
                        <Typography>O host liberará a questão em breve...</Typography>
                    </div>
                )}

                {isPaused && !isHost && (
                    <div className="pause-overlay">
                        <PauseCircleOutlineIcon className="pause-icon-animation" />
                        <Typography variant="h3">JOGO PAUSADO</Typography>
                    </div>
                )}

                <div className="question-header" style={{ backgroundColor: style?.panelsColor }}>
                    <NewTimer remainingTime={remainingTime} />
                    <ScoreDisplay currentMaxScore={currentMaxScore} isReady={isScoreReady} />

                    {isHost && (
                        <ControlButtons
                            isPaused={isPaused}
                            isReleased={isReleased}
                            onPause={handlePause}
                            onResume={handleResume}
                            onNext={handleNext}
                            onRelease={handleRelease}
                            autoRelease={autoRelease}
                            onToggleAutoRelease={handleToggleAutoRelease}
                        />
                    )}

                    <FullScreenButton />
                </div>

                <QuestionTransitionWrapper id={currentQuestion._id ?? "q"}>
                    <div className="flex-question-container">
                        <QuestionLayout
                            questionNumber={questionIndex}
                            amountQuestions={totalQuestions}
                            question={currentQuestion}
                            answersOptions={answersOptions}
                            selectedAnswer={selectedAnswer}
                            handleAnswerChange={(e) => handleAnswerChange(e.target.value)}
                            confirmQuestion={confirmQuestion}
                            isHost={isHost}
                            isAnswerSent={isAnswerSent}
                        />

                        {isHost && <AnsweredPlayersList sessionId={sessionId} />}
                    </div>
                </QuestionTransitionWrapper>
            </div>
        </ThemeProvider>
    );
}


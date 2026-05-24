import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, CircularProgress, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useSnackbar } from "notistack";

import { QuizAPI } from "../../api/quiz";
import { ResponseAPI } from "../../api/response";
import { QuestionAPI } from "../../api/question";

import { Quiz } from "../../interfaces/quiz.interface";
import { Style } from "../../interfaces/style.interface";
import { Response } from "../../interfaces/response.interface";

import { useDynamicFont } from "../../hooks/useDynamicFont";
import { usePreventBackButton } from "../../hooks/usePreventBackButton";
import { usePreloadImages } from "../../hooks/usePreloadImage";

import { Countdown } from "../../components/Countdown";
import { CustomInput } from "../../components/Input";
import { FullScreenButton } from "../../components/FullScreenButton";
import { Header } from "../../components/Header";
import { RankingButton } from "../../components/RankingButton";
import { StyledButton } from "../../components/Button";

import "./style.css";

const DATA_URL = import.meta.env.VITE_DATA_URL;

const nicknameSchema = z.object({
    nickname: z
        .string()
        .nonempty("Por favor, insira um apelido.")
        .regex(/^[a-zA-Z0-9À-ú ]+$/, "O apelido deve conter apenas letras e números."),
});

type NicknameForm = z.infer<typeof nicknameSchema>;

export function Home() {
    usePreventBackButton();

    const navigate = useNavigate();
    const { accessIdentifier } = useParams<{ accessIdentifier: string }>();
    const { enqueueSnackbar } = useSnackbar();

    const userId = localStorage.getItem("userId");
    const [userName] = useState(localStorage.getItem("userName") || "");

    const [quiz, setQuiz] = useState<Quiz>();
    const [style, setStyle] = useState<Style>();
    const [isReady, setIsReady] = useState(false);
    const [countdownStarted, setCountdownStarted] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const imagesLoaded = usePreloadImages(imageUrls);
    useDynamicFont(style?.fontFamily);

    const { control, handleSubmit } = useForm<NicknameForm>({
        resolver: zodResolver(nicknameSchema),
        defaultValues: { nickname: userName || "" },
    });

    const fetchQuiz = useCallback(async () => {
        try {
            const foundQuiz = await QuizAPI.getQuiz(accessIdentifier!);
            if (!foundQuiz) throw new Error("Quiz não encontrado");
            setQuiz(foundQuiz);
            setStyle(foundQuiz.style);
            setIsReady(true);
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Erro ao carregar o quiz.", { variant: "error" });
        }
    }, [accessIdentifier, enqueueSnackbar]);

    const sendResponse = useCallback(async (nickname: string) => {
        if (!quiz?._id) throw new Error("Quiz não encontrado");
        try {
            const response: Response = await ResponseAPI.create(nickname, quiz._id!, userId!);
            if (!response._id) throw new Error("ID da resposta não encontrado");
            localStorage.setItem("responseId", response._id);
            return true;
        } catch {
            return false;
        }
    }, [quiz, userId]);

    const onSubmit = async ({ nickname }: NicknameForm) => {
        if (!quiz) return;

        const finalNickname = userName || nickname;
        if (!finalNickname) {
            enqueueSnackbar("Por favor, insira ou confirme seu apelido.", { variant: "error" });
            return;
        }

        localStorage.setItem("nickname", finalNickname);
        localStorage.setItem("quiz", quiz.accessIdentifier);

        const success = await sendResponse(finalNickname);
        if (!success) {
            localStorage.removeItem("nickname");
            enqueueSnackbar("Apelido já utilizado. Por favor, insira outro.", { variant: "error" });
            return;
        }

        const response = await QuestionAPI.getQuestionsByQuiz(quiz.accessIdentifier);
        setImageUrls(response.images);
        setCountdownStarted(true);
    };

    const theme = useMemo(() => createTheme({
        palette: { text: { primary: style?.textColor } },
        typography: { fontFamily: style?.fontFamily },
    }), [style]);

    useEffect(() => {
        localStorage.removeItem("nickname");
        fetchQuiz();
    }, [fetchQuiz]);

    if (!isReady) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!quiz) {
        return (
            <div className="quiz-home">
                <Typography variant="h3" align="center">Quiz não encontrado</Typography>
            </div>
        );
    }

    const handleCountdownComplete = () => navigate(`/question/${accessIdentifier}`);

    return (
        <ThemeProvider theme={theme}>
            {countdownStarted ? (
                <div className="quiz-home-container">
                    <div
                        className="quiz-home"
                        style={{
                            backgroundColor: style?.backgroundColor || "#fff",
                            ...(style?.backgroundImage && { backgroundImage: `url(${DATA_URL}/${style.backgroundImage})` }),
                        }}
                    >
                        <Countdown onComplete={handleCountdownComplete} />
                        {!imagesLoaded && (
                            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                                Carregando imagens...
                            </Typography>
                        )}
                    </div>
                </div>
            ) : (
                <div className="quiz-home-container">
                    <Header
                        rightContent={
                            <div className="header-buttons">
                                <RankingButton />
                                <FullScreenButton />
                            </div>
                        }
                    />
                    <div
                        className="quiz-home"
                        style={{
                            backgroundColor: style?.backgroundColor || "#fff",
                            ...(style?.backgroundImage && { backgroundImage: `url(${DATA_URL}/${style.backgroundImage})` }),
                        }}
                    >
                        <div className="quiz-container">
                            <div className="content-container" style={{ background: style?.panelsColor }}>

                                {/* Cabeçalho com badge + hierarquia clara */}
                                <div className="card-header">
                                    <span className="quiz-badge">
                                        {quiz.selectedQuestions} perguntas
                                    </span>
                                    <Typography variant="h4" className="title">{quiz.title}</Typography>
                                </div>

                                {/* Formulário com label explícita e agrupamento semântico */}
                                <form className="quiz-input-container" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="form-group">
                                        <label className="form-label">Nome do jogador</label>
                                        {userName ? (
                                            <Typography variant="h6" align="center">{userName}</Typography>
                                        ) : (
                                            <CustomInput
                                                name="nickname"
                                                control={control}
                                                type="text"
                                                placeholder="Digite seu nome para começar"
                                                size="medium"
                                            />
                                        )}
                                    </div>

                                    <StyledButton
                                        className="start-button"
                                        variant="contained"
                                        color="success"
                                        type="submit"
                                        fullWidth
                                    >
                                        Iniciar quiz
                                    </StyledButton>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ThemeProvider>
    );
}

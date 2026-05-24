import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";

import { QuizAPI } from "../../api/quiz";
import { QuestionAPI } from "../../api/question";
import { ResponseAPI } from "../../api/response";

import { QuestionInterface } from "../../interfaces/question.interface";
import { Response } from "../../interfaces/response.interface";
import { Style } from "../../interfaces/style.interface";

import { Timer } from "../../components/Timer";
import { CustomizedSnackbar } from "../../components/Snackbar";
import { Score } from "../../components/Score";
import { FullScreenButton } from "../../components/FullScreenButton";
import { CancelButton } from "../../components/CancelButton";
import { QuestionTransitionWrapper } from "../../components/QuestionTransitionWrapper";
import { QuestionHeader } from "../../components/QuestionHeader";
import { QuestionLayout } from "../../components/QuestionProgress";

import { useSnackbar } from "../../hooks/useSnackbar";

import './style.css';

const DATA_URL = import.meta.env.VITE_DATA_URL;

export function Question() {
    const { accessIdentifier } = useParams();
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState<QuestionInterface>();
    const [quizQuestions, setQuizQuestions] = useState<QuestionInterface[]>([]);
    const [answersOptions, setAnswersOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string>("");
    const [questionNumber, setQuestionNumber] = useState<number>(0);
    const [amountQuestions, setAmountQuestions] = useState<number>(0);
    const [totalTime, setTotalTime] = useState<number>(0);
    const [submitted, setSubmitted] = useState(false);
    const [questions, setQuestions] = useState<QuestionInterface[]>([]);
    const [scoreQuestion] = useState<number[]>([]);
    const [answers] = useState<string[]>([]);
    const [answerTime] = useState<number[]>([]);
    const [startTime, setStartTime] = useState<number>();
    const [style, setStyle] = useState<Style>();
    const { open, message, showSnackbar, handleClose } = useSnackbar();
    const theme = createTheme({
        palette: {
            text: {
                primary: style?.textColor,
            },
        },
        typography: {
            fontFamily: style?.fontFamily,
        },
    });


    const shuffleArray = (array: string[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const getQuestions = async () => {
        const quiz = await QuizAPI.getQuiz(accessIdentifier!);
        const response = await QuestionAPI.getQuestionsByQuiz(accessIdentifier!);
        setStyle(quiz.style);

        setAmountQuestions(quiz.selectedQuestions);
        setQuizQuestions(response.questions.slice(0, quiz.selectedQuestions));
        setQuestions(response.questions.slice(0, quiz.selectedQuestions));
        getCurrentQuestion(response.questions.slice(0, quiz.selectedQuestions));
    }

    const getCurrentQuestion = async (questions: QuestionInterface[]) => {
        setSubmitted(false);
        setQuestionNumber(questionNumber + 1);

        if (questions.length > 0) {

            const currentQuestion = questions[0];
            const { answer1, answer2, answer3, answer4, answer5, answer6 } = currentQuestion;

            let answers = [answer1, answer2, answer3, answer4, answer5, answer6].filter(answer => answer !== "");

            if (answers.length > 2) {
                answers = shuffleArray(answers);
            }

            setAnswersOptions(answers);

            setCurrentQuestion(currentQuestion);
            setStartTime(Date.now());
        }
    }

    const confirmQuestion = (timeUp: boolean) => {
        if (submitted) {
            showSnackbar("Você já confirmou a resposta.");
            return;
        }

        const currentTime = Date.now();
        const timeSpent: number = Math.round((currentTime - startTime!) / 1000);
        const timeToAdd = timeUp ? Number(currentQuestion!.time) : timeSpent;

        if (timeUp) {
            showSnackbar("Tempo esgotado!");
            scoreQuestion.push(0);
        } else {
            if (selectedAnswer === "") {
                showSnackbar("Por favor, selecione uma resposta.");
                return;
            }
            const score: number = Math.round(currentQuestion!.questionValue - (((currentQuestion!.questionValue * 0.4) / Number(currentQuestion!.time)) * (timeSpent)));
            scoreQuestion.push(score);
        }

        setTotalTime((prevTotalTime) => prevTotalTime + timeToAdd);

        answers.push(selectedAnswer);
        answerTime.push(timeSpent);
        setSubmitted(true);
        quizQuestions.shift();

        if (quizQuestions.length === 0) {
            sendResponse(totalTime + timeToAdd);
        } else {
            getCurrentQuestion(quizQuestions);
            setSelectedAnswer("");
        }

    };

    const sendResponse = async (finalTime: number) => {
        const _id = localStorage.getItem("responseId") ?? undefined;
        const nickname = localStorage.getItem("nickname") || "";
        const quiz = await QuizAPI.getQuiz(accessIdentifier!);
        const response: Response = {
            _id: _id,
            nickname: nickname,
            finalTime: finalTime,
            quiz: quiz
        };

        const score = await QuizAPI.correctQuiz(questions, response._id!, answers, answerTime, scoreQuestion);
        response.finalScore = score;
        await ResponseAPI.updateResponse(response);
        localStorage.setItem("accessIdentifier", accessIdentifier!);
        localStorage.setItem("score", score.toString());

        const minutes = Math.floor(finalTime / 60);
        const seconds = finalTime % 60;
        localStorage.setItem("totalTime", `${minutes}m ${seconds}s`);

        navigate(`/ranking?ids=${accessIdentifier}`);
    }

    const handleCancelQuiz = async () => {
        const quiz = await QuizAPI.getQuiz(accessIdentifier!);
        await ResponseAPI.deleteByNickname(localStorage.getItem("nickname")!, quiz._id!);
        navigate(`/${accessIdentifier}`);
    };

    useEffect(() => {
        // Adiciona o evento antes de recarregar a página
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            localStorage.setItem("reload", "true");
            event.preventDefault();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        // Lógica para verificar o estado do localStorage e realizar as ações necessárias
        if (localStorage.getItem("reload") === "true" || localStorage.getItem("nickname") === null) {
            localStorage.removeItem("reload");
            handleCancelQuiz();
        } else {
            getQuestions();
        }

        // Cleanup: Remove o evento antes de recarregar a página
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [accessIdentifier]);

    useEffect(() => {
        const handlePopState = () => {
            if (!window.confirm('Você realmente quer sair do quiz? Todo o progresso será perdido.')) {
                window.history.pushState(null, "", window.location.pathname);
            } else {
                handleCancelQuiz();
            }
        };

        window.history.pushState(null, "", window.location.pathname);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);


    const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAnswer(event.target.value);
    };

    return (
        <>
            {currentQuestion && (
                <ThemeProvider theme={theme}>
                    <QuestionTransitionWrapper id={currentQuestion._id ?? ""}>
                        <div
                            className="question-container"
                            style={{
                                backgroundImage: `url(${DATA_URL}/${style?.backgroundImage})`,
                                backgroundColor: style?.backgroundColor,
                            }}
                        >
                            <QuestionHeader
                                backgroundColor={style?.panelsColor}
                                left={
                                    <Timer
                                        questionId={currentQuestion._id!}
                                        initialTime={currentQuestion.time}
                                        onTimeUp={() => confirmQuestion(true)}
                                    />
                                }
                                center={
                                    <Score
                                        key={currentQuestion._id}
                                        initialValue={currentQuestion.questionValue}
                                        initialTime={Number(currentQuestion.time)}
                                    />
                                }
                                right={
                                    <>
                                        <CancelButton />
                                        <FullScreenButton />
                                    </>
                                }
                            />
                            <QuestionLayout
                                questionNumber={questionNumber}
                                amountQuestions={amountQuestions}
                                question={currentQuestion}
                                answersOptions={answersOptions}
                                selectedAnswer={selectedAnswer}
                                handleAnswerChange={handleAnswerChange}
                                confirmQuestion={() => confirmQuestion(false)}
                            />
                            <CustomizedSnackbar open={open} onClose={handleClose} message={message} severity={"info"} />
                        </div>
                    </QuestionTransitionWrapper>
                </ThemeProvider>
            )}
        </>
    );
}

import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import { QuizStyle } from "../../interfaces/quiz-style.interface";
import { QuizAPI } from "../../api/quiz";

import { useNavigate } from "react-router-dom";
import "./style.css";
import { QuizAccessCard } from "../QuizAccessCard";
import { PageContainer } from "../PageContainer";

export function QuizList() {
    const navigate = useNavigate();
    const [quizList, setQuizList] = useState<QuizStyle[]>([]);

    const getQuizzes = async (): Promise<void> => {
        try {
            const response = await QuizAPI.getQuizzes();
            setQuizList(response);
        } catch (error: any) {
            console.error("Erro ao carregar quizzes:", error);
        }
    }
    const handleQuizAccess = (accessIdentifierQuiz: string) => {
        navigate(`/${accessIdentifierQuiz}`);
    };

    useEffect(() => {
        getQuizzes();
    }, []);

    return (

        <PageContainer
            title="Quizzes Disponíveis"
            subtitle="Acesse um quiz público e teste seus conhecimentos!"
        >
            <Box display="flex" flexDirection="column" gap={2}>
                {quizList.map((quiz, index) => (
                    <QuizAccessCard
                        key={index}
                        quiz={quiz}
                        onAccess={handleQuizAccess}
                    />
                ))}
            </Box>
        </PageContainer>

    )
}
import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import { QuizStyle } from "../../interfaces/quiz-style.interface";
import { QuizAPI } from "../../api/quiz";

import { ReportCard } from "../ReportsCard";
import { PageContainer } from "../PageContainer";

export function ReportsContainer() {

    const [quizList, setQuizList] = useState<QuizStyle[]>([]);

    const getQuizzes = async (): Promise<void> => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await QuizAPI.getQuizzesByUser(userId!);
            setQuizList(response);
        } catch (error: any) {
            console.error("Erro ao carregar quizzes:", error);
        }
    }

    useEffect(() => {
        getQuizzes();
    }, []);


    return (
        <PageContainer
            title="Relatórios de Quizzes"
            subtitle="Acesse os relatórios dos quizzes para analisar o desempenho dos participantes!"
        >
            <Box display="flex" flexDirection="column" gap={2}>
                {quizList.map((quiz, index) => (
                    <ReportCard
                        key={index}
                        quiz={quiz}
                    />
                ))}

            </Box>
        </PageContainer>

    );
}


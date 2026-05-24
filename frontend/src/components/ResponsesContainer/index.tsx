import { Box, Typography } from "@mui/material";
// import FilterListIcon from "@mui/icons-material/FilterList";
import QuizCard from "../QuizCard";
import { QuizResponse } from "../../interfaces/quiz.response.interface";
import { useEffect, useState } from "react";
import { ResponseAPI } from "../../api/response";
import { PageContainer } from "../PageContainer";

export function ResponsesContainer() {
    const [quizResponse, setQuizResponse] = useState<QuizResponse[]>([]);
    const getResponses = async (): Promise<void> => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await ResponseAPI.getResponsesByUser(userId!);
            console.log("Responses carregados:", response);
            setQuizResponse(response);
        } catch (error: any) {
            console.error("Erro ao carregar responses:", error);
        }
    }

    useEffect(() => {
        getResponses();
    }, []);

    return (

        <PageContainer
            title="Minhas Respostas"
            subtitle="Acompanhe seu desempenho nos quizzes"
        >
            {/* <SearchFilterBar /> */}
            {/* <Box display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={2}
                mb={3}>
                <TextField
                    fullWidth
                    placeholder="Buscar quizzes..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ backgroundColor: "white" }}
                />

                <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                >
                    Filtros
                </Button>
            </Box> */}

            <Box display="flex" flexDirection="column" gap={2}>
                {/* {quizResponse.map((qr) => (
                        <QuizCard
                            key={qr.quiz._id}
                            quizResponse={qr}
                        />
                    ))} */}
                {!quizResponse ? (
                    <Typography align="center" color="text.secondary">
                        Nenhum resultado encontrado
                    </Typography>
                ) : (
                    quizResponse.map((qr) => (
                        <QuizCard
                            key={qr.quiz._id}
                            quizResponse={qr}
                        />
                    ))
                )}
            </Box>
        </PageContainer>

    );
}

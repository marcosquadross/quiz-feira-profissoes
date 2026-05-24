import { Box, Button } from "@mui/material";
// import PageHeader from "../PageHeader";
// import ActionBar from "./ActionBar";
// import QuizList from "./QuizList";
import { QuizAPI } from "../../api/quiz";
import AddIcon from "@mui/icons-material/Add";
import { QuizItemCard } from "../QuizItemCard";
import { useEffect, useState } from "react";
import { QuizStyle } from "../../interfaces/quiz-style.interface";
import { useSnackbar } from "notistack";
import { CustomizedDialog } from "../Dialog";
import { QuizForm } from "../QuizForm";
import { PageContainer } from "../PageContainer";

export function QuizManagementContainer() {
    const [quizzes, setQuizzes] = useState<QuizStyle[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<QuizStyle | undefined>();
    const [dialogTitle, setDialogTitle] = useState("");
    const [quizId, setQuizId] = useState<string | undefined>();
    const { enqueueSnackbar } = useSnackbar();

    const getQuizzes = async (): Promise<void> => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await QuizAPI.getQuizzesByUser(userId!);
            setQuizzes(response);
        } catch (error: any) {
            console.error("Erro ao carregar quizzes:", error);
        }
    }

    const handleCreateQuiz = () => {
        setSelectedQuiz(undefined);
        setDialogTitle("Criar Quiz");
        setOpenDialog(true);
    }

    const handleEditQuiz = (quiz: QuizStyle) => {
        setSelectedQuiz(quiz);
        setDialogTitle("Editar Quiz");
        setOpenDialog(true);
    }

    const handleDeleteQuiz = (quizId: string) => {
        setQuizId(quizId);
        setOpenDeleteDialog(true);
    }

    const handleDelete = async () => {
        setOpenDeleteDialog(false);
        const quiz = await QuizAPI.deleteQuiz(quizId!);
        await getQuizzes();
        enqueueSnackbar(`Quiz ${quiz.title} deletado com sucesso.`, { variant: "success" });
    }

    const handleCloseDialog = async (message: string) => {
        setOpenDialog(false);
        setSelectedQuiz(undefined);
        await getQuizzes();
        enqueueSnackbar(message, { variant: "success" });
    };

    useEffect(() => {
        getQuizzes();
    }, []);

    return (
        <PageContainer
            title="Gerenciamento de Quiz"
            subtitle="Crie, edite e gerencie seus quizzes"
        >

            {/* ActionBar */}
            <Box
                display="flex"
                justifyContent="flex-end"
                mb={3}
            >
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        px: 3,
                    }}
                    onClick={handleCreateQuiz}
                >
                    Criar novo quiz
                </Button>
            </Box>

            {/* <QuizList quizzes={quizzes} /> */}
            <Box display="flex" flexDirection="column" gap={2}>
                {quizzes.map((quiz) => (
                    <QuizItemCard key={quiz._id} quiz={quiz}
                        onEdit={handleEditQuiz}
                        onDelete={() => handleDeleteQuiz(quiz._id!)}
                    />
                ))}
            </Box>


            <CustomizedDialog
                size={'md'}
                open={openDialog}
                onClose={() => {
                    setOpenDialog(false)
                }}
                title={dialogTitle}
                dialogContent={
                    <QuizForm quiz={selectedQuiz} onCancel={() => {
                        setOpenDialog(false);
                    }}
                        onSubmitSuccess={handleCloseDialog}
                    />
                }
                showCancelButton={false}
            />

            <CustomizedDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                title="Remover quiz"
                message="Tem certeza que deseja remover o quiz? Essa ação não poderá ser desfeita."
                onConfirm={async () => await handleDelete()}
            />
        </PageContainer>
    );
}
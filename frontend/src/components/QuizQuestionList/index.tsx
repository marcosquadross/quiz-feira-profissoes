import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    Button, Typography, Dialog, DialogTitle, DialogContent,
    DialogActions, Box, Paper, Chip
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import { QuestionSummary } from "../../interfaces/summary.interface";
import { AnswerAPI } from "../../api/answer";
import { AnswerResponse } from "../../interfaces/answer.response.interface";

type QuizQuestionListProps = {
    quizId: string;
    questions: QuestionSummary[];
};

export function QuizQuestionList({ quizId, questions }: QuizQuestionListProps) {
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionSummary | null>(null);
    const [answers, setAnswers] = useState<AnswerResponse[]>([]);

    useEffect(() => {
        if (selectedQuestion) {
            AnswerAPI.findByQuestion(quizId, selectedQuestion.questionId).then(setAnswers);
        } else {
            setAnswers([]);
        }
    }, [selectedQuestion]);

    const handleRowClick = (question: QuestionSummary) => setSelectedQuestion(question);
    const handleClose = () => setSelectedQuestion(null);

    return (
        <>
                        {/* Tabela */}
            <Paper
                sx={{
                    borderRadius: 3, border: "1px solid",
                    borderColor: "grey.200", overflow: "hidden",
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                }}
            >
                <Table>
                    <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[50] }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: 13 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: 13 }}>Questão</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary", fontSize: 13 }}>Desempenho</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary", fontSize: 13 }}>Acertos</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary", fontSize: 13 }}>Tempo Médio</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary", fontSize: 13 }}>Pontuação Média</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {questions.map((question, index) => {
                            const total = question.correctCount + question.incorrectCount;
                            const correctPercent = total > 0 ? (question.correctCount / total) * 100 : 0;
                            const incorrectPercent = total > 0 ? (question.incorrectCount / total) * 100 : 0;

                            return (
                                <TableRow
                                    key={question.questionId}
                                    hover
                                    selected={selectedQuestion?.questionId === question.questionId}
                                    onClick={() => handleRowClick(question)}
                                    sx={{
                                        cursor: "pointer",
                                        borderLeft: selectedQuestion?.questionId === question.questionId
                                            ? "3px solid"
                                            : "3px solid transparent",
                                        borderLeftColor: "primary.main",
                                        transition: "all 0.15s ease",
                                        "&:hover": { backgroundColor: (theme) => theme.palette.action.hover },
                                    }}
                                >
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Typography fontWeight={500} variant="body2">
                                            {question.questionText}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        <Box sx={{ width: "100%", maxWidth: 140, mx: "auto" }}>
                                            <Box sx={{ height: 6, borderRadius: 3, backgroundColor: "grey.200", overflow: "hidden", display: "flex", mb: 0.5 }}>
                                                <Box sx={{ width: `${correctPercent}%`, backgroundColor: "success.main", transition: "width 0.3s" }} />
                                                <Box sx={{ width: `${incorrectPercent}%`, backgroundColor: "error.main", transition: "width 0.3s" }} />
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {question.correctCount} acertos / {total} respostas
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell align="center">
                                        <Chip
                                            label={`${correctPercent.toFixed(1)}%`}
                                            size="small"
                                            sx={{
                                                fontWeight: 600, fontSize: 12,
                                                backgroundColor: "transparent",
                                                color: correctPercent >= 60 ? "success.dark" : correctPercent >= 30 ? "warning.dark" : "error.dark",
                                            }}
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                            <Typography variant="body2">{question.averageTime.toFixed(1)}s</Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell align="center">
                                        <Typography variant="body2" fontWeight={600} color="primary">
                                            {question.averageScore.toFixed(0)} pts
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>

            {/* Dialog */}
            <Dialog open={!!selectedQuestion} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>Detalhes da Questão</Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        {selectedQuestion?.questionText}
                    </Typography>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0 }}>
                    {answers.length === 0 ? (
                        <Box p={3} textAlign="center">
                            <Typography color="text.secondary">Nenhuma resposta encontrada.</Typography>
                        </Box>
                    ) : (
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[50] }}>
                                <TableRow>
                                    {["Usuário", "Resposta", "Correta", "Tempo", "Pontuação"].map((h) => (
                                        <TableCell key={h} sx={{ fontWeight: 600, color: "text.secondary", fontSize: 12 }}>
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {answers.map((answer, index) => (
                                    <TableRow
                                        key={answer._id}
                                        sx={{
                                            backgroundColor: (theme) =>
                                                index % 2 === 0 ? theme.palette.background.paper : theme.palette.grey[50],
                                        }}
                                    >
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="body2">{answer.nickname ?? "Anônimo"}</Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">{answer.selectedOption}</Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={0.5}
                                                sx={{ color: answer.isCorrect ? "success.main" : "error.main" }}
                                            >
                                                {answer.isCorrect
                                                    ? <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                                                    : <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                                                }
                                                <Typography variant="body2" fontWeight={500}>
                                                    {answer.isCorrect ? "Sim" : "Não"}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">{answer.timeSpent.toFixed(2)}s</Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} color="primary">
                                                {answer.score.toFixed(0)} pts
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleClose} variant="outlined" size="small">Fechar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
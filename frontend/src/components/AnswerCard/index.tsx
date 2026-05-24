import { Card, CardContent, Stack, Typography } from "@mui/material";
import { Answer } from "../../interfaces/answer.interface";
import "./style.css";

export function AnswerCard({ answer }: { answer: Answer }) {
    // const correctAnswerIndex = answer.question.correctAnswer;
    // const key = `answer${correctAnswerIndex}` as keyof typeof answer.question;
    // const correctAnswerText = answer.question[key] as string;
    const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} segundos`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes} min ${remainingSeconds} s`;
  }

    return (
        <Card
            className="answer-card"
            elevation={6}
        >
            <CardContent sx={{ padding: "0 !important" }}>
                {/* Pergunta */}
                {/* <Typography variant="h6" className="card-text" gutterBottom> */}
                <Typography fontWeight={500} mb={2}>
                    {answer.question.text}
                </Typography>
                 
                {/* Informações principais */}
                <Stack spacing={1}>
                    <Stack direction="row" spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                            Tempo:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {formatTime(answer.timeSpent || 0)}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Resposta:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {answer.selectedOption}
                        </Typography>
                        {/* <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ color: answer.isCorrect ? "green" : "red" }}
                    >
                        - {answer.isCorrect ? "Correta" : "Incorreta"}
                    </Typography> */}
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: "bold",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                backgroundColor: answer.isCorrect ? "#e8f5e9" : "#ffebee",
                                color: answer.isCorrect ? "#2e7d32" : "#c62828"
                            }}
                        >
                            {answer.isCorrect ? "Correta" : "Incorreta"}
                        </Typography>
                    </Stack>

                    {/* Resposta Correta */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Resposta Correta:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {answer.question.correctAnswer}
                        </Typography>
                    </Stack>

                </Stack>

                {/* Score em destaque */}
                <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                        mt: 2,
                        pt: 1,
                        borderTop: "1px solid #eee"
                    }}
                >
                    <b>Score: {answer.score}</b>
                </Typography>
            </CardContent>
        </Card>
    );

}


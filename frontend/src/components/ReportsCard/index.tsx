import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";

import { QuizStyle } from "../../interfaces/quiz-style.interface";
import { useNavigate } from "react-router-dom";

interface Props {
  quiz: QuizStyle;
}

export function ReportCard({
  quiz
}: Props) {

  const navigate = useNavigate();

  const handleOpenSummary = async (quizId: string) => {
    navigate(`/quiz-report/${quizId}`);
  }
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
        transition: "0.2s",
        "&:hover": {
          boxShadow: "0px 6px 16px rgba(0,0,0,0.08)",
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">

          {/* Info */}
          <Box>
            <Typography fontWeight={600}>
              {quiz.title}
            </Typography>

            {quiz.accessIdentifier && (
              <Typography variant="body2" color="text.secondary">
                {quiz.accessIdentifier}
              </Typography>
            )}
          </Box>

          {/* Ações */}
          <Box display="flex" gap={1}>
            <Button
              onClick={() => handleOpenSummary(quiz._id!)}
            >
              Relatório
            </Button>
          </Box>

        </Box>
      </CardContent>
    </Card>
  );
}
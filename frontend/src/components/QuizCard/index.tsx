import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
// import { Response } from "../../interfaces/response.interface";
// import { Quiz } from "../../interfaces/quiz.interface";
import ReportModal from "../ReportModal";
import { useState } from "react";
import { QuizResponse } from "../../interfaces/quiz.response.interface";

export default function QuizCard({ quizResponse }: { quizResponse: QuizResponse }) {
  const [open, setOpen] = useState(false);

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
      sx={{
        borderRadius: 3,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
        transition: "0.2s",
        p: 1.5,
        "&:hover": {
          transform: "scale(1.01)",
          boxShadow: "0px 6px 16px rgba(0,0,0,0.08)",
        },
      }}
    >
      <CardContent sx={{ padding: "12px !important" }}>

        <Box display="flex" justifyContent="space-between" alignItems="center">

          {/* ESQUERDA */}
          <Box>

            <Typography variant="h6" fontWeight={600} gutterBottom>
              {quizResponse.quiz.title}
            </Typography>

            {/* Métricas */}
            <Box display="flex" gap={2} alignItems="center" mb={1}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2">
                  {formatTime(quizResponse.response.finalTime || 0)}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={0.5}>
                <StarIcon fontSize="small" color="warning" />
                <Typography variant="body2">
                  {quizResponse.response.finalScore} pontos
                </Typography>
              </Box>
            </Box>

            {/* Data */}
            <Box display="flex" alignItems="center" gap={0.5}>
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {quizResponse.response.createdAt
                  ? new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(new Date(quizResponse.response.createdAt))
                  : ''}
              </Typography>
            </Box>

          </Box>

          {/* DIREITA (BOTÃO) */}
          <Box display="flex" alignItems="center">
            <Button variant="contained" size="medium"
              onClick={() => setOpen(true)}
            >
              Ver relatório →
            </Button>
          </Box>
        </Box>
        <ReportModal
          open={open}
          onClose={() => setOpen(false)}
          data={quizResponse.response.answers || []}
        />
      </CardContent>
    </Card>
  );
}
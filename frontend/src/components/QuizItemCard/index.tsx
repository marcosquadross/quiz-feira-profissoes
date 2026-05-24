import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { QuizStyle } from "../../interfaces/quiz-style.interface";
// import { useSocket } from "../../contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import { SessionAPI } from "../../api/session";

interface Props {
  quiz: QuizStyle;
  onEdit?: (quiz: QuizStyle) => void;
  onDelete?: (quiz: QuizStyle) => void;
}

export function QuizItemCard({
  quiz,
  onEdit,
  onDelete,
}: Props) {
  // const { socket } = useSocket();
  const navigate = useNavigate();

  // const createSession = () => {
  //   socket?.emit("createSession", { quizId: quiz._id });
  //   navigate(`/host?quizId=${quiz._id}`);
  // };

  // QuizItemCard.tsx
  const createSession = async () => {
    try {
      // 1. Chamada via API Rest (Axios/Fetch)
      const response = await SessionAPI.createSession(quiz);
      const sessionAccessId = response; 

      // 2. Navega para a tela de monitoramento do Host usando o AccessID único
      navigate(`/host/${sessionAccessId}`);
    } catch (error) {
      console.error("Erro ao criar sessão", error);
    }
  };
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
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => onEdit?.(quiz)}>
              <EditIcon />
            </IconButton>

            <IconButton color="error" onClick={() => onDelete?.(quiz)}>
              <DeleteIcon />
            </IconButton>

            <Button variant="contained" onClick={() => createSession()}>
              Criar Sessão
            </Button>
          </Stack>

        </Box>
      </CardContent>
    </Card>
  );
}
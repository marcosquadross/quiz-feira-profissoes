import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";

interface Props {
  quiz: {
    title: string;
    accessIdentifier: string;
  };
  onAccess: (accessIdentifier: string) => void;
}

export function QuizAccessCard({ quiz, onAccess }: Props) {
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
        <Box
          display="flex" justifyContent="space-between" alignItems="center">

          {/* Info */}
          <Box>
            <Typography fontWeight={600}>
              {quiz.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {quiz.accessIdentifier}
            </Typography>
          </Box>

          {/* Ação */}
          <Button
            variant="outlined"
            onClick={() => onAccess(quiz.accessIdentifier)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              minWidth: 140,
            }}
          >
            Acessar Quiz
          </Button>

        </Box>
      </CardContent>
    </Card>
  );
}
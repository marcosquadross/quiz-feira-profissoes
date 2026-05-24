import { Typography } from "@mui/material";

type ScoreDisplayProps = {
  currentMaxScore: number;
  isReady: boolean;
};

export function ScoreDisplay({ currentMaxScore, isReady }: ScoreDisplayProps) {
  if (!isReady || currentMaxScore === 0) {
    return (
      <Typography variant="h5" style={{ fontWeight: "bold", color: "#6b7280" }}>
        -- pts
      </Typography>
    );
  }

  return (
    <Typography variant="h5" style={{ fontWeight: "bold" }}>
      {currentMaxScore} pts
    </Typography>
  );
}
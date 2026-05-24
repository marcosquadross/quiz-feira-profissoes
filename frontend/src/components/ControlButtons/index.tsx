import { Button, FormControlLabel, Stack, Switch } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";

type ControlButtonsProps = {
  isPaused: boolean;
  isReleased: boolean;
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onRelease: () => void;
  autoRelease: boolean;
  onToggleAutoRelease: (value: boolean) => void;
};

export function ControlButtons({
  isPaused, isReleased, onPause, onResume, onNext, onRelease,
  autoRelease, onToggleAutoRelease
}: ControlButtonsProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <FormControlLabel
        control={
          <Switch
            checked={autoRelease}
            onChange={(e) => onToggleAutoRelease(e.target.checked)}
            color="primary"
          />
        }
        label="Auto Liberar"
      />

      {!isReleased && !autoRelease ? (
        <Button variant="contained" color="success" onClick={onRelease}>
          Liberar Agora
        </Button>
      ) : (
        <>
          <Button
            variant="contained"
            color={isPaused ? "success" : "warning"}
            startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
            onClick={isPaused ? onResume : onPause}
          >
            {isPaused ? "Retomar" : "Pausar"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SkipNextIcon />}
            onClick={onNext}
          >
            Próxima Questão
          </Button>
        </>
      )}
    </Stack>
  );
}
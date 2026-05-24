// import { Typography } from "@mui/material";

// interface TimerProps {
//   remainingTime: number;
// }

// export function NewTimer({ remainingTime }: TimerProps) {
//   const minutes = Math.floor(remainingTime / 60);
//   const seconds = remainingTime % 60;

//   return (
//     <Typography variant="h5" style={{ fontWeight: "bold" }}>
//       ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
//     </Typography>
//   );
// }

import { Typography } from "@mui/material";

interface TimerProps {
  remainingTime: number;
}

export function NewTimer({ remainingTime }: TimerProps) {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <div>
        <Typography variant="h5" style={{ fontWeight: "bold" }}>
          ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
        </Typography>
    </div>
  );
}
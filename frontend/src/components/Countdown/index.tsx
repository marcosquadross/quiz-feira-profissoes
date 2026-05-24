import { useMotionValue, animate, useMotionValueEvent, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";

const MotionPaper = motion.create(Paper);

export function Countdown({ onComplete }: { onComplete?: () => void }) {
  const count = useMotionValue(3);
  const [display, setDisplay] = useState(3); // estado separado para o número visível
  const [showGo, setShowGo] = useState(false);

  useMotionValueEvent(count, "change", (latest) => {
    const rounded = Math.ceil(latest);
    if (rounded !== display) {
      setDisplay(rounded);
    }
  });

  useEffect(() => {
    const controls = animate(count, 0, {
      duration: count.get() + 1,
      onComplete: () => {
        setShowGo(true);
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      },
    });
    return () => controls.stop();
  }, [count, onComplete]);


  useEffect(() => {
    new Audio('/sounds/tick.mp3').load();
    new Audio('/sounds/go.mp3').load();
  }, []);

  return (
    <div className="countdown-container">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MotionPaper
          elevation={3}
          layout
          initial={false}
          animate={
            showGo
              ? { scale: 1.2, opacity: 1 }
              : { scale: 1, opacity: 1 }
          }
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 300,
          }}
          sx={{
            minWidth: 'clamp(150px, 25vw, 250px)',
            aspectRatio: '1 / 1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Typography
            align="center"
            sx={{
              justifyContent: 'center',
              fontSize: 'clamp(48px, 20vw, 180px)',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            {showGo ? 'GO!' : display}
          </Typography>
        </MotionPaper>
      </Box>
    </div>
  );
}

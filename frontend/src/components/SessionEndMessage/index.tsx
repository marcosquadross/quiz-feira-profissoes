import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";

const MotionPaper = motion(Paper);

export function SessionEndMessage({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState<"end" | "result" | "done">("end");

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Troca as mensagens de forma sequencial
    timers.push(setTimeout(() => setStep("result"), 2500));
    timers.push(setTimeout(() => setStep("done"), 5000));
    timers.push(setTimeout(() => onComplete?.(), 5500));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const message = step === "end" ? "Fim de Quiz" : "Esse é o resultado";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        // background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      }}
    >
      <MotionPaper
        elevation={6}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        sx={{
          minWidth: "clamp(250px, 35vw, 500px)",
          aspectRatio: "1 / 1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 6,
          overflow: "hidden",
          p: 3,
          background:
            "radial-gradient(circle at top left, #ffffff22, #00000022), rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Typography
              align="center"
              sx={{
                fontSize: "clamp(40px, 8vw, 100px)",
                fontWeight: 800,
                color: "#fff",
                textShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              {message}
            </Typography>
          </motion.div>
        </AnimatePresence>
      </MotionPaper>
    </Box>
  );
}

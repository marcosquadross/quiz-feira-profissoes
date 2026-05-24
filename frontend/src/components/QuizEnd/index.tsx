import { useEffect } from "react";
import { motion } from "framer-motion";
import { Box, Paper, Typography, Button } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const MotionPaper = motion.create(Paper);

export function QuizEndScreen({
    score,
    totalTime,
    onRestart,
}: {
    score: number;
    totalTime: string;
    onRestart: () => void;
}) {
    useEffect(() => {
        // Dispara confete
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();

        // Som de vitória
        const victorySound = new Audio("/sounds/victory.mp3");
        victorySound.play();
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "fixed", 
                inset: 0, 
                zIndex: 1300, 
                overflow: "hidden",
                background: "transparent",
            }}
        >

            {/* Fundo gradiente animado */}
            <motion.div
                initial={{ background: "linear-gradient(135deg, #4facfe, #00f2fe)" }}
                animate={{
                    background: [
                        "linear-gradient(135deg, #4facfe, #00f2fe)",
                        "linear-gradient(135deg, #43e97b, #38f9d7)",
                        "linear-gradient(135deg, #fa709a, #fee140)",
                    ],
                }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
                style={{ position: "absolute", inset: 0, zIndex: -1 }}
            />
            <MotionPaper
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                elevation={6}
                sx={{
                    width: {
                        xs: "80vw",
                        sm: "70vw",
                        md: "45vw",
                        lg: "35vw",
                    },
                    minWidth: { xs: "unset", sm: 320 },
                    maxWidth: 500,
                    minHeight: { xs: "unset", sm: "35vh" },
                    p: { xs: 2, sm: 4 },
                    borderRadius: 4,
                    textAlign: "center",
                    background: "rgba(255,255,255,0.92)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    boxSizing: "border-box",
                }}
            >
                <Typography
                    sx={{ fontSize: "clamp(1.5rem, 3.5vw, 3.5rem)", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
                    gutterBottom
                >
                    <AccessTimeIcon sx={{ fontSize: "clamp(2rem, 4vw, 4rem)", color: "#FFD700" }} />
                    Fim do Quiz!
                </Typography>
                <Typography sx={{ fontSize: "clamp(0.8rem, 2.5vw, 2rem)" }} gutterBottom>
                    Pontuação: {score}
                </Typography>
                <Typography sx={{ fontSize: "clamp(0.7rem, 2vw, 1.5rem)" }} gutterBottom>
                    Tempo total: {totalTime}
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        mt: 2,
                        p: "clamp(0.4rem, 1.2vw, 0.9rem)",
                        fontSize: "clamp(0.7rem, 1.5vw, 1rem)",
                        borderRadius: 2,
                        minWidth: 100,
                    }}
                    onClick={onRestart}
                >
                    Finalizar Quiz
                </Button>

            </MotionPaper>
        </Box>
    );
}

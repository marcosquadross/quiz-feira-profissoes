import { Box } from "@mui/material";
import { ReactNode } from "react";

interface QuestionHeaderProps {
    left?: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
    backgroundColor?: string;
}

export function QuestionHeader({
    left,
    center,
    right,
    backgroundColor,
}: QuestionHeaderProps) {
    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                px: 2,
                py: 1,
                backgroundColor: backgroundColor || "#fff",
                border: "1px solid",
                borderColor: "grey.200",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
            }}
        >
            {/* ESQUERDA */}
            <Box display="flex" alignItems="center">
                {left}
            </Box>

            {/* CENTRO */}
            <Box display="flex" justifyContent="center" flex={1}>
                {center}
            </Box>

            {/* DIREITA */}
            <Box display="flex" gap={1}>
                {right}
            </Box>
        </Box>
    );
}
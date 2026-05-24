import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Box,
    Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AnswerCard } from "../AnswerCard";

export default function ReportModal({ open, onClose, data }: { open: boolean; onClose: () => void; data: any[] }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            {/* Header */}
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Detalhes da Resposta

                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Conteúdo */}
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={2}>
                    {data.map((answer, index) => (
                        <AnswerCard key={index} answer={answer} />
                    ))}
                </Box>
            </DialogContent>

            {/* Footer */}
            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Button variant="contained" onClick={onClose}>
                    Fechar
                </Button>
            </Box>
        </Dialog>
    );
}
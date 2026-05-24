import { ReactNode } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Box,
    Breakpoint,
} from "@mui/material";

interface CustomizedDialogProps {
    open: boolean;
    onClose: () => void;
    size?: Breakpoint;
    title?: string;
    message?: string;
    onConfirm?: () => void;
    dialogContent?: ReactNode;
    showCancelButton?: boolean;
}

export function CustomizedDialog({
    size = "sm",
    open,
    onClose,
    title,
    message,
    onConfirm,
    dialogContent,
    showCancelButton = true,
}: CustomizedDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={size}
            fullWidth
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: "1.25rem",
                }}
            >
                {title}

                {/* <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton> */}
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ pt: 1 }}>
                {message && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={2}
                    >
                        {message}
                    </Typography>
                )}

                <Box display="flex" flexDirection="column" gap={2}>
                    {dialogContent}
                </Box>
            </DialogContent>

            {/* Footer */}
            <DialogActions
                sx={{
                    px: 3,
                    pb: 2,
                    pt: 1,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                }}
            >
                {showCancelButton && (
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        color="inherit"
                        sx={{ textTransform: "none" }}
                    >
                        Cancelar
                    </Button>
                )}

                {onConfirm && (
                    <Button
                        onClick={onConfirm}
                        variant="contained"
                        sx={{
                            textTransform: "none",
                            px: 3,
                        }}
                        autoFocus
                    >
                        Confirmar
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
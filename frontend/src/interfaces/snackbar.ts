import { Breakpoint } from "@mui/material";

export interface CustomizedSnackbarProps {
    open: boolean;
    onClose: () => void;
    size?: false | Breakpoint | undefined;
    title?: string;
    message?: string;
    onConfirm?: () => void;
    dialogContent?: React.ReactNode;
    showCancelButton?: boolean;
}

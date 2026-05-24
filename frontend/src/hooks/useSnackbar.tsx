import { useState } from 'react';
import { AlertColor } from '@mui/material';

export function useSnackbar() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [severity, setSeverity] = useState<AlertColor>('success');

    const showSnackbar = (msg: string, severityType: AlertColor = 'success') => {
        setMessage(msg);
        setSeverity(severityType);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return {
        open,
        message,
        severity,
        showSnackbar,
        handleClose,
    };
}

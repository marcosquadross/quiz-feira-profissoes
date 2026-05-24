import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { AlertColor } from '@mui/material';

export interface CustomizedSnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity: AlertColor | undefined;
}

export function CustomizedSnackbar({ open, onClose, message, severity }: CustomizedSnackbarProps) {
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        icon={false}
        severity={severity}
        variant="filled"
        sx={{ width: '100%', fontSize: '1rem'}}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

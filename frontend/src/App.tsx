import { GoogleOAuthProvider } from '@react-oauth/google';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarUtilsConfigurator } from './utils/useSnackbar';
import { AppWithSocket } from './components/AppWithSocket';
import './App.css';

export default function App() {
    return (
        <GoogleOAuthProvider clientId="...">
            <SnackbarProvider
                autoHideDuration={2000}
                maxSnack={3}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                <SnackbarUtilsConfigurator />
                <AuthProvider>
                    <AppWithSocket />
                </AuthProvider>
            </SnackbarProvider>
        </GoogleOAuthProvider>
    );
}

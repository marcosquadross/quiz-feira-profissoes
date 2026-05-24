import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { Header } from "../../components/Header";
import { CreateUserForm } from "../../components/CreateUserForm";

export function SignUp() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        // Verifique se o usuário já possui um token de acesso
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            navigate("/admin");
        }

        const message = localStorage.getItem('snackbarMessage');

        if (message) {
            enqueueSnackbar(message, { variant: "error" });
            localStorage.removeItem('snackbarMessage');
        }
    }, []);

    return (
        <div className="login-container">
            <Header />
            <CreateUserForm />
        </div>
    )
}

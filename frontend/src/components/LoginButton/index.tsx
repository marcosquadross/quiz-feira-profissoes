import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { useAuth } from "../../contexts/AuthContext";
import { StyledButton } from "../Button";

import './style.css';

export function LoginButton() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { logout } = useAuth();

    const handleLogin = () => {
        window.location.href = "http://localhost:3000/auth/google/login";
    };

    const handleLogout = () => {
        logout();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
        enqueueSnackbar("Logout realizado com sucesso!", { variant: "info" });
        // window.location.reload();
        navigate("/");
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        const id = params.get("id");

        if (accessToken && refreshToken && id) {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("userId", id);
            
            window.history.replaceState({}, document.title, "/");
            enqueueSnackbar("Login efetuado com sucesso!", { variant: "success" });
            navigate("/quizzes");
        }

        if (localStorage.getItem("accessToken")) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [navigate, enqueueSnackbar]);

    return (
        <div className="button-container2">
            <StyledButton
                variant="contained"
                onClick={isLoggedIn ? handleLogout : handleLogin}
                className="form-button"
            >
                {isLoggedIn ? "Sair" : "Entrar"}
            </StyledButton>
        </div>
    );
}
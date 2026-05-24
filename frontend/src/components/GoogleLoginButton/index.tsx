import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { useAuth } from "../../contexts/AuthContext";
import { StyledButton } from "../Button";

import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import './style.css';

interface User {
    name: string;
    email: string;
    picture?: string;
}

export function GoogleButton() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { logout } = useAuth();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleLogin = () => {
        window.location.href = "http://localhost:3000/auth/google/login";
    };

    const handleLogout = () => {
        logout();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        setUser(null);
        setIsLoggedIn(false);
        handleClose();
        enqueueSnackbar("Logout realizado com sucesso!", { variant: "info" });
        navigate("/");
    };

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        const id = params.get("id");
        const name = params.get("name") || "";
        const email = params.get("email") || "";

        if (accessToken && refreshToken && id) {
            // Salva tokens e dados do usuário no localStorage
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("userId", id);
            localStorage.setItem("userName", name);
            localStorage.setItem("userEmail", email);

            setUser({ name, email });
            setIsLoggedIn(true);

            window.history.replaceState({}, document.title, "/"); // remove query params
            enqueueSnackbar("Login efetuado com sucesso!", { variant: "success" });
            navigate("/quizzes");
        }

        // 🔹 Sempre ler do localStorage
        const storedAccessToken = localStorage.getItem("accessToken");
        const storedName = localStorage.getItem("userName");
        const storedEmail = localStorage.getItem("userEmail");

        if (storedAccessToken && storedName && storedEmail) {
            setUser({ name: storedName, email: storedEmail });
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [navigate, enqueueSnackbar]);


    return (
        <div className="button-container2">
            {isLoggedIn && user ? (
                <>
                    <IconButton onClick={handleAvatarClick} size="large">
                        <Avatar alt={user.name} src={user.picture} />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        <MenuItem disabled>
                            <div className="user-info">
                                <strong>{user.name}</strong>
                                <br />
                                <small>{user.email}</small>
                            </div>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>Sair</MenuItem>
                    </Menu>
                </>
            ) : (
                <StyledButton
                    variant="contained"
                    onClick={handleLogin}
                    className="form-button"
                >
                    Entrar
                </StyledButton>
            )}
        </div>
    );
}

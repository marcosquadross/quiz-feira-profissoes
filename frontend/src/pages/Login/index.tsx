import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { LoginForm } from "../../components/LoginForm";
import "./style.css";


export function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("accessToken") !== null;
        if (isLoggedIn) {
            navigate("/admin");
        }
    }, [navigate]);

    return (
        <div className="login-container">
            <Header />
            <LoginForm />
        </div>
    )
}

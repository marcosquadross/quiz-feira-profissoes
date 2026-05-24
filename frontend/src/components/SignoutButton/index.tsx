import { useAuth } from "../../contexts/AuthContext";
import { StyledButton } from "../Button";
import { useNavigate } from "react-router-dom";

export function SignoutButton() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleSignout = () => {
        logout();
        navigate("/login");
    };

    return (
        <StyledButton onClick={handleSignout} variant="contained">
            Sair
        </StyledButton>
    );
}
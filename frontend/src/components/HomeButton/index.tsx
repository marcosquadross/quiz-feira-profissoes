import { useNavigate } from "react-router-dom";
import { Button, 
    // IconButton,
     Tooltip } from "@mui/material";
// import HomeIcon from '@mui/icons-material/Home';
import './style.css';

export function HomeButton({ accessIdentifier }: { accessIdentifier: string }) {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(`/${accessIdentifier}`);
    };

    return (
        <div className="home-button-container">
            <Tooltip title="Voltar para tela inicial" arrow>
                {/* <IconButton color="primary" onClick={handleNavigate} className="home-button">
                    <HomeIcon className="home-icon" />
                </IconButton> */}
                <Button variant="contained" onClick={handleNavigate} className="home-button">
                    Voltar para tela inicial
                </Button>
            </Tooltip>
        </div>
    );
}
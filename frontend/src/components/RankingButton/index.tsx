import { useNavigate, useParams } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import './style.css';

export function RankingButton() {
    const navigate = useNavigate();
    const { accessIdentifier } = useParams<{ accessIdentifier: string }>();

    const handleRanking = () => {
        navigate(`/ranking?ids=${accessIdentifier}`);
    };


    return (
        <div className="ranking-button-container">
            <Tooltip title="Classificação" arrow>
                <IconButton color="primary" onClick={handleRanking} className="ranking-button">
                    <EmojiEventsIcon className="ranking-icon" />
                    {/* <LeaderboardIcon className="ranking-icon" /> */}
                </IconButton>
            </Tooltip>
        </div>
    );
}
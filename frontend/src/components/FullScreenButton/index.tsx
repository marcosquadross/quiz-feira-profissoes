import { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import './style.css';

export function FullScreenButton() {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        handleFullscreenChange();

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div  className="fullscreen-button-container">
            {!isFullScreen && (
                <Tooltip title="Tela cheia" arrow>
                    <IconButton color="primary" onClick={handleFullscreen} 
                    className="fullscreen-button">
                        <FullscreenIcon className="fullscreen-icon" />
                    </IconButton>
                </Tooltip>
            )}
        </div>
    );
};

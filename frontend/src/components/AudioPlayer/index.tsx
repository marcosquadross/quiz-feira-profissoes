import { useState, useRef } from 'react';
import { IconButton } from '@mui/material';
import PlayCircle from '@mui/icons-material/PlayCircle';
import PauseCircle from '@mui/icons-material/PauseCircle';
import './style.css';

export interface AudioPlayerProps {
  audioUrl: string;
  font?: string;
}

export function AudioPlayer({ audioUrl, font }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (!isPlaying) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="audio-container">
      <IconButton onClick={handlePlayPause} className="play-pause-button">
        {isPlaying ? <PauseCircle className="icon" /> : <PlayCircle className="icon" />}
      </IconButton>

      <p style={{ fontFamily: font }}> Reproduzir áudio </p>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
      />
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';
import { Typography } from '@mui/material';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import './style.css';

export interface PropsTimer {
    questionId: number;
    initialTime: string;
    onTimeUp: () => void;
}

export function Timer({ questionId, initialTime, onTimeUp }: PropsTimer) {
    const timerRef = useRef<number | null>(null);
    const [timer, setTimer] = useState<string>('00:00');

    const getEndTime = (): number => {
        const totalSeconds = parseInt(initialTime);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const currentTime = Date.now();
        const deadline = currentTime + minutes * 60000 + seconds * 1000;
        return deadline;
    };

    const getTimeRemaining = (endTime: number): { total: number; minutes: number; seconds: number } => {
        const total = endTime - Date.now();
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const seconds = Math.floor((total / 1000) % 60);
        return { total, minutes, seconds };
    };

    const startTimer = (endTime: number) => {
        const { total, minutes, seconds } = getTimeRemaining(endTime);
        if (total >= 0) {
            setTimer(
                (minutes > 9 ? minutes : "0" + minutes) +
                ":" +
                (seconds > 9 ? seconds : "0" + seconds)
            );
        } else {
            clearInterval(timerRef.current as number);
            onTimeUp();
        }
    };

    const clearTimer = (endTime: number) => {
        const { minutes, seconds } = getTimeRemaining(endTime);
        setTimer(
            (minutes > 9 ? minutes : "0" + minutes) +
            ":" +
            (seconds > 9 ? seconds : "0" + seconds)
        );
        timerRef.current = window.setInterval(() => startTimer(endTime), 1000);
    };

    useEffect(() => {
        const endTime = getEndTime();
        clearTimer(endTime);
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [questionId]);

    return (
        <div className="timer-container">
            <WatchLaterIcon className="timer-icon" />
            <Typography variant="h5" sx={{display:"flex"}}> {timer} </Typography>
        </div>
    );
}

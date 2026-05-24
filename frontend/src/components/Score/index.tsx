import { Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import './style.css';
export interface PropsScore {
    initialValue: number;
    initialTime: number;
}

export function Score({ initialValue, initialTime }: PropsScore) {
    const [value, setValue] = useState(initialValue);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const decrementValue = (initialValue * 0.4) / initialTime;
    const minimumValue = initialValue * 0.6;

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setValue((prevValue) => {
                const newValue = prevValue - decrementValue;
                if (newValue <= minimumValue) {
                    clearInterval(intervalRef.current!);
                    return minimumValue;
                }
                return newValue;
            });
        }, 1000);

        return () => {
            clearInterval(intervalRef.current!);
        };
    }, [decrementValue, minimumValue]);

    return (
        <div className='score-container'>
            <Typography variant="h5">SCORE: {Math.round(value)}</Typography>
        </div>
    );
}
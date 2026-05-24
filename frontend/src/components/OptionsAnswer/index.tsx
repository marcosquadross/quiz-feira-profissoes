import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import "./style.css";

export interface OptionsProps {
    answersOptions: string[];
    selectedAnswer: string;
    onAnswerChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    textColor?: string;
    disabled?: boolean;
}

export function CustomOptions({
    answersOptions,
    selectedAnswer,
    onAnswerChange,
    textColor,
    disabled = false
}: OptionsProps) {
    return (
        <div className="options">
            <FormControl>
                <RadioGroup
                    name="radio-buttons-group"
                    value={selectedAnswer}
                    onChange={onAnswerChange}
                    className="options-grid"
                >
                    {answersOptions.map((answer, index) =>
                        answer && (
                            <FormControlLabel
                                key={index}
                                value={answer}
                                disabled={disabled}
                                control={
                                    <Radio
                                        className="custom-radio"
                                        sx={{
                                            "&.Mui-checked": {
                                                color: textColor || "#000",
                                            }, 
                                        }}
                                    />

                                }
                                label={answer}
                                className="option"
                            />
                        )
                    )}
                </RadioGroup>
            </FormControl>
        </div>
    );
};
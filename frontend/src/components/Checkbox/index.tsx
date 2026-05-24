import { Checkbox, FormControlLabel } from "@mui/material";
import { useState } from "react";

export interface ControlledCheckboxProps {
    checkboxText?: string;
    onChange?: (checked: boolean) => void;
}

export default function ControlledCheckbox({ 
    checkboxText,
    onChange,
}: ControlledCheckboxProps) {
    const [checked, setChecked] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
        if (onChange) {
            onChange(event.target.checked);
        }
    };

    return (
        <FormControlLabel
            control={
                <Checkbox
                    checked={checked}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'controlled' }}
                />
            }
            label={checkboxText}
        />
    );
}

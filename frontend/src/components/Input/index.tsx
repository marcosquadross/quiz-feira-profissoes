import { TextField, TextFieldProps, Box, Typography } from "@mui/material";
import { HelpPopover } from "../HelpPopOver";
import { Control, Controller } from "react-hook-form";

export interface CustomInputProps
  extends Omit<TextFieldProps, "name" | "error" | "helperText"> {
  popOverText?: string;
  name: string;
  type?: string;
  control?: Control<any>;
  helperText?: string | React.ReactNode;
  size?: "small" | "medium";
}

export function CustomInput({
  size = "small",
  control,
  name,
  type,
  popOverText,
  helperText,
  label,
  ...rest
}: CustomInputProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box display="flex" flexDirection="column" gap={0.5}>

          {/* Label + Help */}
          {label && (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight={500}>
                {label}
              </Typography>
              {popOverText && <HelpPopover popOverText={popOverText} />}
            </Box>
          )}

          <TextField
            {...field}
            {...rest}
            type={type}
            size={size}
            fullWidth
            error={!!error}
            helperText={error ? error.message : helperText}
            variant="outlined"
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,

              "& .MuiOutlinedInput-root": {
                borderRadius: 2,

                "& fieldset": {
                  borderColor: "grey.300",
                },

                "&:hover fieldset": {
                  borderColor: "grey.400",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                  borderWidth: "1px",
                },
              },

              "& .MuiInputBase-input": {
                py: 1.2,
              },
            }}
          />
        </Box>
      )}
    />
  );
}
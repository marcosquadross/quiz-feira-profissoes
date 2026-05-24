import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  SelectProps,
  Box,
  Typography,
} from "@mui/material";
import { HelpPopover } from "../HelpPopOver";
import { Control, Controller } from "react-hook-form";

export interface CustomSelectProps
  extends Omit<SelectProps, "name" | "error" | "helperText"> {
  popOverText?: string;
  name: string;
  control?: Control<any>;
  helperText?: string | React.ReactNode;
  size?: "small" | "medium";
  options: { value: string; label: string }[];
  label?: string;
}

export default function CustomSelect({
  size = "small",
  control,
  name,
  popOverText,
  helperText,
  options,
  label,
  ...rest
}: CustomSelectProps) {
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

          {/* Select */}
          <FormControl fullWidth size={size} error={!!error}>
            <Select
              {...field}
              {...rest}
              value={field.value || ""}
              displayEmpty
              sx={{
                backgroundColor: "#fff",
                borderRadius: 2,

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "grey.300",
                },

                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "grey.400",
                },

                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>

            <FormHelperText>
              {error ? error.message : helperText}
            </FormHelperText>
          </FormControl>
        </Box>
      )}
    />
  );
}
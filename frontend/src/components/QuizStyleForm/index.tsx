import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";

import { CustomInput } from "../Input";
import { FontSelector } from "../FontSelector";
import ControlledCheckbox from "../Checkbox";
import { FileUploadInput } from "../CustomUpload";

interface QuizStyleFormProps {
  font: string;
  textColor: string;
  background: string;
  panelsColor: string;
  control: Control<any>;
  errors?: FieldErrors<any>;
  hasBackgroundImage?: boolean;
  onInputChange?: (values: {
    font: string;
    textColor: string;
    background: string;
    panelsColor: string;
    imageFile: File | null;
    removeBackgroundImage?: boolean;
  }) => void;
}

export function QuizStyleForm({
  onInputChange,
  font,
  textColor,
  background,
  panelsColor,
  control,
  errors,
  hasBackgroundImage,
}: QuizStyleFormProps) {
  const [fontState, setFontState] = useState(font);
  const [textColorState, setTextColorState] = useState(textColor);
  const [backgroundState, setBackgroundState] = useState(background);
  const [panelsColorState, setPanelsColorState] = useState(panelsColor);
  const [backgroundImageFile, setBackgroundImageFile] =
    useState<File | null>(null);
  const [removeBackgroundImage, setRemoveBackgroundImage] =
    useState(false);

  const handleInputChange = (
    value: string,
    property: string
  ) => {
    switch (property) {
      case "font":
        setFontState(value);
        break;
      case "background":
        setBackgroundState(value);
        break;
      case "textColor":
        setTextColorState(value);
        break;
      case "panelsColor":
        setPanelsColorState(value);
        break;
    }
  };

  const fontStyle = { fontFamily: font || 'Roboto' };

  useEffect(() => {
    onInputChange?.({
      font: fontState,
      textColor: textColorState,
      background: backgroundState,
      panelsColor: panelsColorState,
      imageFile: backgroundImageFile,
      removeBackgroundImage,
    });
  }, [
    fontState,
    textColorState,
    backgroundState,
    panelsColorState,
    backgroundImageFile,
    removeBackgroundImage,
  ]);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5" style={fontStyle}>Escolha o estilo do quiz</Typography>
      {/* Fonte */}
      <FontSelector
        name="style.font"
        control={control}
        label="Fonte"
        popOverText="Escolha uma fonte do Google Fonts"
        onFontLoad={(font) => setFontState(font)}
      />

      {/* Cores */}
      <Box display="flex" flexDirection="column" gap={2}>

        {/* Cor texto */}
        <Box display="flex" gap={1} alignItems="center">
          <Box flex={1}>
            <CustomInput
              name="style.textColor"
              label="Cor do texto"
              control={control}
            />
          </Box>

          <input
            type="color"
            value={textColorState}
            onChange={(e) =>
              handleInputChange(e.target.value, "textColor")
            }
            style={{
              width: 40,
              height: 40,
              border: "none",
              cursor: "pointer",
              background: "transparent",
              marginTop: 24,
            }}
          />
        </Box>

        {/* Cor painéis */}
        <Box display="flex" gap={1} alignItems="center">
          <Box flex={1}>
            <CustomInput
              name="style.panelsColor"
              label="Cor dos painéis"
              control={control}
            />
          </Box>

          <input
            type="color"
            value={panelsColorState}
            onChange={(e) =>
              handleInputChange(e.target.value, "panelsColor")
            }
            style={{
              width: 40,
              height: 40,
              border: "none",
              cursor: "pointer",
              marginTop: 24,
            }}
          />
        </Box>

        {/* Cor fundo */}
        <Box display="flex" gap={1} alignItems="center">
          <Box flex={1}>
            <CustomInput
              name="style.background"
              label="Cor de fundo"
              control={control}
            />
          </Box>

          <input
            type="color"
            value={backgroundState}
            onChange={(e) =>
              handleInputChange(e.target.value, "background")
            }
            style={{
              width: 40,
              height: 40,
              border: "none",
              cursor: "pointer",
              marginTop: 24,
            }}
          />
        </Box>
      </Box>

      {/* Checkbox */}
      {hasBackgroundImage && (
        <ControlledCheckbox
          onChange={(checked) =>
            setRemoveBackgroundImage(checked)
          }
          checkboxText="Remover imagem de fundo"
        />
      )}

      {/* Upload imagem */}
      <FormControl error={!!errors?.imageFile}>

        <Controller
          name="style.imageFile"
          control={control}
          render={({ field }) => (
            <FileUploadInput
              name="style.imageFile"
              label="Imagem de fundo"
              control={control}
              accept="image/*"
              onFileChange={(file) => {
                setBackgroundImageFile(file);
                field.onChange(file);
              }}
            />
          )}
        />

        {errors?.imageFile && (
          <FormHelperText>
            {errors.imageFile.message as string}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );
}
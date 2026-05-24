import React from "react";
import {
	FormControl,
	FormHelperText,
	Box,
	Button,
	Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { HelpPopover } from "../HelpPopOver";

interface FileUploadInputProps {
	name: string;
	control: Control<any>;
	errors?: FieldErrors<any>;
	accept?: string;
	label?: string;
	popOverText?: string;
	onFileChange?: (file: File | null) => void;
	onButtonClick?: () => void;
}

export function FileUploadInput({
	name,
	control,
	errors,
	accept = ".zip",
	label,
	popOverText,
	onFileChange,
	onButtonClick,
}: FileUploadInputProps) {
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		onChange: (file: File | null) => void
	) => {
		const file = e.target.files?.[0] ?? null;
		onChange(file);
		onFileChange?.(file);
	};

	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<FormControl error={!!errors?.[name]} fullWidth>

					<Box display="flex" flexDirection="column" gap={1}>

						{/* Label + Help */}
						<Box display="flex" alignItems="center" gap={1}>
							<Typography variant="body2" fontWeight={500}>
								{label}
							</Typography>
							{popOverText && <HelpPopover popOverText={popOverText} />}
						</Box>

						{/* Linha principal */}
						<Box display="flex" gap={1} alignItems="stretch">

							{/* Input + selecionar */}
							<Box
								display="flex"
								flex={1}
								alignItems="center"
								sx={{
									border: "1px solid",
									borderColor: errors?.[name] ? "error.main" : "grey.300",
									borderRadius: 2,
									backgroundColor: "#fff",
									overflow: "hidden",
									transition: "0.2s",

									"&:hover": {
										borderColor: "grey.400",
									},
								}}
							>
								{/* Nome do arquivo */}
								<Box flex={1} px={2} py={1.2} minWidth={0}>
									<Typography
										variant="body2"
										color={field.value ? "text.primary" : "text.secondary"}
										noWrap
									>
										{field.value?.name || "Nenhum arquivo selecionado"}
									</Typography>
								</Box>

								{/* Botão selecionar */}
								<Button
									component="label"
									variant="text"
									startIcon={<UploadFileIcon />}
									sx={{
										borderLeft: "1px solid",
										borderColor: "grey.300",
										borderRadius: 0,
										height: "100%",
										px: 2,
										minWidth: 120,
									}}
								>
									Selecionar
									<input
										hidden
										type="file"
										accept={accept}
										onChange={(e) => handleChange(e, field.onChange)}
									/>
								</Button>
							</Box>

							{/* Botão processar */}
							{onButtonClick && (
								<Button
									variant="contained"
									onClick={onButtonClick}
									sx={{
										minWidth: 140,
										borderRadius: 2,
									}}
								>
									Processar
								</Button>
							)}

						</Box>

					</Box>

					{/* Erro */}
					{errors?.[name] && (
						<FormHelperText>
							{errors[name]?.message as string}
						</FormHelperText>
					)}
				</FormControl>
			)}
		/>
	);
}
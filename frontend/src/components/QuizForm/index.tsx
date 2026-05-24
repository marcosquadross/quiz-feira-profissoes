import { useState } from 'react';
import { Box, Button, Link, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { CustomInput } from '../Input';
import { FileUploadInput } from '../CustomUpload';
import { CustomizedDialog } from '../Dialog';
import { QuizStyleForm } from '../QuizStyleForm';

import { QuestionAPI } from '../../api/question';
import { QuizAPI } from '../../api/quiz';

import { Quiz } from '../../interfaces/quiz.interface';
import { UpdateQuizDto } from '../../interfaces/quiz.update.interface';
import { Style } from '../../interfaces/style.interface';
import { QuizStyle } from '../../interfaces/quiz-style.interface';

import './style.css';

interface QuizFormProps {
    quiz?: QuizStyle;
    onCancel: (quizId?: number) => void;
    onSubmitSuccess: (message: string) => void;
}


export const quizStyleSchema = z.object({
    font: z.string().min(1, "Fonte é obrigatória."),
    textColor: z.string().min(1, "Cor do texto é obrigatória."),
    panelsColor: z.string().min(1, "Cor dos painéis é obrigatória."),
    background: z.string().min(1, "Cor de fundo é obrigatória."),
    imageFile: z
        .instanceof(File, { message: "Selecione um arquivo válido." })
        .refine(
            (file) =>
                ['image/jpeg', 'image/png', 'image/webp'].includes(file?.type || ''),
            {
                message: "O arquivo deve ser .jpeg, .png ou .webp.",
            }
        )

        // .refine((file) => file?.size <= 2 * 1024 * 1024, {
        .refine((file) => file?.size <= 5 * 1024 * 1024, {
            message: "Máximo 5MB.",
        })
        .optional(),
    removeBackgroundImage: z.boolean().optional(),
});

export type QuizStyleValues = z.infer<typeof quizStyleSchema>;

function quizFormSchema(countQuestions: number) {
    return z.object({
        title: z.string().min(1, "Por favor, insira um valor."),
        accessIdentifier: z.string()
            .min(1, "Por favor, insira um valor.")
            .regex(/^[a-zA-Z0-9]+$/, "O valor deve conter apenas letras e números.")
            .regex(/^\S+$/, "O valor não pode conter espaços."),
        selectedQuestions: z.preprocess(
            (val) => typeof val === 'string' ? parseInt(val, 10) : val,
            z.coerce.number({
                message: "A quantidade de perguntas deve ser um número."
            })
                .min(1, "A quantidade de perguntas deve ser pelo menos 1.")
        ),
        questionsFile: z.instanceof(File, { message: "Por favor, selecione um arquivo válido." })
            .refine((file) => file?.type === 'application/zip', {
                message: "O arquivo deve ser do tipo .zip.",
            })
            // .refine((file) => file?.size <= 5 * 1024 * 1024, {
            //     message: "O arquivo deve ter no máximo 5MB.",
            // })
            .optional(),
        style: quizStyleSchema,
    }).refine((data) => data.selectedQuestions <= countQuestions, {
        path: ["selectedQuestions"],
        message: `A quantidade de perguntas selecionadas deve ser menor ou igual a ${countQuestions}.`,
    });
}

type FormValues = z.infer<ReturnType<typeof quizFormSchema>>;

export function QuizForm({ quiz, onCancel, onSubmitSuccess }: QuizFormProps) {
    const [countQuestions, setCountQuestions] = useState<number>(quiz?.totalQuestions || 0);
    const [countImages, setCountImages] = useState<number>(0);
    const [countAudios, setCountAudios] = useState<number>(0);
    const [openQuizCustomizationDialog, setOpenQuizCustomizationDialog] = useState<boolean>(false);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [quizToReplace, setQuizToReplace] = useState<Quiz | null>(null);
    const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);
    const [quizIdToCreate, setQuizIdToCreate] = useState<string | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const { control, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm({
        resolver: zodResolver(quizFormSchema(countQuestions)),
        defaultValues: {
            title: quiz?.title || '',
            accessIdentifier: quiz?.accessIdentifier || '',
            selectedQuestions: quiz?.selectedQuestions ?? 0,
            style: {
                font: quiz?.style?.fontFamily || 'Roboto',
                textColor: quiz?.style?.textColor || '#000000',
                panelsColor: quiz?.style?.panelsColor || '#ffffff',
                background: quiz?.style?.backgroundColor || '#e2e6ea' // '#eceff1',
            }
        }
    });

    const handleFileUpload = async () => {
        const file = watch("questionsFile");
        if (!file) {
            enqueueSnackbar("Selecione um arquivo.", { variant: "error" });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await QuestionAPI.createQuestions(formData);
        if (!response.questions) {
            enqueueSnackbar(response.message, { variant: "error" });
        } else {
            enqueueSnackbar(response.message, { variant: "success" });
            setCountQuestions(response.questions);
            setCountImages(response.images);
            setCountAudios(response.audios);
            setQuizIdToCreate(response.quizId);
        }
    };

    const handleCheckQuizaccessIdentifier = async (accessIdentifier: string) => {
        if (accessIdentifier === quiz?.accessIdentifier) return true;
        const quizUpdate = await QuizAPI.getQuiz(accessIdentifier);
        if (quizUpdate) {
            setQuizToReplace(quizUpdate);
            setOpenDialog(true);
            return false;
        }
        return true;
    }

    const handleCreateQuiz = async (data: FormValues) => {
        const style: Style = {
            fontFamily: data.style.font,
            textColor: data.style.textColor,
            panelsColor: data.style.panelsColor,
            backgroundColor: data.style.background,
            backgroundImage: data.style.imageFile ? data.style.imageFile.name : undefined,
        };

        const quiz: Quiz = {
            _id: quizIdToCreate ?? undefined,
            title: data.title,
            accessIdentifier: data.accessIdentifier,
            totalQuestions: countQuestions,
            selectedQuestions: data.selectedQuestions
        };

        let newQuiz: Quiz;
        if (data.style.imageFile) {
            newQuiz = await QuizAPI.createQuiz(quiz, style, data.style.imageFile);
        } else {
            newQuiz = await QuizAPI.createQuiz(quiz, style);
        }

        if (!newQuiz._id) {
            enqueueSnackbar("Erro ao criar o quiz.", { variant: "error" });
            return;
        }
        onSubmitSuccess(`Quiz ${newQuiz.title} criado com sucesso.`);
    }

    const handleSaveQuiz = async (data: FormValues) => {
        const quizUpdate: UpdateQuizDto = {
            _id: quiz!._id!,
            title: data.title,
            accessIdentifier: data.accessIdentifier,
            selectedQuestions: data.selectedQuestions
        };

        const style: Style = {
            fontFamily: data.style.font,
            textColor: data.style.textColor,
            panelsColor: data.style.panelsColor,
            backgroundColor: data.style.background,
            backgroundImage: data.style.imageFile ? data.style.imageFile.name : undefined,
        };

        await QuizAPI.updateQuiz(quizUpdate, style, data.style.imageFile!, data.style.removeBackgroundImage);
        onSubmitSuccess(`Quiz ${quizUpdate.title} atualizado com sucesso.`);
    }

    const handleReplaceQuiz = async () => {
        if (!quizToReplace || !pendingFormData) return;

        await QuizAPI.deleteQuiz(quizToReplace._id!);
        setOpenDialog(false);

        quiz ? handleSaveQuiz(pendingFormData) : handleCreateQuiz(pendingFormData);
        setPendingFormData(null);  // Limpa o estado
    }

    const onSubmit = async (data: FormValues) => {
        const isValid = await handleCheckQuizaccessIdentifier(data.accessIdentifier);
        if (!isValid) {
            setPendingFormData(data);  // Armazena os dados para depois
            return;
        }
        quiz ? handleSaveQuiz(data) : handleCreateQuiz(data);
    }

    return (
        <div>
            {/* <div className="form"> */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                {/* <div className="form-header"> */}
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Acesse o{" "}
                    <Link href="https://docs.google.com/spreadsheets/d/1d7LPODBJZ43Rv6te8Uo05mG0Mmc7IUC9/edit?usp=sharing&ouid=105087991723756419173&rtpof=true&sd=true" underline="hover">
                        link
                    </Link>{" "}
                    para o modelo de criação de quiz.
                </Typography>

                {/* </div> */}


                <Box display="flex" flexDirection="column" gap={2}>
                    {!quiz && (
                        <Box>
                            <FileUploadInput
                                name="questionsFile"
                                control={control}
                                errors={errors}
                                accept=".zip"
                                popOverText={`O arquivo zip deve conter: um arquivo .xlsx com as questões, uma pasta "imagens" e/ou "audios" se aplicável.`}
                                onButtonClick={handleFileUpload}
                            />

                            <Typography variant="body2" color="text.secondary" mt={1}>
                                - Perguntas: {countQuestions} <br />
                                - Imagens: {countImages} <br />
                                - Áudios: {countAudios}
                            </Typography>
                        </Box>
                    )}
                    <CustomInput
                        id="title" name='title' label="Título"
                        type="text" control={control}
                    />
                    <CustomInput
                        id="accessIdentifier" name='accessIdentifier'
                        label="Identificador"
                        popOverText="Identificador único (letras e números). Usado para acessar o quiz. Ex: meuquiz123"
                        type="text" control={control}
                    />
                    <CustomInput
                        id="selectedQuestions" name='selectedQuestions'
                        label={`Perguntas (máx: ${countQuestions})`}
                        type="number"
                        control={control}
                    />
                    {/* <div className="button-container2">
                        <StyledButton variant="contained" onClick={() => setOpenQuizCustomizationDialog(!openQuizCustomizationDialog)} className='form-button'> Personalizar </StyledButton>
                        <StyledButton variant="contained" color="error" onClick={() => { onCancel(); }} className='form-button'> Cancelar </StyledButton>
                        <StyledButton type="submit" variant="contained" color="success" className='form-button'> Enviar </StyledButton>
                    </div> */}
                    <Box
                        display="flex"
                        justifyContent="flex-end"
                        gap={1}
                        mt={3}
                    >
                        <Button
                            variant="outlined"
                            color="inherit"
                            sx={{ minWidth: 120 }}
                            onClick={() => onCancel()}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="outlined"
                            sx={{ minWidth: 120 }}
                            onClick={() => setOpenQuizCustomizationDialog(true)}
                        >
                            Personalizar
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ minWidth: 120 }}
                        >
                            Salvar
                        </Button>
                    </Box>
                </Box>
                <CustomizedDialog
                    open={openQuizCustomizationDialog}
                    onClose={() => setOpenQuizCustomizationDialog(false)}
                    title="Personalização do Quiz"
                    onConfirm={async () => {
                        const isValid = await trigger([
                            "style.font",
                            "style.textColor",
                            "style.panelsColor",
                            "style.background",
                            "style.imageFile",
                            "style.removeBackgroundImage"
                        ]);
                        if (isValid) {
                            setOpenQuizCustomizationDialog(false);
                        }
                    }}
                    dialogContent={
                        <QuizStyleForm
                            control={control}
                            font={watch("style.font")}
                            background={watch("style.background")}
                            textColor={watch("style.textColor")}
                            panelsColor={watch("style.panelsColor")}
                            hasBackgroundImage={!!quiz?.style?.backgroundImage}
                            onInputChange={(values) => {
                                setValue("style.font", values.font);
                                setValue("style.background", values.background);
                                setValue("style.textColor", values.textColor);
                                setValue("style.panelsColor", values.panelsColor);
                                if (values.removeBackgroundImage !== undefined) {
                                    setValue("style.removeBackgroundImage", values.removeBackgroundImage);
                                }
                                if (values.imageFile) {
                                    setValue("style.imageFile", values.imageFile);
                                }
                            }}
                        />
                    }
                />
                <CustomizedDialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    title="Substituir quiz"
                    message="Quiz com identificador já existente. Deseja substituir?"
                    onConfirm={handleReplaceQuiz}
                />
            </Box>
        </div >
    );
};

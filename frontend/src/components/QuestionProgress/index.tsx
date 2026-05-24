import { Box, IconButton, Paper, Typography, CircularProgress } from "@mui/material";
import './style.css'
import { QuestionInterface } from "../../interfaces/question.interface";
import { AudioPlayer } from "../AudioPlayer";
import { CustomOptions } from "../OptionsAnswer";
import EastIcon from "@mui/icons-material/East";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type Props = {
    questionNumber?: number;
    amountQuestions?: number | undefined;
    question?: QuestionInterface | undefined;
    answersOptions: string[];
    selectedAnswer: string;
    isHost?: boolean;
    isAnswerSent?: boolean;      
    isLoadingAnswer?: boolean;   
    handleAnswerChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    confirmQuestion: () => void;
};

export function QuestionLayout({
    questionNumber,
    amountQuestions,
    question,
    answersOptions,
    selectedAnswer,
    handleAnswerChange,
    confirmQuestion,
    isHost = false,
    isAnswerSent = false,     
    isLoadingAnswer = false,  
}: Props) {
    const DATA_URL = import.meta.env.VITE_DATA_URL;

    if (!question) return null;

    const getButtonContent = () => {
        if (isLoadingAnswer) {
            return <CircularProgress size={24} color="inherit" />; 
        }
        if (isAnswerSent) {
            return <CheckCircleIcon />; 
        }
        return <EastIcon />; 
    };

    const getButtonColor = () => {
        if (isAnswerSent) return "success.main"; 
        return "primary.main"; 
    };

    return (
        <Paper className={`question-content ${isAnswerSent ? 'answer-sent' : ''}`} elevation={2}>
            <Box flexShrink={0} textAlign="center">
                <Typography variant="subtitle1" color="text.secondary">
                    Questão {questionNumber} de {amountQuestions}
                </Typography>
            </Box>
            
            {(question.image || question.audio) && (
                <div className="media-container">
                    {question.image && (
                        <img
                            className="question-image"
                            src={`${DATA_URL}/${question.image}`}
                            alt={`${DATA_URL}/${question.image}`}
                        />
                    )}
                    {question.audio && (
                        <AudioPlayer audioUrl={`${DATA_URL}/${question.audio}`} font={undefined} />
                    )}
                </div>
            )}
            
            <div className="question-description">
                <Typography variant="h6">{question.text}</Typography>
            </div>
            
            <Box flexShrink={0} display="flex" flexDirection="column">
                <CustomOptions
                    answersOptions={answersOptions}
                    selectedAnswer={selectedAnswer}
                    onAnswerChange={handleAnswerChange}
                />

                {!isHost && (
                    <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
                        {isAnswerSent && (
                            <Typography variant="body2" color="success.main" fontWeight="500">
                                Resposta enviada!
                            </Typography>
                        )}
                        <IconButton
                            onClick={confirmQuestion}
                            disabled={isAnswerSent || isLoadingAnswer || !selectedAnswer}
                            sx={{
                                backgroundColor: getButtonColor(),
                                color: "#fff",
                                "&:hover": {
                                    backgroundColor: isAnswerSent ? "success.dark" : "primary.dark",
                                },
                                "&.Mui-disabled": {
                                    backgroundColor: isAnswerSent ? "success.light" : "action.disabledBackground",
                                    color: isAnswerSent ? "success.contrastText" : "action.disabled",
                                },
                                width: 48,
                                height: 48,
                                transition: "all 0.3s ease", 
                            }}
                        >
                            {getButtonContent()}
                        </IconButton>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}

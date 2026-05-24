import { useNavigate, useParams } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import { CustomizedDialog }from "../Dialog";
import { useState } from "react";
import { ResponseAPI } from "../../api/response";
import { QuizAPI } from "../../api/quiz";
import { Close } from "@mui/icons-material";
import './style.css';

export function CancelButton() {
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false);
    const { accessIdentifier } = useParams<{ accessIdentifier: string }>();

    const handleCancelQuiz = async () => {
        const quiz = await QuizAPI.getQuiz(accessIdentifier!);
        await ResponseAPI.deleteByNickname(localStorage.getItem("nickname")!, quiz._id!);
        navigate(`/${accessIdentifier}`);
    };

    return (
        <div className="cancel-button-container">
            <Tooltip title="Cancelar tentativa do quiz" arrow>
                <IconButton color="primary" onClick={() => setOpenDialog(true)} className="cancel-button">
                    <Close className="close-icon" />
                </IconButton>
            </Tooltip>
            <CustomizedDialog open={openDialog}
                onClose={() => setOpenDialog(false)}
                title="Cancelar tentativa do quiz?"
                message="Ao cancelar o quiz você perderá todo o progresso feito até o momento. Deseja realmente cancelar?"
                onConfirm={handleCancelQuiz}
            />
        </div>
    );
}
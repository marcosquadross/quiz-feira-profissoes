import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Tab, Tabs } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LiveTvIcon from "@mui/icons-material/LiveTv";

import { AnswerAPI } from "../../api/answer";
import { SessionAPI } from "../../api/session";
import { QuizQuestionList } from "../../components/QuizQuestionList";
import { SessionReportList } from "../../components/SessionReportList";
import { PageContainer } from "../PageContainer";
import "../../index.css";

export function QuizReportContainer() {
    const { quizId } = useParams<{ quizId: string }>();
    const [tab, setTab] = useState(0);
    const [summary, setSummary] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        if (!quizId) return;

        if (tab === 0) {
            AnswerAPI.summaryByQuiz(quizId).then(setSummary);
        } else {
            SessionAPI.getByQuiz(quizId).then(setSessions);
        }
    }, [quizId, tab]);

    console.log("Summary:", summary);
    console.log("Sessions:", sessions);

    return (
        <PageContainer
            title="Relatório do Quiz"
            subtitle="Análise de respostas individuais e sessões ao vivo"
        >
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab icon={<AssessmentIcon />} iconPosition="start" label="Respostas Individuais" />
                    <Tab icon={<LiveTvIcon />} iconPosition="start" label="Sessões ao Vivo" />
                </Tabs>
            </Box>

            {quizId && tab === 0 && <QuizQuestionList questions={summary} quizId={quizId} />}
            {quizId && tab === 1 && <SessionReportList sessions={sessions} />}
        </PageContainer>
    );
}
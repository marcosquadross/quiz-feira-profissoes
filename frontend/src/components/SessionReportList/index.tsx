import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

type PlayerResponse = {
    nickname: string;
    finalScore: number;
    finalTime: number;
    answers: {
        selectedOption: string;
        isCorrect: boolean;
        timeSpent: number;
        score: number;
    }[];
};

type SessionReport = {
    _id: string;
    sessionAccessId: string;
    createdAt: string;  
    endAt: string;
    responses: PlayerResponse[];
};

type Props = {
    sessions: SessionReport[];
};

export function SessionReportList({ sessions }: Props) {
    if (!sessions.length) {
        return (
            <Typography color="text.secondary" textAlign="center" mt={4}>
                Nenhuma sessão ao vivo finalizada encontrada.
            </Typography>
        );
    }

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            {sessions.map((session, index) => {
                const sorted = [...session.responses].sort((a, b) => b.finalScore - a.finalScore);
                const date = new Date(session.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                return (
                    <Accordion key={session._id} disableGutters elevation={0}
                        sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2, "&:before": { display: "none" } }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box display="flex" alignItems="center" gap={2} width="100%">
                                <Typography fontWeight={600}>Sessão {index + 1}</Typography>
                                <Typography variant="body2" color="text.secondary">{date}</Typography>
                                <Chip
                                    icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                                    label={`${session.responses.length} jogadores`}
                                    size="small"
                                    sx={{ ml: "auto", mr: 1 }}
                                />
                            </Box>
                        </AccordionSummary>

                        <AccordionDetails>
                            <Box display="flex" flexDirection="column" gap={1}>
                                {sorted.map((player, i) => (
                                    <Box key={i} display="flex" alignItems="center" gap={2}
                                        sx={{ p: 1.5, borderRadius: 2, backgroundColor: i === 0 ? "warning.50" : "grey.50" }}
                                    >
                                        <Typography fontWeight={600} color="text.secondary" width={24}>
                                            {i + 1}º
                                        </Typography>

                                        {i === 0 && <EmojiEventsIcon sx={{ color: "warning.main", fontSize: 20 }} />}

                                        <Typography flex={1}>{player.nickname}</Typography>

                                        <Typography fontWeight={600} color="primary">
                                            {player.finalScore} pts
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            {player.finalTime.toFixed(1)}s
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
}
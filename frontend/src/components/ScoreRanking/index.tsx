import { TableCell, Typography, Paper, Table, TableBody, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import { PartialResultsSession } from '../../interfaces/partial.result.session.interface';
import { Session } from '../../interfaces/session.interface';

import './style.css';
import { useMemo } from 'react';

export interface RankingProps {
    responses: any[] | Session | PartialResultsSession[];
}

const TROPHY = ["🥇", "🥈", "🥉"];

export function ScoreRanking({ responses }: RankingProps) {
    const myResponseId = localStorage.getItem("responseId"); // ← identifica por ID, não por nickname

    const sortedData = useMemo(() => {
        if (!responses) return [];
        const list = Array.isArray(responses)
            ? (responses[0]?.responses ?? responses)
            : [];
        return [...list].sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
    }, [responses]);

    const title = Array.isArray(responses) && responses[0]?.title
        ? responses[0].title
        : "Ranking";

    if (sortedData.length === 0) {
        return (
            <Box className="score-ranking-wrapper">
                <Typography variant="h6" align="center" sx={{ my: 4 }}>
                    Nenhuma resposta registrada.
                </Typography>
            </Box>
        );
    }

    return (
        <Box className="score-ranking-wrapper">
            <Box className="table-container">
                <Typography variant="h4" className="quiz-title">
                    {title}
                </Typography>

                <TableContainer component={Paper} elevation={0} className="table-paper">
                    <Table className="custom-table">
                        <TableHead>
                            <TableRow>
                                <TableCell width={64} align="center" className="table-cell-header">Pos.</TableCell>
                                <TableCell className="table-cell-header">Jogador</TableCell>
                                <TableCell align="right" className="table-cell-header">Pontuação</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedData.map((row, index) => {
                                const isMe = row._id === myResponseId; // ← comparação por ID único
                                return (
                                    <TableRow
                                        key={row._id ?? `${row.nickname}-${index}`}
                                        className={isMe ? "row-me" : ""}
                                        sx={{ '&:last-child td': { border: 0 } }}
                                    >
                                        {/* Posição */}
                                        <TableCell align="center">
                                            {index < 3 ? (
                                                <span className="trophy-icon">{TROPHY[index]}</span>
                                            ) : (
                                                <Typography className="pos-number">{index + 1}°</Typography>
                                            )}
                                        </TableCell>

                                        {/* Jogador */}
                                        <TableCell>
                                            <Box className="player-cell">
                                                <Typography
                                                    variant="body2"
                                                    className={`player-name ${isMe ? "player-name--me" : ""}`}
                                                >
                                                    {row.nickname}
                                                </Typography>
                                                {isMe && (
                                                    <Box component="span" className="you-badge">
                                                        Você
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>

                                        {/* Pontuação */}
                                        <TableCell align="right">
                                            <Typography
                                                variant="body2"
                                                className={`score-text ${isMe ? "score-text--me" : ""}`}
                                            >
                                                {row.finalScore ?? 0} pts
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}
import { Quiz } from "../interfaces/quiz.interface";
import api from "./axiousInstance";

const createSession = async (quiz: Quiz): Promise<string> => {
    try {
        const response = await api.post(
            '/session/create',
            { quizId: quiz._id }
        );
        const { sessionAccessId } = response.data;

        if (!sessionAccessId) {
            throw new Error("Resposta do servidor não contém sessionAccessId.");
        }

        return sessionAccessId;
    } catch (error) {
        console.error("ERROR:", error);
        throw new Error("Falha na criação de quiz.");
    }
};

const getByQuiz = async (quizId: string) => {
    try {
        const response = await api.get(`/session/quiz/${quizId}`);
        return response.data;
    } catch (error) {
        console.error("ERROR:", error);
        throw new Error("Falha ao buscar sessões do quiz.");
    }
};

export const SessionAPI = {
    createSession,
    getByQuiz
};

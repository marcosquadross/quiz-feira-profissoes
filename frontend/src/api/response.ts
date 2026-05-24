import api from "./axiousInstance";
import { Response } from "../interfaces/response.interface"
import { QuizResponse } from "../interfaces/quiz.response.interface";

const create = async (nickname: string, id: string, userId?: string, sessionId?: string): Promise<Response> => {
    try {
        const response = await api.post(`/quizzes/responses`, {
            nickname,
            quiz: { _id: id },
            user: { _id: userId },
            session: sessionId ? { _id: sessionId } : undefined, // modo síncrono
        },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.data) {
            throw new Error("Resposta vazia do servidor.");
        }

        return response.data;

    } catch (error) {
        console.error("ERROR:", error);
        throw new Error("Falha na criação de questões.");
    }
};

const getResponsesByIdQuiz = async (ids: number[]): Promise<Response[][]> => {
    try {
        const response = await api.get(
            `/responses/listByIds/`,
            {
                params: {
                    ids: ids,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;

    } catch (error) {
        console.error("ERROR:", error);
        throw new Error(`FERROR: ${error}`);
    }
}

const getResponsesByUser = async (userId: string): Promise<QuizResponse[]> => {
    try {
        const response = await api.get(
            `/quizzes/responses/listByUser/${userId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;

    } catch (error) {
        console.error("ERROR:", error);
        throw new Error(`FERROR: ${error}`);
    }
}

const updateResponse = async (response: Response) => {
    try {
        await api.put(`/quizzes/responses`, {
            _id: response._id,
            finalScore: response.finalScore,
            finalTime: response.finalTime,
        },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

    } catch (error) {
        console.error("ERROR:", error);
        throw new Error(`FERROR: ${error}`);
    }
}

const deleteByNickname = async (nickname: string, quizId: string) => {
    try {
        await api.delete(
            `/quizzes/${quizId}/responses`,
            {
                params: { nickname },
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error("Erro durante a conexão de perguntas:", error);

    }
}

export const ResponseAPI = {
    create,
    getResponsesByUser,
    getResponsesByIdQuiz,
    updateResponse,
    deleteByNickname,
};

import { Quiz } from "../interfaces/quiz.interface";
import { UpdateQuizDto } from "../interfaces/quiz.update.interface";
import api from "./axiousInstance";
import { Style } from "../interfaces/style.interface";
import { QuizStyle } from "../interfaces/quiz-style.interface";
import { QuestionInterface } from "../interfaces/question.interface";

const createQuiz = async (quiz: Quiz, style: Style, image?: File) : Promise<Quiz> => {
    try {
        console.log("Creating quiz with data:", quiz, style, image);
        const url = `/quizzes`;

        const formData = new FormData();
        formData.append('quiz', JSON.stringify(quiz));
        formData.append('style', JSON.stringify(style));

        if (image) {
            formData.append('file', image);
        }
        const response = await api.post(url, formData, {  
            headers: {
                'Content-Type': 'multipart/form-data', 
            },
        });

        if (!response.data) {
            throw new Error("Resposta vazia do servidor.");
        }

        return response.data;

    } catch (error) {
        console.error("ERROR:", error);
        throw new Error("Falha na criação de quiz.");
    }
};

const getQuiz = async (accessIdentifier: string): Promise<QuizStyle> => {
    try {
        const url = `/quizzes/${accessIdentifier}`;
        const response = await api.get(
            url,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;

    } catch (error) {
        console.error("ERROR:", error);
        throw new Error(`ERROR: ${error}`);
    }
}

const getQuizzes = async (): Promise<QuizStyle[]> => {
    try {
        const url = `/quizzes`;

        const response = await api.get(
            url,
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
        throw new Error(`ERROR: ${error}`);
    }
}

const getIds = async (accessIdentifiers: string) => {
    try {
        const url = `/quizzes/getIds/${accessIdentifiers}`;
        const response = await api.get(
            url,
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
        throw new Error(`ERROR: ${error}`);
    }
}

const updateQuiz = async (quiz: UpdateQuizDto, style: Style, image?: File, removeImage?: boolean) => {
    try {
        console.log("Updating quiz with data:", quiz, style, image, removeImage);
        const url = `/quizzes`;

        const formData = new FormData();
        formData.append('quiz', JSON.stringify(quiz));

        const styleWithRemoveImage = { ...style, removeBackgroundImage: !!removeImage };
        formData.append('style', JSON.stringify(styleWithRemoveImage));

        if (image) {
            formData.append('file', image);
        }

        const response = await api.put(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.data) {
            throw new Error("Resposta vazia do servidor.");
        }

        return response.data;

    } catch (error) {
        console.error("Erro ao atualizar quiz:", error);
    }
}

const deleteQuiz = async (quizId: string): Promise<Quiz> => {
    try {
        const url = `/quizzes/${quizId}`;
        const response = await api.delete(
            url,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
        
    } catch (error) {
        console.error("Erro ao deletar quiz:", error);
        throw new Error("Erro ao deletar quiz.");
    }
}

const correctQuiz = async (
    questions: QuestionInterface[],
    responseId: string,       
    answers: string[],
    times: number[],
    scores: number[]
): Promise<number> => {
    try {
        const url = `/quizzes/correct-quiz/${responseId}`;
        const apiResponse = await api.post(url, {
            questions,
            answers,
            times,
            scores,
        });
        return apiResponse.data;
    } catch (error) {
        console.error("Erro ao corrigir quiz:", error);
        throw new Error("Erro ao corrigir quiz.");
    }
}

const getQuizzesByUser = async (userId: string): Promise<QuizStyle[]> => {
    try {
        const url = `quizzes/user/${userId}`;
        const response = await api.get(
            url,
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
        throw new Error(`ERROR: ${error}`);
    }
}

export const QuizAPI = {
    createQuiz,
    correctQuiz,
    getQuiz,
    getQuizzes,
    getIds,
    updateQuiz,
    deleteQuiz,
    getQuizzesByUser,
};

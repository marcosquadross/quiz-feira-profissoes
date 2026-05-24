import api from "./axiousInstance";

const createQuestions = async (questions: FormData) => {
    try {
        const response = await api.post(
            `/quizzes/questions`,
            questions,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (!response.data) {
            throw new Error("Resposta vazia do servidor.");
        }

        return response.data;

    } catch (error) {
        console.error("Erro durante a criação de perguntas:", error);
        throw new Error("Falha na criação de questões.");
    }
};

const getQuestionsByQuiz = async (accessIdentifier: string): Promise<any> => {
    try {
        const response = await api.get(
            `/quizzes/${accessIdentifier}/questions`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log(response.data);

        if (!response.data) {
            throw new Error("Resposta vazia do servidor.");
        }

        return response.data;
    } catch (error) {
        console.error("Erro durante a busca de perguntas:", error);
    }
};

export const QuestionAPI = {
    createQuestions,
    getQuestionsByQuiz
};

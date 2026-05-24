import api from "./axiousInstance";

const findByQuestion = async (quizId: string, questionId: string) => {
  try {
    const url = `/quizzes/answers/listByQuestion/${questionId}`;
    const response = await api.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
      params: { quizId }, // envia quizId como query param
    });
    return response.data;
  } catch (error) {
    console.error("ERROR:", error);
    throw new Error(`ERROR: ${error}`);
  }
};


const summaryByQuiz = async (quizId: string) => {   
    try {
        const url = `/quizzes/${quizId}/summary`;
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

export const AnswerAPI = {
    findByQuestion,
    summaryByQuiz,
};
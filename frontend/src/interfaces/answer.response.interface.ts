export interface AnswerResponse {
    _id: string;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number;
    score: number;
    question: string;
    nickname: string;
}
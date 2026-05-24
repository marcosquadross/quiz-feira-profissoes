export interface QuestionSummary {
    questionId: string;
    questionText: string;
    totalAnswers: number;
    correctCount: number;
    incorrectCount: number;
    averageTime: number;
    averageScore: number;
};
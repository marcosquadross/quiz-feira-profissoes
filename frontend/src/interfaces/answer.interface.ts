import { QuestionInterface } from "./question.interface";
import { Response } from "./response.interface";
export interface Answer {
    id: number;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number;
    score: number;
    question: QuestionInterface;
    response: Response;
};
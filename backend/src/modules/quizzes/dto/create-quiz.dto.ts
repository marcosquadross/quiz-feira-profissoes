import { Question } from "../schemas/question.schema";

export class CreateQuizDto {
    accessIdentifier: string;
    title: string;
    selectedQuestions: number;
    totalQuestions: number;
    questions: Question[];
    styleId: number;
}

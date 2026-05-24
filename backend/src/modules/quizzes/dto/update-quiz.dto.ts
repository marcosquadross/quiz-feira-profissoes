
export class UpdateQuizDto {
    _id: number;
    accessIdentifier: string;
    title: string;
    selectedQuestions: number;
    questions: [];
}

export interface UpdateQuizDto {
    _id: string;
    accessIdentifier: string;
    title: string;
    selectedQuestions?: number;
    fontFamily?: string;
    textColor?: string;
    panelsColor?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    questions?: [];
};
import { Style } from "./style.interface";

export interface Quiz {
    _id?: string;
    title: string;
    accessIdentifier: string;
    selectedQuestions: number;
    totalQuestions: number;
    style?: Style
};
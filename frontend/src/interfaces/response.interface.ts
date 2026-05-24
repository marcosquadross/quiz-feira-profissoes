import { Answer } from "./answer.interface";
import { Quiz } from "./quiz.interface";

export interface Response {
    _id?: string;
    nickname: string;
    finalScore?: number;
    finalTime?: number;
    quiz: Quiz;
    answers?: Answer[];
    user?: {
        id?: string;
    }
    createdAt?: Date;
};

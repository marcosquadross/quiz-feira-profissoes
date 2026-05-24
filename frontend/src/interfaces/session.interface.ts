import { Quiz } from "./quiz.interface";
import { Response } from "./response.interface";

export interface Session {
    _id: string;
    sessionAccessId: string;
    quiz: Quiz;
    startedAt: string;
    endAt: string | null;
    responses: Response[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}
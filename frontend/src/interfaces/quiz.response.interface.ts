import { Response } from "../interfaces/response.interface";
import { Quiz } from "./quiz.interface";

export interface QuizResponse {
    quiz: Quiz
    response: Response;
};
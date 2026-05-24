import { Quiz } from "./quiz.interface";

export interface QuestionInterface {
    _id?: number;
    text: string;
    image: string;
    audio: string;
    answer1: string;
    answer2: string;
    answer3: string;
    answer4: string;
    answer5: string;
    answer6: string;
    time: string; 
    correctAnswer: number;
    questionValue: number;
    quiz: Quiz;
};
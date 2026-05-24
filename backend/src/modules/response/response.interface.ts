import { Types } from 'mongoose';

export interface QuizRef {
  _id: string;
  title: string;
  accessIdentifier: string;
}

export interface AnswerWithQuestion {
  _id?: Types.ObjectId;
  selectedOption: string;
  isCorrect: boolean;
  timeSpent: number;
  score: number;
  question: { _id: Types.ObjectId; text: string; correctAnswer: string } | null;
}

export interface ResponseWithQuiz {
  quiz: QuizRef;
  response: {
    _id: Types.ObjectId;
    nickname: string;
    finalScore?: number;
    finalTime?: number;
    answers: AnswerWithQuestion[];
    createdAt: Date;
  };
}

export interface QuestionSummary {
  questionId: string;
  questionText: string;
  totalAnswers: number;
  correctCount: number;
  incorrectCount: number;
  averageTime: number;
  averageScore: number;
}
import { Quiz } from './../schemas/quiz.schema';

export class CreateQuestionDto {
  text: string;
  image?: string;
  audio?: string;
  answer1: string;
  answer2: string;
  answer3?: string;
  answer4?: string;
  answer5?: string;
  answer6?: string;
  correctAnswer: string;
  questionValue: number;
  time: number;
  quiz: Quiz;

  constructor(data: any[]) {
    this.text = data[0];
    this.image = data[1] || '';
    this.audio = data[2] || '';
    this.answer1 = data[3];
    this.answer2 = data[4];
    this.answer3 = data[5] || '';
    this.answer4 = data[6] || '';
    this.answer5 = data[7] || '';
    this.answer6 = data[8] || '';
    this.correctAnswer = data[9];
    this.questionValue = data[10];
    this.time = data[11];
    // this.quiz = new Quiz();  
  }
}
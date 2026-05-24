import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
  _id?: Types.ObjectId; 
  
  @Prop({ required: true })
  text: string;

  @Prop()
  image?: string;

  @Prop()
  audio?: string;

  @Prop({ required: true })
  answer1: string;

  @Prop({ required: true })
  answer2: string;

  @Prop()
  answer3?: string;

  @Prop()
  answer4?: string;

  @Prop()
  answer5?: string;

  @Prop()
  answer6?: string;

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ required: true })
  questionValue: number;

  @Prop({ required: true })
  time: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
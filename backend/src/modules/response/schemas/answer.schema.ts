import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnswerDocument = Answer & Document;

@Schema()
export class Answer {
  _id?: Types.ObjectId; 
  
  @Prop({ required: true })
  selectedOption: string;

  @Prop({ required: true })
  isCorrect: boolean;

  @Prop({ required: true })
  timeSpent: number;

  @Prop({ required: true })
  score: number;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  question: Types.ObjectId;

}

export const AnswerSchema = SchemaFactory.createForClass(Answer);

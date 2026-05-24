import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Answer, AnswerSchema } from './answer.schema';

export type ResponseDocument = Response & Document;

@Schema({ timestamps: true })
export class Response {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quiz: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Session', default: null })
  session?: Types.ObjectId;

  @Prop({ required: true })
  nickname: string;

  @Prop({
    type: { _id: { type: Types.ObjectId } },
  })
  user?: { _id: Types.ObjectId };

  @Prop({ type: [AnswerSchema], default: [] })
  answers: Answer[];

  @Prop()
  finalScore?: number;

  @Prop()
  finalTime?: number;

  @Prop()
  createdAt: Date;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);

// Índices para queries frequentes
ResponseSchema.index({ quiz: 1 });
ResponseSchema.index({ session: 1 });
ResponseSchema.index({ 'user._id': 1 });
ResponseSchema.index({ quiz: 1, 'user._id': 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Style, StyleSchema } from './style.schema';
import { Question, QuestionSchema } from './question.schema';

export type QuizDocument = Quiz & Document;

@Schema({ timestamps: { updatedAt: true, createdAt: false } })
export class Quiz {
	@Prop({ unique: true, sparse: true })
	accessIdentifier?: string;

	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	selectedQuestions: number;

	@Prop({ required: true })
	totalQuestions: number;

	@Prop({ type: StyleSchema })
	style: Style;

	@Prop({
		type: { _id: { type: Types.ObjectId } },
	})
	user: { _id: Types.ObjectId };

	@Prop({ type: [QuestionSchema], default: [] })
	questions: Question[];

	@Prop({ required: true, default: 1 })
	version: number;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

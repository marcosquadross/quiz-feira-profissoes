import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Response, ResponseSchema } from '../../response/schemas/response.schema'
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: { updatedAt: true, createdAt: false } })
export class Session {
    @Prop({ required: true, unique: true })
    sessionAccessId: string;

    @Prop({ type: { _id: { type: Types.ObjectId } } })
    host: { _id: Types.ObjectId };

   @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
    quiz: Types.ObjectId;

    // @Prop({ required: true, default: 'waiting', enum: ['waiting', 'running', 'finished'] })
    // status: string;

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Prop({ default: null })
    startedAt: Date;

    @Prop({ default: null })
    endAt: Date;
    }

export const SessionSchema = SchemaFactory.createForClass(Session);

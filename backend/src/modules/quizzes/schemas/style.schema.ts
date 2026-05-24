import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, timestamps: false })
export class Style {
  @Prop()
  fontFamily?: string;

  @Prop()
  textColor?: string;

  @Prop()
  panelsColor?: string;

  @Prop()
  backgroundColor?: string;

  @Prop()
  backgroundImage?: string;
}

export const StyleSchema = SchemaFactory.createForClass(Style);

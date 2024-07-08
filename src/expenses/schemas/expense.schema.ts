import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import { User } from '../../auth/schemas/user.schema';

export enum ExpenseType {
  FOOD = 'Food',
  RENT = 'Rent',
  TRANSPORT = 'Transport',
  UTILITIES = 'Utilities',
  SUBSCRIPTIONS = 'Subscriptions',
  ENTERTAINMENT = 'Entertainment',
  OTHER = 'Other',
}

@Schema({
  timestamps: true,
})
export class Expense extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, enum: ExpenseType })
  type: ExpenseType;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  // user: User;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

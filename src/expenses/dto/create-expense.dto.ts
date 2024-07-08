import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseType } from '../schemas/expense.schema';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly date: Date;

  @IsNotEmpty()
  @IsEnum(ExpenseType, { message: 'Please select a correct expense type!' })
  readonly type: ExpenseType;
}

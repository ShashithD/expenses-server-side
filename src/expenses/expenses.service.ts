import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Expense } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto copy';

const monthlyLimit = 10000;

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}

  async findAll(): Promise<Expense[]> {
    return this.expenseModel.find().exec();
  }

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const { amount, date } = createExpenseDto;

    if (await this.isMonthlyLimitExceeded(amount, date)) {
      throw new BadRequestException('Monthly expense limit exceeded.');
    }

    const newExpense = new this.expenseModel(createExpenseDto);

    return newExpense.save();
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new BadRequestException('Please enter correct id.');
    }

    const existingExpense = await this.expenseModel.findById(id).exec();

    if (!existingExpense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    // Calculate the new potential total if the update is applied
    const newAmount =
      updateExpenseDto.amount !== undefined
        ? updateExpenseDto.amount
        : existingExpense.amount;

    const newDate = updateExpenseDto.date || existingExpense.date;

    if (
      await this.isMonthlyLimitExceeded(
        newAmount - existingExpense.amount,
        newDate,
      )
    ) {
      throw new BadRequestException(
        'Updating this expense would exceed the monthly limit.',
      );
    }

    const updatedExpense = await this.expenseModel
      .findByIdAndUpdate(id, updateExpenseDto, { new: true })
      .exec();
    return updatedExpense;
  }

  async remove(id: string): Promise<any> {
    const result = await this.expenseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return { message: 'Expense deleted successfully' };
  }

  async getExpensesByType(): Promise<any[]> {
    return this.expenseModel.aggregate([
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          totalAmount: 1
        }
      },
      {
        $sort: { totalAmount: -1 }  // Optional: sort by the total amount descending
      }
    ]).exec();
  }

  private async isMonthlyLimitExceeded(
    newAmount: number,
    date: Date,
  ): Promise<boolean> {
    console.log(date);

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const total = await this.expenseModel.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const currentTotal = total.length > 0 ? total[0].total : 0;

    return currentTotal + newAmount > monthlyLimit;
  }
}

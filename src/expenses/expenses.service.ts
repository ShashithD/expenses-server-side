import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Expense } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

const monthlyLimit = 10000;

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}

  async findAll(userId: string): Promise<Expense[]> {
    return this.expenseModel.find({ user: userId }).exec();
  }

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: string,
  ): Promise<Expense> {
    const { amount, date } = createExpenseDto;

    if (await this.isMonthlyLimitExceeded(amount, date, userId)) {
      throw new BadRequestException('Monthly expense limit exceeded.');
    }

    const newExpense = new this.expenseModel({
      ...createExpenseDto,
      user: userId,
    });

    return newExpense.save();
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    userId: string,
  ): Promise<Expense> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new BadRequestException('Please enter correct id.');
    }

    const existingExpense = await this.expenseModel
      .findOne({ _id: id, user: userId })
      .exec();

    if (!existingExpense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    const newAmount =
      updateExpenseDto.amount !== undefined
        ? updateExpenseDto.amount
        : existingExpense.amount;

    const newDate = updateExpenseDto.date || existingExpense.date;

    if (
      await this.isMonthlyLimitExceeded(
        newAmount - existingExpense.amount,
        newDate,
        existingExpense.user.toString(),
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

  async remove(id: string, userId: string): Promise<any> {
    const result = await this.expenseModel
      .findOneAndDelete({ _id: id, user: userId })
      .exec();
    if (!result) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    return { message: 'Expense deleted successfully' };
  }

  async getExpensesByType(userId: string): Promise<any[]> {
    return this.expenseModel
      .aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$type', totalAmount: { $sum: '$amount' } } },
        { $project: { _id: 0, type: '$_id', totalAmount: 1 } },
        { $sort: { totalAmount: -1 } },
      ])
      .exec();
  }

  async getTotalExpensesForCurrentMonth(
    userId: string,
  ): Promise<{ total: number }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      0,
    );

    endOfMonth.setHours(23, 59, 59, 999);

    const totalExpenses = await this.expenseModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return { total: totalExpenses.length > 0 ? totalExpenses[0].total : 0 };
  }

  private async isMonthlyLimitExceeded(
    newAmount: number,
    date: Date,
    userId: string,
  ): Promise<boolean> {
    console.log(date);

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const total = await this.expenseModel.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const currentTotal = total.length > 0 ? total[0].total : 0;

    return currentTotal + newAmount > monthlyLimit;
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @UseGuards(AuthGuard())
  async findAll(@Req() req: Request) {
    const userId = req.user['_id'].toString();

    return this.expensesService.findAll(userId);
  }

  @Post()
  @UseGuards(AuthGuard())
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Req() req: Request,
  ) {
    const userId = req.user['_id'].toString();

    const expense = await this.expensesService.create(createExpenseDto, userId);

    return expense;
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Req() req: Request,
  ) {
    const userId = req.user['_id'].toString();

    return this.expensesService.update(id, updateExpenseDto, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user['_id'].toString();

    return this.expensesService.remove(id, userId);
  }

  @Get('/stats/by-type')
  @UseGuards(AuthGuard())
  getExpensesByType(@Req() req) {
    const userId = req.user['_id'].toString();

    return this.expensesService.getExpensesByType(userId);
  }

  @Get('/total-current-month')
  @UseGuards(AuthGuard())
  getTotalExpensesForCurrentMonth(@Req() req: Request) {
    const userId = req.user['_id'].toString();

    return this.expensesService.getTotalExpensesForCurrentMonth(userId);
  }
}

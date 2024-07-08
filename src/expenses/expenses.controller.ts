import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto copy';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async findAll() {
    return this.expensesService.findAll();
  }

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    const expense = await this.expensesService.create(createExpenseDto);

    return expense;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }

  @Get('/stats/by-type')
  getExpensesByType() {
    return this.expensesService.getExpensesByType();
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto copy';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @UseGuards(AuthGuard())
  async findAll() {
    return this.expensesService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    const expense = await this.expensesService.create(createExpenseDto);

    return expense;
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }

  @Get('/stats/by-type')
  @UseGuards(AuthGuard())
  getExpensesByType() {
    return this.expensesService.getExpensesByType();
  }
}

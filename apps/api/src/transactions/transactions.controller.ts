import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto, CreateInstallmentDto, CarryOverDto, PartialPaymentDto } from './dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions (optional filter by year/month)' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  findAll(
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.transactionsService.findAll(year, month);
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get transactions by account' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  findByAccount(
    @Param('accountId') accountId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.transactionsService.findByAccount(accountId, year, month);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get transactions by date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  findByDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.findByDate(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new transaction' })
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Post('installment')
  @ApiOperation({ summary: 'Create installment transactions' })
  createInstallment(@Body() dto: CreateInstallmentDto) {
    return this.transactionsService.createInstallment(dto);
  }

  @Post('carry-over')
  @ApiOperation({ summary: 'Create carry over transaction' })
  carryOver(@Body() dto: CarryOverDto) {
    return this.transactionsService.carryOver(
      dto.fromYear,
      dto.fromMonth,
      dto.amount,
    );
  }

  @Post('partial-payment')
  @ApiOperation({ summary: 'Record partial payment and carry remaining to next month' })
  partialPayment(@Body() dto: PartialPaymentDto) {
    return this.transactionsService.partialPayment(
      dto.transactionId,
      dto.paidAmount,
      dto.interestAmount || 0,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transaction' })
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }

  @Delete('installment-group/:groupId')
  @ApiOperation({ summary: 'Delete all transactions in installment group' })
  removeInstallmentGroup(@Param('groupId') groupId: string) {
    return this.transactionsService.removeInstallmentGroup(groupId);
  }
}


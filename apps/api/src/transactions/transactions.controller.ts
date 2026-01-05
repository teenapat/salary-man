import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CarryOverDto, CreateInstallmentDto, CreateTransactionDto, PartialPaymentDto, UpdateTransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions (optional filter by year/month)' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  findAll(
    @CurrentUser() user: any,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.transactionsService.findAll(user.id, year, month);
  }

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get transactions by account' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  findByAccount(
    @CurrentUser() user: any,
    @Param('accountId') accountId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.transactionsService.findByAccount(user.id, accountId, year, month);
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get transactions by date range' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  findByDate(
    @CurrentUser() user: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.findByDate(
      user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.transactionsService.findOneWithAuth(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new transaction' })
  create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, dto);
  }

  @Post('installment')
  @ApiOperation({ summary: 'Create installment transactions' })
  createInstallment(@CurrentUser() user: any, @Body() dto: CreateInstallmentDto) {
    return this.transactionsService.createInstallment(user.id, dto);
  }

  @Post('carry-over')
  @ApiOperation({ summary: 'Create carry over transaction' })
  carryOver(@CurrentUser() user: any, @Body() dto: CarryOverDto) {
    return this.transactionsService.carryOver(
      user.id,
      dto.fromYear,
      dto.fromMonth,
      dto.amount,
    );
  }

  @Post('partial-payment')
  @ApiOperation({ summary: 'Record partial payment and carry remaining to next month' })
  partialPayment(@CurrentUser() user: any, @Body() dto: PartialPaymentDto) {
    return this.transactionsService.partialPayment(
      user.id,
      dto.transactionId,
      dto.paidAmount,
      dto.interestAmount || 0,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transaction' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }

  @Delete('installment-group/:groupId')
  @ApiOperation({ summary: 'Delete all transactions in installment group' })
  removeInstallmentGroup(@CurrentUser() user: any, @Param('groupId') groupId: string) {
    return this.transactionsService.removeInstallmentGroup(user.id, groupId);
  }
}

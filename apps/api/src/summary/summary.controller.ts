import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SummaryService, MonthlySummary, AccountSummary } from './summary.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('summary')
@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get('month/:year/:month')
  @ApiOperation({ summary: 'Get monthly summary (income, expense, net)' })
  @ApiParam({ name: 'year', example: 2026 })
  @ApiParam({ name: 'month', example: 1 })
  getMonthlySummary(
    @CurrentUser() user: any,
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<MonthlySummary> {
    return this.summaryService.getMonthlySummary(user.id, year, month);
  }

  @Get('year/:year')
  @ApiOperation({ summary: 'Get all monthly summaries for a year' })
  @ApiParam({ name: 'year', example: 2026 })
  getYearSummary(
    @CurrentUser() user: any,
    @Param('year') year: number,
  ): Promise<MonthlySummary[]> {
    return this.summaryService.getYearSummary(user.id, year);
  }

  @Get('account/:accountId/:year/:month')
  @ApiOperation({ summary: 'Get account summary for specific month' })
  getAccountSummary(
    @CurrentUser() user: any,
    @Param('accountId') accountId: string,
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<AccountSummary> {
    return this.summaryService.getAccountSummary(user.id, accountId, year, month);
  }

  @Get('accounts/:year/:month')
  @ApiOperation({ summary: 'Get all accounts summary for specific month' })
  getAllAccountsSummary(
    @CurrentUser() user: any,
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<AccountSummary[]> {
    return this.summaryService.getAllAccountsSummary(user.id, year, month);
  }

  @Get('installments/upcoming')
  @ApiOperation({ summary: 'Get upcoming installment payments' })
  @ApiQuery({ name: 'months', required: false, type: Number, example: 6 })
  getUpcomingInstallments(
    @CurrentUser() user: any,
    @Query('months') months?: number,
  ) {
    return this.summaryService.getUpcomingInstallments(user.id, months || 6);
  }
}

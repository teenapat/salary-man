import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SummaryService, MonthlySummary, AccountSummary } from './summary.service';

@ApiTags('summary')
@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get('month/:year/:month')
  @ApiOperation({ summary: 'Get monthly summary (income, expense, net)' })
  @ApiParam({ name: 'year', example: 2026 })
  @ApiParam({ name: 'month', example: 1 })
  getMonthlySummary(
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<MonthlySummary> {
    return this.summaryService.getMonthlySummary(year, month);
  }

  @Get('year/:year')
  @ApiOperation({ summary: 'Get all monthly summaries for a year' })
  @ApiParam({ name: 'year', example: 2026 })
  getYearSummary(@Param('year') year: number): Promise<MonthlySummary[]> {
    return this.summaryService.getYearSummary(year);
  }

  @Get('account/:accountId/:year/:month')
  @ApiOperation({ summary: 'Get account summary for specific month' })
  getAccountSummary(
    @Param('accountId') accountId: string,
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<AccountSummary> {
    return this.summaryService.getAccountSummary(accountId, year, month);
  }

  @Get('accounts/:year/:month')
  @ApiOperation({ summary: 'Get all accounts summary for specific month' })
  getAllAccountsSummary(
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<AccountSummary[]> {
    return this.summaryService.getAllAccountsSummary(year, month);
  }

  @Get('installments/upcoming')
  @ApiOperation({ summary: 'Get upcoming installment payments' })
  @ApiQuery({ name: 'months', required: false, type: Number, example: 6 })
  getUpcomingInstallments(@Query('months') months?: number) {
    return this.summaryService.getUpcomingInstallments(months || 6);
  }
}

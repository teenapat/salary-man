import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MonthlySummary {
  year: number;
  month: number;
  income: number;
  expense: number;
  net: number;
  hasCarriedOver: boolean; // ย้ายยอดไปเดือนหน้าแล้วหรือยัง
}

export interface AccountSummary {
  accountId: string;
  accountName: string;
  accountType: string;
  year: number;
  month: number;
  total: number;
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    installmentIndex?: number;
    installmentTotal?: number;
    installmentGroupId?: string;
    isPartiallyPaid?: boolean;
  }>;
}

@Injectable()
export class SummaryService {
  constructor(private prisma: PrismaService) {}

  async getMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        postedYear: year,
        postedMonth: month,
      },
    });

    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      if (amount > 0) {
        income += amount;
      } else {
        expense += amount;
      }
    });

    // เช็คว่าย้ายยอดจากเดือนนี้ไปเดือนหน้าแล้วหรือยัง
    const carryOverExists = await this.prisma.transaction.findFirst({
      where: {
        isCarryOver: true,
        carryFromYear: year,
        carryFromMonth: month,
      },
    });

    return {
      year,
      month,
      income,
      expense,
      net: income + expense,
      hasCarriedOver: !!carryOverExists,
    };
  }

  async getYearSummary(year: number): Promise<MonthlySummary[]> {
    const summaries: MonthlySummary[] = [];

    for (let month = 1; month <= 12; month++) {
      const summary = await this.getMonthlySummary(year, month);
      summaries.push(summary);
    }

    return summaries;
  }

  async getAccountSummary(
    accountId: string,
    year: number,
    month: number,
  ): Promise<AccountSummary> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId,
        postedYear: year,
        postedMonth: month,
      },
      orderBy: [{ txDate: 'desc' }, { createdAt: 'desc' }],
    });

    const total = transactions.reduce(
      (sum, tx) => sum + Number(tx.amount),
      0,
    );

    return {
      accountId,
      accountName: account.name,
      accountType: account.type,
      year,
      month,
      total,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        description: tx.description,
        amount: Number(tx.amount),
        installmentIndex: tx.installmentIndex ?? undefined,
        installmentTotal: tx.installmentTotal ?? undefined,
        installmentGroupId: tx.installmentGroupId ?? undefined,
        isPartiallyPaid: tx.isPartiallyPaid,
      })),
    };
  }

  async getAllAccountsSummary(year: number, month: number): Promise<AccountSummary[]> {
    const accounts = await this.prisma.account.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    const summaries: AccountSummary[] = [];

    for (const account of accounts) {
      const summary = await this.getAccountSummary(account.id, year, month);
      if (summary.transactions.length > 0) {
        summaries.push(summary);
      }
    }

    return summaries;
  }

  async getUpcomingInstallments(months: number = 6): Promise<any[]> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Calculate end date
    let endYear = currentYear;
    let endMonth = currentMonth + months;
    while (endMonth > 12) {
      endMonth -= 12;
      endYear += 1;
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        installmentGroupId: { not: null },
        OR: [
          {
            postedYear: currentYear,
            postedMonth: { gte: currentMonth },
          },
          {
            postedYear: { gt: currentYear, lt: endYear },
          },
          {
            postedYear: endYear,
            postedMonth: { lte: endMonth },
          },
        ],
      },
      include: { account: true },
      orderBy: [
        { postedYear: 'asc' },
        { postedMonth: 'asc' },
        { installmentIndex: 'asc' },
      ],
    });

    // Group by installmentGroupId
    const grouped = new Map<string, any[]>();
    transactions.forEach((tx) => {
      const groupId = tx.installmentGroupId!;
      if (!grouped.has(groupId)) {
        grouped.set(groupId, []);
      }
      grouped.get(groupId)!.push(tx);
    });

    return Array.from(grouped.entries()).map(([groupId, txs]) => ({
      groupId,
      description: txs[0].description,
      accountName: txs[0].account.name,
      amountPerMonth: Number(txs[0].amount),
      remaining: txs.length,
      total: txs[0].installmentTotal,
      nextPayments: txs.slice(0, 3).map((tx) => ({
        year: tx.postedYear,
        month: tx.postedMonth,
        index: tx.installmentIndex,
      })),
    }));
  }
}


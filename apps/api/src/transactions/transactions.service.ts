import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstallmentDto, CreateTransactionDto, UpdateTransactionDto } from './dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // Helper to get user's account IDs
  private async getUserAccountIds(userId: string): Promise<string[]> {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });
    return accounts.map((a) => a.id);
  }

  // Helper to verify account ownership
  private async verifyAccountOwnership(accountId: string, userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account || account.userId !== userId) {
      throw new ForbiddenException('Access denied to this account');
    }
    return account;
  }

  async findAll(userId: string, year?: number, month?: number) {
    const accountIds = await this.getUserAccountIds(userId);
    const where: any = { accountId: { in: accountIds } };
    if (year) where.postedYear = year;
    if (month) where.postedMonth = month;

    return this.prisma.transaction.findMany({
      where,
      include: { account: true },
      orderBy: [{ txDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findByAccount(userId: string, accountId: string, year?: number, month?: number) {
    await this.verifyAccountOwnership(accountId, userId);
    
    const where: any = { accountId };
    if (year) where.postedYear = year;
    if (month) where.postedMonth = month;

    return this.prisma.transaction.findMany({
      where,
      include: { account: true },
      orderBy: [{ txDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findByDate(userId: string, startDate: Date, endDate: Date) {
    const accountIds = await this.getUserAccountIds(userId);
    
    return this.prisma.transaction.findMany({
      where: {
        accountId: { in: accountIds },
        txDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { account: true },
      orderBy: [{ txDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { account: true },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return transaction;
  }

  async findOneWithAuth(userId: string, id: string) {
    const transaction = await this.findOne(id);
    
    // Verify ownership via account
    await this.verifyAccountOwnership(transaction.accountId, userId);
    
    return transaction;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    await this.verifyAccountOwnership(dto.accountId, userId);
    const txDate = new Date(dto.txDate);
    
    return this.prisma.transaction.create({
      data: {
        txDate,
        postedYear: dto.postedYear,
        postedMonth: dto.postedMonth,
        amount: new Decimal(dto.amount),
        description: dto.description,
        accountId: dto.accountId,
      },
      include: { account: true },
    });
  }

  async createInstallment(userId: string, dto: CreateInstallmentDto) {
    await this.verifyAccountOwnership(dto.accountId, userId);
    const groupId = uuidv4();
    const txDate = new Date(dto.txDate);
    const transactions = [];

    for (let i = 0; i < dto.installmentTotal; i++) {
      // Calculate posted month for each installment
      let postedMonth = dto.postedMonth + i;
      let postedYear = dto.postedYear;
      
      while (postedMonth > 12) {
        postedMonth -= 12;
        postedYear += 1;
      }

      transactions.push({
        txDate,
        postedYear,
        postedMonth,
        amount: new Decimal(dto.amount),
        description: dto.description,
        accountId: dto.accountId,
        installmentGroupId: groupId,
        installmentIndex: i + 1,
        installmentTotal: dto.installmentTotal,
      });
    }

    await this.prisma.transaction.createMany({
      data: transactions,
    });

    return this.prisma.transaction.findMany({
      where: { installmentGroupId: groupId },
      include: { account: true },
      orderBy: { installmentIndex: 'asc' },
    });
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const tx = await this.findOne(id);
    
    // Verify ownership via account
    await this.verifyAccountOwnership(tx.accountId, userId);

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.txDate && { txDate: new Date(dto.txDate) }),
        ...(dto.postedYear && { postedYear: dto.postedYear }),
        ...(dto.postedMonth && { postedMonth: dto.postedMonth }),
        ...(dto.amount !== undefined && { amount: new Decimal(dto.amount) }),
        ...(dto.description && { description: dto.description }),
        ...(dto.accountId && { accountId: dto.accountId }),
      },
      include: { account: true },
    });
  }

  async remove(userId: string, id: string) {
    const tx = await this.findOne(id);
    
    // Verify ownership via account
    await this.verifyAccountOwnership(tx.accountId, userId);
    
    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async removeInstallmentGroup(userId: string, groupId: string) {
    // Get one transaction from the group to verify ownership
    const tx = await this.prisma.transaction.findFirst({
      where: { installmentGroupId: groupId },
    });
    
    if (!tx) {
      throw new NotFoundException('Installment group not found');
    }
    
    // Verify ownership via account
    await this.verifyAccountOwnership(tx.accountId, userId);
    
    return this.prisma.transaction.deleteMany({
      where: { installmentGroupId: groupId },
    });
  }

  async carryOver(userId: string, fromYear: number, fromMonth: number, amount: number) {
    // Find carry over account for this user
    const carryAccount = await this.prisma.account.findFirst({
      where: { type: 'CARRY_OVER', userId },
    });

    if (!carryAccount) {
      throw new NotFoundException('Carry over account not found. Please create one first.');
    }

    // Calculate next month
    let toMonth = fromMonth + 1;
    let toYear = fromYear;
    if (toMonth > 12) {
      toMonth = 1;
      toYear += 1;
    }

    const thaiMonths = [
      '', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
      'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
      'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    return this.prisma.transaction.create({
      data: {
        txDate: new Date(fromYear, fromMonth - 1, 28), // End of from month
        postedYear: toYear,
        postedMonth: toMonth,
        amount: new Decimal(amount),
        description: `ย้ายจาก ${thaiMonths[fromMonth]} ${fromYear}`,
        accountId: carryAccount.id,
        isCarryOver: true,
        carryFromYear: fromYear,
        carryFromMonth: fromMonth,
      },
      include: { account: true },
    });
  }

  async partialPayment(
    userId: string,
    transactionId: string,
    paidAmount: number,
    interestAmount: number = 0,
  ) {
    // Get original transaction
    const original = await this.findOne(transactionId);
    
    // Verify ownership via account
    await this.verifyAccountOwnership(original.accountId, userId);
    
    // Check if already partially paid
    if (original.isPartiallyPaid) {
      throw new Error('This transaction has already been partially paid');
    }
    
    const originalAmount = Math.abs(Number(original.amount));
    
    // Calculate remaining amount
    const remainingAmount = originalAmount - paidAmount;
    
    if (remainingAmount <= 0) {
      throw new Error('Paid amount must be less than original amount');
    }

    // Calculate next month
    let toMonth = original.postedMonth + 1;
    let toYear = original.postedYear;
    if (toMonth > 12) {
      toMonth = 1;
      toYear += 1;
    }

    const transactions = [];

    // Create remaining balance transaction for next month
    transactions.push({
      txDate: new Date(),
      postedYear: toYear,
      postedMonth: toMonth,
      amount: new Decimal(-remainingAmount),
      description: `ยอดค้าง ${original.description}`,
      accountId: original.accountId,
    });

    // Create interest transaction if provided
    if (interestAmount > 0) {
      transactions.push({
        txDate: new Date(),
        postedYear: toYear,
        postedMonth: toMonth,
        amount: new Decimal(-interestAmount),
        description: `ดอกเบี้ย ${original.description}`,
        accountId: original.accountId,
      });
    }

    // Create transactions for next month
    await this.prisma.transaction.createMany({
      data: transactions,
    });

    // Update original transaction: mark as partially paid AND update amount to paid amount
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { 
        isPartiallyPaid: true,
        amount: new Decimal(-paidAmount), // Update to actual paid amount (negative for expense)
        description: `${original.description} (จ่าย ${paidAmount.toLocaleString()})`,
      },
    });

    return {
      originalAmount,
      paidAmount,
      remainingAmount,
      interestAmount,
      totalNextMonth: remainingAmount + interestAmount,
      nextMonth: { year: toYear, month: toMonth },
    };
  }
}


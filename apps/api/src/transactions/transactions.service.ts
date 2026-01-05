import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto, CreateInstallmentDto } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(year?: number, month?: number) {
    const where: any = {};
    if (year) where.postedYear = year;
    if (month) where.postedMonth = month;

    return this.prisma.transaction.findMany({
      where,
      include: { account: true },
      orderBy: [{ txDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findByAccount(accountId: string, year?: number, month?: number) {
    const where: any = { accountId };
    if (year) where.postedYear = year;
    if (month) where.postedMonth = month;

    return this.prisma.transaction.findMany({
      where,
      include: { account: true },
      orderBy: [{ txDate: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findByDate(startDate: Date, endDate: Date) {
    return this.prisma.transaction.findMany({
      where: {
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

  async create(dto: CreateTransactionDto) {
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

  async createInstallment(dto: CreateInstallmentDto) {
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

  async update(id: string, dto: UpdateTransactionDto) {
    await this.findOne(id); // Check if exists

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

  async remove(id: string) {
    await this.findOne(id); // Check if exists
    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async removeInstallmentGroup(groupId: string) {
    return this.prisma.transaction.deleteMany({
      where: { installmentGroupId: groupId },
    });
  }

  async carryOver(fromYear: number, fromMonth: number, amount: number) {
    // Find carry over account
    const carryAccount = await this.prisma.account.findFirst({
      where: { type: 'CARRY_OVER' },
    });

    if (!carryAccount) {
      throw new NotFoundException('Carry over account not found. Please seed accounts first.');
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
    transactionId: string,
    paidAmount: number,
    interestAmount: number = 0,
  ) {
    // Get original transaction
    const original = await this.findOne(transactionId);
    
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


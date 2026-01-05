import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto, AccountType } from './dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.account.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.account.findUnique({
      where: { id },
    });
  }

  async create(dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        name: dto.name,
        type: dto.type,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateAccountDto) {
    return this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    // Soft delete - just mark as inactive
    return this.prisma.account.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async seed() {
    const defaultAccounts = [
      { name: 'เงินสด', type: 'CASH', sortOrder: 0 },
      { name: 'JCB', type: 'CREDIT_CARD', sortOrder: 1 },
      { name: 'Card X Master Card', type: 'CREDIT_CARD', sortOrder: 2 },
      { name: 'Card X Speedy Cash', type: 'CREDIT_CARD', sortOrder: 3 },
      { name: 'KTC', type: 'CREDIT_CARD', sortOrder: 4 },
      { name: 'KTC PROUD', type: 'CREDIT_CARD', sortOrder: 5 },
      { name: 'ย้ายยอด', type: 'CARRY_OVER', sortOrder: 99 },
    ];

    const existing = await this.prisma.account.count();
    if (existing === 0) {
      await this.prisma.account.createMany({
        data: defaultAccounts,
      });
      return { message: 'Seeded default accounts', count: defaultAccounts.length };
    }
    return { message: 'Accounts already exist', count: existing };
  }
}


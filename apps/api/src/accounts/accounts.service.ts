import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return account;
  }

  async create(userId: string, dto: CreateAccountDto) {
    // Get max sort order
    const maxSort = await this.prisma.account.aggregate({
      where: { userId },
      _max: { sortOrder: true },
    });

    return this.prisma.account.create({
      data: {
        name: dto.name,
        type: dto.type,
        sortOrder: dto.sortOrder ?? (maxSort._max.sortOrder || 0) + 1,
        userId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateAccountDto) {
    await this.findOne(id, userId); // Check ownership

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

  async remove(id: string, userId: string) {
    const account = await this.findOne(id, userId);

    // Don't allow deleting CARRY_OVER account
    if (account.type === 'CARRY_OVER') {
      throw new ForbiddenException('Cannot delete carry-over account');
    }

    // Check if account has transactions
    const txCount = await this.prisma.transaction.count({
      where: { accountId: id },
    });

    if (txCount > 0) {
      // Soft delete - just mark as inactive
      return this.prisma.account.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Hard delete if no transactions
    return this.prisma.account.delete({
      where: { id },
    });
  }

  async reorder(userId: string, accountIds: string[]) {
    // Update sort order based on array position
    const updates = accountIds.map((id, index) =>
      this.prisma.account.updateMany({
        where: { id, userId },
        data: { sortOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findAll(userId);
  }
}

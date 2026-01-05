import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [
    PrismaModule,
    AccountsModule,
    TransactionsModule,
    SummaryModule,
  ],
})
export class AppModule {}


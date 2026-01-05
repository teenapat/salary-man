'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatMoney, cn } from '@/lib/utils';
import {
  ChevronRightIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  DocumentDuplicateIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import type { AccountSummary } from '@/lib/api';

interface AccountCardProps {
  account: AccountSummary;
  index?: number;
}

function AccountIcon({ type, className }: { type: string; className?: string }) {
  const iconClass = cn('w-6 h-6', className);
  
  switch (type) {
    case 'CASH':
      return <BanknotesIcon className={iconClass} />;
    case 'CREDIT_CARD':
      return <CreditCardIcon className={iconClass} />;
    case 'BANK_ACCOUNT':
      return <BuildingLibraryIcon className={iconClass} />;
    case 'CARRY_OVER':
      return <DocumentDuplicateIcon className={iconClass} />;
    default:
      return <WalletIcon className={iconClass} />;
  }
}

export function AccountCard({ account, index = 0 }: AccountCardProps) {
  const hasInstallments = account.transactions.some(
    (tx) => tx.installmentIndex !== undefined
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        href={`/accounts/${account.accountId}?year=${account.year}&month=${account.month}`}
        className="card-hover block"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sm-accent/10 flex items-center justify-center">
              <AccountIcon type={account.accountType} className="text-sm-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm-text">{account.accountName}</h3>
              <p className="text-sm text-sm-text-muted">
                {account.transactions.length} รายการ
                {hasInstallments && (
                  <span className="ml-2 badge-installment">มีผ่อน</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-lg font-mono font-semibold text-sm-expense tabular-nums">
              {formatMoney(account.total)}
            </p>
            <ChevronRightIcon className="w-5 h-5 text-sm-text-muted" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export { AccountIcon };

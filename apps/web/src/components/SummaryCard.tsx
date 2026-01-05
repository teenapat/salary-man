'use client';

import { motion } from 'framer-motion';
import { formatMoney, cn } from '@/lib/utils';
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';

interface SummaryCardProps {
  income: number;
  expense: number;
  net: number;
}

export function SummaryCard({ income, expense, net }: SummaryCardProps) {
  const isNegative = net < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative overflow-hidden"
    >
      {/* Background glow effect */}
      <div
        className={cn(
          'absolute inset-0 opacity-10',
          isNegative
            ? 'bg-gradient-to-br from-sm-expense to-transparent'
            : 'bg-gradient-to-br from-sm-income to-transparent'
        )}
      />

      <div className="relative space-y-4">
        {/* Income & Expense */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-sm-text-muted mb-1">รายรับ</p>
            <p className="text-lg font-mono font-semibold text-sm-income tabular-nums">
              +{formatMoney(income)}
            </p>
          </div>
          <div>
            <p className="text-sm text-sm-text-muted mb-1">รายจ่าย</p>
            <p className="text-lg font-mono font-semibold text-sm-expense tabular-nums">
              {formatMoney(expense)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-sm-border/50" />

        {/* Net */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-sm-text-muted">คงเหลือ</p>
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-2xl font-mono font-bold tabular-nums',
                isNegative ? 'text-sm-expense' : 'text-sm-income'
              )}
            >
              {net > 0 && '+'}
              {formatMoney(net)}
            </p>
            {isNegative && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ExclamationCircleIcon className="w-7 h-7 text-sm-expense" />
              </motion.div>
            )}
            {!isNegative && net > 0 && (
              <CheckCircleIcon className="w-7 h-7 text-sm-income" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

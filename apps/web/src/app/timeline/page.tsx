'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';
import { transactionApi, type Transaction } from '@/lib/api';
import { formatThaiDate, cn } from '@/lib/utils';
import {
  ArrowPathIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { format, subDays } from 'date-fns';

interface GroupedTransactions {
  date: string;
  formattedDate: string;
  transactions: Transaction[];
  total: number;
}

export default function TimelinePage() {
  const [grouped, setGrouped] = useState<GroupedTransactions[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, 30);
      
      const data = await transactionApi.getTimeline(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );

      // Group by date
      const groups = new Map<string, Transaction[]>();
      data.forEach((tx) => {
        const dateKey = format(new Date(tx.txDate), 'yyyy-MM-dd');
        if (!groups.has(dateKey)) {
          groups.set(dateKey, []);
        }
        groups.get(dateKey)!.push(tx);
      });

      // Convert to array and sort
      const result: GroupedTransactions[] = Array.from(groups.entries())
        .map(([date, transactions]) => ({
          date,
          formattedDate: formatThaiDate(date),
          transactions,
          total: transactions.reduce((sum, tx) => sum + Number(tx.amount), 0),
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setGrouped(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, installmentGroupId?: string) => {
    try {
      if (installmentGroupId) {
        // Delete entire installment group
        await transactionApi.deleteInstallmentGroup(installmentGroupId);
      } else {
        // Delete single transaction
        await transactionApi.delete(id);
      }
      // Refresh data
      fetchData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const isToday = (date: string) => {
    return date === format(new Date(), 'yyyy-MM-dd');
  };

  const isYesterday = (date: string) => {
    return date === format(subDays(new Date(), 1), 'yyyy-MM-dd');
  };

  const getDateLabel = (date: string, formatted: string) => {
    if (isToday(date)) return 'วันนี้';
    if (isYesterday(date)) return 'เมื่อวาน';
    return formatted;
  };

  return (
    <main className="pb-24 min-h-screen gradient-radial">
      <div className="max-w-lg mx-auto px-4 safe-top">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-sm-text flex items-center gap-2">
            <CalendarDaysIcon className="w-7 h-7 text-sm-accent" />
            รายการล่าสุด
          </h1>
          <p className="text-sm text-sm-text-muted mt-1">
            30 วันที่ผ่านมา • ปัดซ้ายเพื่อลบ
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <ArrowPathIcon className="w-8 h-8 text-sm-accent animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState
            icon={<CalendarDaysIcon className="w-16 h-16 text-sm-text-muted" />}
            title="ยังไม่มีรายการ"
            description="เริ่มจดรายรับรายจ่ายกันเลย"
          />
        ) : (
          <div className="space-y-6">
            {grouped.map((group, groupIndex) => (
              <motion.div
                key={group.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={cn(
                      'font-semibold',
                      isToday(group.date)
                        ? 'text-sm-accent'
                        : 'text-sm-text-muted'
                    )}
                  >
                    {getDateLabel(group.date, group.formattedDate)}
                  </h3>
                  <span
                    className={cn(
                      'text-sm font-mono tabular-nums',
                      group.total < 0 ? 'text-sm-expense' : 'text-sm-income'
                    )}
                  >
                    {group.total > 0 ? '+' : ''}
                    {group.total.toLocaleString()}
                  </span>
                </div>

                {/* Transactions */}
                <div className="card overflow-hidden">
                  {group.transactions.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      showAccount
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

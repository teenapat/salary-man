'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { MonthSelector } from '@/components/MonthSelector';
import { EmptyState } from '@/components/EmptyState';
import { AccountIcon } from '@/components/AccountCard';
import { summaryApi, accountApi, type AccountSummary, type Account } from '@/lib/api';
import { getCurrentYearMonth, formatMoney, cn } from '@/lib/utils';
import {
  ArrowPathIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AccountsPage() {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summaries, setSummaries] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accountsData, summariesData] = await Promise.all([
        accountApi.getAll(),
        summaryApi.getAllAccounts(yearMonth.year, yearMonth.month),
      ]);
      setAccounts(accountsData);
      setSummaries(summariesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [yearMonth.year, yearMonth.month]);

  const getAccountSummary = (accountId: string) => {
    return summaries.find((s) => s.accountId === accountId);
  };

  return (
    <main className="pb-24 min-h-screen gradient-radial">
      <div className="max-w-lg mx-auto px-4 safe-top">
        {/* Header */}
        <div className="pt-6 pb-2">
          <h1 className="text-2xl font-display font-bold text-sm-text flex items-center gap-2">
            <CreditCardIcon className="w-7 h-7 text-sm-accent" />
            บัตรเครดิต
          </h1>
          <p className="text-sm text-sm-text-muted mt-1">
            ดูยอดแต่ละบัตร
          </p>
        </div>

        {/* Month Selector */}
        <MonthSelector
          year={yearMonth.year}
          month={yearMonth.month}
          onChange={(y, m) => setYearMonth({ year: y, month: m })}
        />

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <ArrowPathIcon className="w-8 h-8 text-sm-accent animate-spin" />
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={<CreditCardIcon className="w-16 h-16 text-sm-text-muted" />}
            title="ยังไม่มีบัญชี"
            description="กรุณา seed ข้อมูลเริ่มต้นก่อน"
            showAddButton={false}
          />
        ) : (
          <div className="space-y-3">
            {accounts
              .filter((a) => a.type !== 'CARRY_OVER')
              .map((account, index) => {
                const summary = getAccountSummary(account.id);
                const total = summary?.total || 0;
                const txCount = summary?.transactions.length || 0;

                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/accounts/${account.id}?year=${yearMonth.year}&month=${yearMonth.month}`}
                      className="card-hover block"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-sm-accent/10 flex items-center justify-center">
                            <AccountIcon type={account.type} className="w-7 h-7 text-sm-accent" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm-text text-lg">
                              {account.name}
                            </h3>
                            <p className="text-sm text-sm-text-muted">
                              {txCount > 0
                                ? `${txCount} รายการ`
                                : 'ไม่มีรายการ'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={cn(
                              'text-xl font-mono font-bold tabular-nums',
                              total < 0 ? 'text-sm-expense' : 'text-sm-text-muted'
                            )}
                          >
                            {total !== 0 ? formatMoney(total) : '-'}
                          </p>
                          <p className="text-xs text-sm-text-muted">บาท</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

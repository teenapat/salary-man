'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';
import { MonthSelector } from '@/components/MonthSelector';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';
import { AccountIcon } from '@/components/AccountCard';
import { PartialPaymentModal } from '@/components/PartialPaymentModal';
import { summaryApi, transactionApi, type AccountSummary, type Transaction } from '@/lib/api';
import { getCurrentYearMonth, formatMoney } from '@/lib/utils';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  InboxIcon,
  XCircleIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

export default function AccountDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const accountId = params.id as string;

  const initialYear = searchParams.get('year');
  const initialMonth = searchParams.get('month');
  const current = getCurrentYearMonth();

  const [yearMonth, setYearMonth] = useState({
    year: initialYear ? parseInt(initialYear) : current.year,
    month: initialMonth ? parseInt(initialMonth) : current.month,
  });
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showPartialPayment, setShowPartialPayment] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await summaryApi.getAccount(
        accountId,
        yearMonth.year,
        yearMonth.month
      );
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accountId, yearMonth.year, yearMonth.month]);

  const handleDelete = async (id: string, installmentGroupId?: string) => {
    try {
      if (installmentGroupId) {
        await transactionApi.deleteInstallmentGroup(installmentGroupId);
      } else {
        await transactionApi.delete(id);
      }
      fetchData();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <main className="pb-24 min-h-screen">
      <div className="max-w-lg mx-auto px-4 safe-top">
        {/* Header */}
        <div className="pt-6 pb-2">
          <Link
            href="/accounts"
            className="inline-flex items-center gap-2 text-sm-text-muted hover:text-sm-text transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>กลับ</span>
          </Link>

          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-xl bg-sm-accent/10 flex items-center justify-center">
                <AccountIcon type={summary.accountType} className="w-8 h-8 text-sm-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-sm-text">
                  {summary.accountName}
                </h1>
                <p className="text-sm text-sm-text-muted">
                  ปัดซ้ายเพื่อลบรายการ
                </p>
              </div>
            </motion.div>
          )}
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
        ) : summary ? (
          <div className="space-y-4">
            {/* Total Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-gradient-to-br from-sm-surface to-sm-surface-alt"
            >
              <p className="text-sm text-sm-text-muted mb-1">ยอดรวม</p>
              <p className="text-3xl font-mono font-bold text-sm-expense tabular-nums">
                {formatMoney(summary.total)}
              </p>
              <p className="text-sm text-sm-text-muted mt-2">
                {summary.transactions.length} รายการ
              </p>
            </motion.div>

            {/* Transactions */}
            <div>
              <h2 className="text-lg font-semibold text-sm-text mb-3">
                รายการทั้งหมด
              </h2>
              {summary.transactions.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card overflow-hidden"
                >
                  {summary.transactions.map((tx) => {
                    const transaction: Transaction = {
                      id: tx.id,
                      description: tx.description,
                      amount: tx.amount,
                      installmentIndex: tx.installmentIndex,
                      installmentTotal: tx.installmentTotal,
                      installmentGroupId: tx.installmentGroupId,
                      txDate: '',
                      postedYear: yearMonth.year,
                      postedMonth: yearMonth.month,
                      accountId: summary.accountId,
                      isCarryOver: false,
                      isPartiallyPaid: tx.isPartiallyPaid,
                    };
                    return (
                      <TransactionItem
                        key={tx.id}
                        transaction={transaction}
                        onDelete={handleDelete}
                        onPartialPayment={
                          summary.accountType === 'CREDIT_CARD'
                            ? () => {
                                setSelectedTx(transaction);
                                setShowPartialPayment(true);
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                </motion.div>
              ) : (
                <EmptyState
                  icon={<InboxIcon className="w-16 h-16 text-sm-text-muted" />}
                  title="ไม่มีรายการ"
                  description="เดือนนี้ยังไม่มีรายการในบัตรนี้"
                />
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<XCircleIcon className="w-16 h-16 text-sm-expense" />}
            title="ไม่พบบัญชี"
            showAddButton={false}
          />
        )}
      </div>

      <BottomNav />

      {/* Partial Payment Modal */}
      {showPartialPayment && selectedTx && (
        <PartialPaymentModal
          transaction={selectedTx}
          onClose={() => {
            setShowPartialPayment(false);
            setSelectedTx(null);
          }}
          onSuccess={() => {
            fetchData();
            setShowPartialPayment(false);
            setSelectedTx(null);
          }}
        />
      )}
    </main>
  );
}

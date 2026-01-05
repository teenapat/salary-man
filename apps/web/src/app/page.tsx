'use client';

import { AccountCard } from '@/components/AccountCard';
import { BottomNav } from '@/components/BottomNav';
import { EmptyState } from '@/components/EmptyState';
import { MonthSelector } from '@/components/MonthSelector';
import { SummaryCard } from '@/components/SummaryCard';
import {
  summaryApi,
  transactionApi,
  type AccountSummary,
  type MonthlySummary,
} from '@/lib/api';
import {
  formatMoney,
  getCurrentYearMonth,
  getNextMonth,
  THAI_MONTHS_SHORT,
} from '@/lib/utils';
import {
  ArrowPathIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carry Over states
  const [showCarryOverModal, setShowCarryOverModal] = useState(false);
  const [carryingOver, setCarryingOver] = useState(false);
  const [carryOverSuccess, setCarryOverSuccess] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, accountsData] = await Promise.all([
        summaryApi.getMonthly(yearMonth.year, yearMonth.month),
        summaryApi.getAllAccounts(yearMonth.year, yearMonth.month),
      ]);
      setSummary(summaryData);
      setAccounts(accountsData);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [yearMonth.year, yearMonth.month]);

  const handleMonthChange = (year: number, month: number) => {
    setYearMonth({ year, month });
  };

  const handleCarryOver = async () => {
    if (!summary || summary.net >= 0) return;

    setCarryingOver(true);
    try {
      await transactionApi.carryOver(
        yearMonth.year,
        yearMonth.month,
        summary.net // ส่งค่าติดลบไป
      );
      setCarryOverSuccess(true);
      // รอ 2 วิ แล้วปิด modal และ refresh
      setTimeout(() => {
        setShowCarryOverModal(false);
        setCarryOverSuccess(false);
        // ไปดูเดือนถัดไป
        const next = getNextMonth(yearMonth.year, yearMonth.month);
        setYearMonth(next);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการย้ายยอด');
    } finally {
      setCarryingOver(false);
    }
  };

  const nextMonth = getNextMonth(yearMonth.year, yearMonth.month);

  return (
    <main className="pb-24 min-h-screen gradient-radial">
      <div className="max-w-lg mx-auto px-4 safe-top">
        {/* Header */}
        <div className="pt-6 pb-2">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-display font-bold text-sm-text flex items-center gap-2"
          >
            <BriefcaseIcon className="w-7 h-7 text-sm-accent" />
            salary-man
          </motion.h1>
          <p className="text-sm text-sm-text-muted mt-1">เดือนนี้รอดไหม?</p>
        </div>

        {/* Month Selector */}
        <MonthSelector
          year={yearMonth.year}
          month={yearMonth.month}
          onChange={handleMonthChange}
        />

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <ArrowPathIcon className="w-8 h-8 text-sm-accent animate-spin" />
          </div>
        ) : error ? (
          <div className="card text-center py-8">
            <p className="text-sm-text-muted mb-4">{error}</p>
            <button onClick={fetchData} className="btn-primary">
              ลองใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Monthly Summary */}
            {summary && (
              <SummaryCard
                income={summary.income}
                expense={summary.expense}
                net={summary.net}
              />
            )}

            {/* Carry Over Button if negative */}
            {summary && summary.net < 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`card ${summary.hasCarriedOver
                  ? 'bg-sm-warning/10 border-sm-warning/30'
                  : 'bg-sm-expense/10 border-sm-expense/30'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    {summary.hasCarriedOver ? (
                      <>
                        <p className="font-medium text-sm-warning flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5" />
                          ย้ายยอดแล้ว
                        </p>
                        <p className="text-sm text-sm-text-muted">
                          ยอด {formatMoney(Math.abs(summary.net))} บาท ถูกย้ายไป{' '}
                          {THAI_MONTHS_SHORT[nextMonth.month]} แล้ว
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-sm-text">ใช้เกินงบ!</p>
                        <p className="text-sm text-sm-text-muted">
                          ต้องย้ายไปเดือนหน้า{' '}
                          {formatMoney(Math.abs(summary.net))} บาท
                        </p>
                      </>
                    )}
                  </div>
                  {!summary.hasCarriedOver && (
                    <button
                      onClick={() => setShowCarryOverModal(true)}
                      className="btn-secondary text-sm flex items-center gap-1"
                    >
                      ย้ายยอด
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Account Summaries */}
            <div>
              <h2 className="text-lg font-semibold text-sm-text mb-3">
                รายจ่ายแยกตามบัตร
              </h2>
              {accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.map((account, index) => (
                    <AccountCard
                      key={account.accountId}
                      account={account}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <CreditCardIcon className="w-16 h-16 text-sm-text-muted" />
                  }
                  title="ยังไม่มีรายการ"
                  description="เพิ่มรายการเงินเข้า-ออกเพื่อดูสรุป"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Carry Over Modal */}
      {showCarryOverModal && summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !carryingOver && setShowCarryOverModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-sm-surface rounded-2xl p-6 max-w-sm w-full border border-sm-border"
          >
            {carryOverSuccess ? (
              // Success state
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-sm-income/20 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircleIcon className="w-10 h-10 text-sm-income" />
                </motion.div>
                <h3 className="text-lg font-semibold text-sm-text mb-2">
                  ย้ายยอดสำเร็จ!
                </h3>
                <p className="text-sm text-sm-text-muted">
                  กำลังพาไปดูเดือน {THAI_MONTHS_SHORT[nextMonth.month]}...
                </p>
              </div>
            ) : (
              // Confirm state
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-sm-warning/20 flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-6 h-6 text-sm-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm-text">ย้ายยอด?</h3>
                    <p className="text-sm text-sm-text-muted">
                      ยืนยันการย้ายยอดไปเดือนหน้า
                    </p>
                  </div>
                </div>

                <div className="bg-sm-surface-alt rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-sm-text-muted">
                      จาก {THAI_MONTHS_SHORT[yearMonth.month]}{' '}
                      {yearMonth.year + 543}
                    </span>
                    <ArrowRightIcon className="w-4 h-4 text-sm-text-muted" />
                    <span className="text-sm text-sm-text-muted">
                      ไป {THAI_MONTHS_SHORT[nextMonth.month]}{' '}
                      {nextMonth.year + 543}
                    </span>
                  </div>
                  <p className="text-2xl font-mono font-bold text-sm-expense text-center">
                    {formatMoney(summary.net)}
                  </p>
                  <p className="text-xs text-sm-text-muted text-center mt-1">
                    ยอดที่จะย้ายไปเดือนหน้า
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCarryOverModal(false)}
                    disabled={carryingOver}
                    className="flex-1 btn-secondary"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleCarryOver}
                    disabled={carryingOver}
                    className="flex-1 btn bg-sm-warning text-sm-bg hover:bg-sm-warning/90 flex items-center justify-center gap-2"
                  >
                    {carryingOver ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ArrowRightIcon className="w-5 h-5" />
                        ย้ายยอด
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </main>
  );
}

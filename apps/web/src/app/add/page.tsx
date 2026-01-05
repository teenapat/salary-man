'use client';

import { AccountIcon } from '@/components/AccountCard';
import { BottomNav } from '@/components/BottomNav';
import { accountApi, transactionApi, type Account } from '@/lib/api';
import { cn, getCurrentYearMonth, THAI_MONTHS_SHORT } from '@/lib/utils';
import {
  ArrowPathIcon,
  CheckIcon,
  InformationCircleIcon,
  MinusIcon,
  PlusCircleIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type TransactionType = 'expense' | 'income';

export default function AddPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());

  // Installment
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentTotal, setInstallmentTotal] = useState(10);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountApi.getAll();
        setAccounts(data.filter((a) => a.type !== 'CARRY_OVER'));
        if (data.length > 0) {
          const cashAccount = data.find((a) => a.type === 'CASH');
          setSelectedAccountId(cashAccount?.id || data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async () => {
    if (!amount || !description || !selectedAccountId) return;

    const numAmount = parseFloat(amount) * (type === 'expense' ? -1 : 1);

    setSubmitting(true);
    try {
      if (isInstallment) {
        await transactionApi.createInstallment({
          txDate,
          postedYear: yearMonth.year,
          postedMonth: yearMonth.month,
          amount: numAmount,
          description,
          accountId: selectedAccountId,
          installmentTotal,
        });
      } else {
        await transactionApi.create({
          txDate,
          postedYear: yearMonth.year,
          postedMonth: yearMonth.month,
          amount: numAmount,
          description,
          accountId: selectedAccountId,
        });
      }
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  return (
    <main className="pb-24 min-h-screen">
      <div className="max-w-lg mx-auto px-4 safe-top">
        {/* Header */}
        <div className="pt-6 pb-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-sm-text flex items-center gap-2">
            <PlusCircleIcon className="w-7 h-7 text-sm-accent" />
            เพิ่มรายการ
          </h1>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-sm-surface-alt rounded-xl transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-sm-text-muted" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <ArrowPathIcon className="w-8 h-8 text-sm-accent animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Type Toggle */}
            <div className="flex gap-2 p-1 bg-sm-surface rounded-xl">
              <button
                onClick={() => setType('expense')}
                className={cn(
                  'flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
                  type === 'expense'
                    ? 'bg-sm-expense text-white'
                    : 'text-sm-text-muted hover:text-sm-text'
                )}
              >
                <MinusIcon className="w-5 h-5" />
                รายจ่าย
              </button>
              <button
                onClick={() => setType('income')}
                className={cn(
                  'flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
                  type === 'income'
                    ? 'bg-sm-income text-white'
                    : 'text-sm-text-muted hover:text-sm-text'
                )}
              >
                <PlusIcon className="w-5 h-5" />
                รายรับ
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm text-sm-text-muted mb-2 block">
                จำนวนเงิน
              </label>
              <div className="relative">
                <span
                  className={cn(
                    'absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold',
                    type === 'expense' ? 'text-sm-expense' : 'text-sm-income'
                  )}
                >
                  {type === 'expense' ? '-' : '+'}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="input text-center text-3xl font-mono font-bold py-6"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm-text-muted">
                  บาท
                </span>
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  onClick={() => setAmount(qa.toString())}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    amount === qa.toString()
                      ? 'bg-sm-accent text-white'
                      : 'bg-sm-surface-alt text-sm-text-muted hover:text-sm-text'
                  )}
                >
                  {qa.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-sm-text-muted mb-2 block">
                รายละเอียด
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น ข้าวมันไก่, ค่ารถ, เงินเดือน"
                className="input"
              />
            </div>

            {/* Account Selection */}
            <div>
              <label className="text-sm text-sm-text-muted mb-2 block">
                จ่ายด้วย
              </label>
              <div className="grid grid-cols-2 gap-2">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => setSelectedAccountId(account.id)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all text-left',
                      selectedAccountId === account.id
                        ? 'border-sm-accent bg-sm-accent/10'
                        : 'border-sm-border bg-sm-surface hover:border-sm-accent/50'
                    )}
                  >
                    <AccountIcon type={account.type} className="w-5 h-5 text-sm-accent" />
                    <p className="font-medium text-sm-text mt-1">
                      {account.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Month */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-sm-text-muted mb-2 block">
                  วันที่ทำรายการ
                </label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="text-sm text-sm-text-muted mb-2 block">
                  กระทบเดือน
                </label>
                <select
                  value={`${yearMonth.year}-${yearMonth.month}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split('-');
                    setYearMonth({ year: parseInt(y), month: parseInt(m) });
                  }}
                  className="input"
                >
                  {[-1, 0, 1, 2].map((offset) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + offset);
                    const y = d.getFullYear();
                    const m = d.getMonth() + 1;
                    return (
                      <option key={`${y}-${m}`} value={`${y}-${m}`}>
                        {THAI_MONTHS_SHORT[m]} {y + 543}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Installment Toggle */}
            {type === 'expense' && (
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm-text">ผ่อนชำระ</p>
                    <p className="text-sm text-sm-text-muted">
                      แบ่งจ่ายหลายเดือน
                    </p>
                  </div>
                  <button
                    onClick={() => setIsInstallment(!isInstallment)}
                    className={cn(
                      'w-14 h-8 rounded-full transition-colors relative',
                      isInstallment ? 'bg-sm-accent' : 'bg-sm-surface-alt'
                    )}
                  >
                    <motion.div
                      animate={{ x: isInstallment ? 24 : 4 }}
                      className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {isInstallment && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-sm-border">
                        <label className="text-sm text-sm-text-muted mb-2 block">
                          จำนวนงวด
                        </label>

                        {/* Preset buttons */}
                        <div className="flex gap-2 mb-3">
                          {[3, 6, 10, 12, 24].map((n) => (
                            <button
                              key={n}
                              onClick={() => setInstallmentTotal(n)}
                              className={cn(
                                'flex-1 py-2 rounded-lg font-medium transition-all',
                                installmentTotal === n
                                  ? 'bg-sm-warning text-sm-bg'
                                  : 'bg-sm-surface-alt text-sm-text-muted'
                              )}
                            >
                              {n}
                            </button>
                          ))}
                        </div>

                        {/* Custom input */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-sm-text-muted">หรือกรอกเอง:</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={2}
                            max={60}
                            value={installmentTotal}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 2;
                              setInstallmentTotal(Math.min(60, Math.max(2, val)));
                            }}
                            className="w-20 input text-center py-2 font-mono font-semibold"
                          />
                          <span className="text-sm text-sm-text-muted">งวด</span>
                        </div>

                        <p className="text-sm text-sm-warning mt-3 flex items-center gap-1">
                          <InformationCircleIcon className="w-4 h-4" />
                          ระบบจะสร้าง {installmentTotal} รายการ (งวดละ{' '}
                          {amount || '0'} บาท)
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!amount || !description || !selectedAccountId || submitting}
              className={cn(
                'w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2',
                amount && description && selectedAccountId
                  ? 'bg-sm-accent text-white hover:shadow-glow'
                  : 'bg-sm-surface-alt text-sm-text-muted cursor-not-allowed'
              )}
            >
              {submitting ? (
                <ArrowPathIcon className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <CheckIcon className="w-6 h-6" />
                  บันทึก
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CalculatorIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Transaction, transactionApi } from '@/lib/api';
import { formatMoney, getThaiMonth } from '@/lib/utils';

interface PartialPaymentModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSuccess: () => void;
}

export function PartialPaymentModal({
  transaction,
  onClose,
  onSuccess,
}: PartialPaymentModalProps) {
  const originalAmount = Math.abs(transaction.amount);
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [interestAmount, setInterestAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    remainingAmount: number;
    totalNextMonth: number;
    nextMonth: { year: number; month: number };
  } | null>(null);

  const paid = parseFloat(paidAmount) || 0;
  const interest = parseFloat(interestAmount) || 0;
  const remaining = originalAmount - paid;

  const isValid = paid > 0 && paid < originalAmount;

  // Calculate next month
  let nextMonth = transaction.postedMonth + 1;
  let nextYear = transaction.postedYear;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await transactionApi.partialPayment(
        transaction.id,
        paid,
        interest > 0 ? interest : undefined,
      );
      setResult({
        remainingAmount: res.remainingAmount,
        totalNextMonth: res.totalNextMonth,
        nextMonth: res.nextMonth,
      });
    } catch (error) {
      console.error('Failed to process partial payment:', error);
      alert('ไม่สามารถบันทึกได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (result) {
      onSuccess();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-sm-surface w-full max-w-md rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-sm-text flex items-center gap-2">
              <CalculatorIcon className="w-6 h-6 text-sm-accent" />
              จ่ายบางส่วน
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-sm-surface-alt transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-sm-text-muted" />
            </button>
          </div>

          {!result ? (
            <>
              {/* Original Transaction Info */}
              <div className="card bg-sm-surface-alt mb-4">
                <p className="text-sm text-sm-text-muted mb-1">รายการเดิม</p>
                <p className="font-medium text-sm-text">{transaction.description}</p>
                <p className="text-2xl font-bold text-sm-expense mt-2">
                  {formatMoney(originalAmount)} บาท
                </p>
                <p className="text-sm text-sm-text-muted mt-1">
                  {getThaiMonth(transaction.postedMonth)} {transaction.postedYear}
                </p>
              </div>

              {/* Paid Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-sm-text mb-2">
                  ยอดที่จ่ายจริง (บาท)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="0"
                  className="input text-right text-2xl font-bold"
                  autoFocus
                />
                {paid > 0 && paid >= originalAmount && (
                  <p className="text-sm text-sm-warning mt-1">
                    ต้องน้อยกว่ายอดเดิม ({formatMoney(originalAmount)})
                  </p>
                )}
              </div>

              {/* Interest Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-sm-text mb-2">
                  ดอกเบี้ย (บาท) - ถ้ามี
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={interestAmount}
                  onChange={(e) => setInterestAmount(e.target.value)}
                  placeholder="0"
                  className="input text-right text-lg"
                />
              </div>

              {/* Preview */}
              {isValid && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card bg-sm-accent/10 border border-sm-accent/30 mb-4"
                >
                  <p className="text-sm font-medium text-sm-text mb-3 flex items-center gap-2">
                    <ArrowRightIcon className="w-4 h-4" />
                    สรุปที่จะบันทึก
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-sm-text-muted">ยอดเดิม</span>
                      <span className="text-sm-text">{formatMoney(originalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm-text-muted">จ่ายแล้ว</span>
                      <span className="text-sm-income">-{formatMoney(paid)}</span>
                    </div>
                    <div className="flex justify-between border-t border-sm-border pt-2 mt-2">
                      <span className="text-sm-text-muted">ยอดค้าง</span>
                      <span className="font-bold text-sm-expense">{formatMoney(remaining)}</span>
                    </div>
                    {interest > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm-text-muted">ดอกเบี้ย</span>
                        <span className="text-sm-expense">+{formatMoney(interest)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-sm-border pt-2 mt-2">
                      <span className="font-medium text-sm-text">
                        ยอดเดือนถัดไป ({getThaiMonth(nextMonth)})
                      </span>
                      <span className="font-bold text-sm-expense">
                        {formatMoney(remaining + interest)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isValid || loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-pulse">กำลังบันทึก...</span>
                ) : (
                  <>
                    บันทึก
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          ) : (
            /* Success Result */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-sm-income/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sm-income" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-sm-text mb-2">บันทึกเรียบร้อย!</h3>
              
              <div className="card bg-sm-surface-alt mt-4 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sm-text-muted">ยอดค้างชำระ</span>
                    <span className="text-sm-expense">{formatMoney(result.remainingAmount)}</span>
                  </div>
                  {result.totalNextMonth > result.remainingAmount && (
                    <div className="flex justify-between">
                      <span className="text-sm-text-muted">รวมดอกเบี้ย</span>
                      <span className="text-sm-expense">
                        +{formatMoney(result.totalNextMonth - result.remainingAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-sm-border pt-2 mt-2">
                    <span className="font-medium text-sm-text">
                      ยอดใน {getThaiMonth(result.nextMonth.month)} {result.nextMonth.year}
                    </span>
                    <span className="font-bold text-sm-expense">
                      {formatMoney(result.totalNextMonth)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="btn-primary w-full mt-6"
              >
                ปิด
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


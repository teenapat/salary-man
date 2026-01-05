'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { formatMoney, cn } from '@/lib/utils';
import { TrashIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import type { Transaction } from '@/lib/api';

interface TransactionItemProps {
  transaction: Transaction;
  showAccount?: boolean;
  onClick?: () => void;
  onDelete?: (id: string, installmentGroupId?: string) => void;
  onPartialPayment?: () => void;
}

export function TransactionItem({
  transaction,
  showAccount = false,
  onClick,
  onDelete,
  onPartialPayment,
}: TransactionItemProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const isIncome = transaction.amount > 0;
  const isExpense = transaction.amount < 0;
  const hasInstallment =
    transaction.installmentIndex != null &&
    transaction.installmentTotal != null &&
    transaction.installmentTotal > 1;

  // Swipe gesture
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0],
    ['rgba(248, 113, 113, 0.3)', 'rgba(248, 113, 113, 0)']
  );
  const deleteIconOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) {
      setShowActionMenu(true);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(transaction.id, transaction.installmentGroupId || undefined);
    }
    setShowActionMenu(false);
  };

  return (
    <>
      <motion.div
        className="relative overflow-hidden"
        style={{ background }}
      >
        {/* Delete indicator (shows when swiping) */}
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm-expense"
          style={{ opacity: deleteIconOpacity }}
        >
          <TrashIcon className="w-5 h-5" />
          <span className="text-sm font-medium">ลบ</span>
        </motion.div>

        {/* Main content */}
        <motion.div
          drag={onDelete ? "x" : false}
          dragConstraints={{ left: -100, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x }}
          whileTap={{ scale: onDelete ? 1 : 0.98 }}
          onClick={onClick}
          className={cn(
            'flex items-center justify-between py-3 px-2 cursor-pointer relative bg-sm-surface',
            'border-b border-sm-border/30 last:border-0',
            'hover:bg-sm-surface-alt/50 transition-colors rounded-lg'
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm-text truncate">
                {transaction.description}
              </p>
              {hasInstallment && (
                <span className="badge-installment shrink-0">
                  {transaction.installmentIndex}/{transaction.installmentTotal}
                </span>
              )}
              {transaction.isCarryOver && (
                <span className="badge bg-sm-warning/20 text-sm-warning shrink-0">
                  ย้าย
                </span>
              )}
              {transaction.isPartiallyPaid && (
                <span className="badge bg-sm-income/20 text-sm-income shrink-0">
                  จ่ายแล้ว
                </span>
              )}
            </div>
            {showAccount && transaction.account && (
              <p className="text-sm text-sm-text-muted">
                {transaction.account.name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p
              className={cn(
                'font-mono font-semibold tabular-nums',
                isIncome ? 'text-sm-income' : 'text-sm-expense'
              )}
            >
              {isIncome && '+'}
              {formatMoney(transaction.amount)}
            </p>
            
            {/* Action button (visible on desktop) */}
            {(onDelete || onPartialPayment) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionMenu(true);
                }}
                className="p-2 rounded-lg hover:bg-sm-surface-alt transition-colors opacity-0 group-hover:opacity-100 md:opacity-50 hover:opacity-100"
              >
                <svg className="w-4 h-4 text-sm-text-muted" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Action Menu Modal */}
      {showActionMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50"
          onClick={() => setShowActionMenu(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-sm-surface rounded-2xl p-4 w-full max-w-sm border border-sm-border mb-4"
          >
            {/* Transaction Info */}
            <div className="text-center pb-4 border-b border-sm-border mb-3">
              <p className="font-semibold text-sm-text">{transaction.description}</p>
              <p className={cn(
                "text-lg font-mono font-bold mt-1",
                isIncome ? 'text-sm-income' : 'text-sm-expense'
              )}>
                {isIncome && '+'}{formatMoney(transaction.amount)} บาท
              </p>
              {hasInstallment && (
                <p className="text-sm text-sm-text-muted mt-1">
                  งวดที่ {transaction.installmentIndex}/{transaction.installmentTotal}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              {/* Partial Payment Option - only for expenses that haven't been partially paid */}
              {onPartialPayment && isExpense && !transaction.isPartiallyPaid && (
                <button
                  onClick={() => {
                    setShowActionMenu(false);
                    onPartialPayment();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sm-accent/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-sm-accent/20 flex items-center justify-center">
                    <CreditCardIcon className="w-5 h-5 text-sm-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm-text">จ่ายบางส่วน</p>
                    <p className="text-sm text-sm-text-muted">
                      จ่ายบางส่วน ยอดที่เหลือไปเดือนหน้า
                    </p>
                  </div>
                </button>
              )}

              {/* Show badge if already partially paid */}
              {transaction.isPartiallyPaid && (
                <div className="w-full flex items-center gap-3 p-3 rounded-xl bg-sm-surface-alt text-left">
                  <div className="w-10 h-10 rounded-full bg-sm-income/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-sm-income" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm-income">จ่ายบางส่วนแล้ว</p>
                    <p className="text-sm text-sm-text-muted">
                      ยอดค้างถูกย้ายไปเดือนถัดไปแล้ว
                    </p>
                  </div>
                </div>
              )}

              {/* Delete Options */}
              {onDelete && (
                <>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sm-expense/10 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-sm-expense/20 flex items-center justify-center">
                      <TrashIcon className="w-5 h-5 text-sm-expense" />
                    </div>
                    <div>
                      <p className="font-medium text-sm-expense">
                        {hasInstallment ? 'ลบเฉพาะงวดนี้' : 'ลบรายการ'}
                      </p>
                      <p className="text-sm text-sm-text-muted">
                        ลบรายการนี้ออกจากระบบ
                      </p>
                    </div>
                  </button>

                  {hasInstallment && transaction.installmentGroupId && (
                    <button
                      onClick={() => {
                        if (onDelete && transaction.installmentGroupId) {
                          onDelete(transaction.id, transaction.installmentGroupId);
                        }
                        setShowActionMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sm-expense/10 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-sm-expense/20 flex items-center justify-center">
                        <TrashIcon className="w-5 h-5 text-sm-expense" />
                      </div>
                      <div>
                        <p className="font-medium text-sm-expense">ลบทั้ง {transaction.installmentTotal} งวด</p>
                        <p className="text-sm text-sm-text-muted">
                          ลบรายการผ่อนทั้งหมด
                        </p>
                      </div>
                    </button>
                  )}
                </>
              )}

              {/* Cancel */}
              <button
                onClick={() => setShowActionMenu(false)}
                className="w-full p-3 rounded-xl bg-sm-surface-alt text-sm-text-muted text-center font-medium mt-2"
              >
                ยกเลิก
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

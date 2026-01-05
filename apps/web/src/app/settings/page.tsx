'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/lib/auth';
import { accountApi, type Account } from '@/lib/api';
import { AccountIcon } from '@/components/AccountCard';
import {
  Cog6ToothIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

const ACCOUNT_TYPES = [
  { value: 'CREDIT_CARD', label: 'บัตรเครดิต', icon: CreditCardIcon },
  { value: 'CASH', label: 'เงินสด', icon: BanknotesIcon },
  { value: 'BANK_ACCOUNT', label: 'บัญชีธนาคาร', icon: BuildingLibraryIcon },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null);

  const fetchAccounts = async () => {
    try {
      const data = await accountApi.getAll();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (account: Account) => {
    try {
      await accountApi.delete(account.id);
      setDeleteConfirm(null);
      fetchAccounts();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('ไม่สามารถลบได้');
    }
  };

  return (
    <main className="pb-24 min-h-screen gradient-radial">
      <div className="max-w-lg mx-auto px-4 safe-top">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-sm-text flex items-center gap-2">
            <Cog6ToothIcon className="w-7 h-7 text-sm-accent" />
            ตั้งค่า
          </h1>
        </div>

        {/* User Profile */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6"
          >
            <div className="flex items-center gap-4">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-14 h-14 rounded-full"
                />
              ) : (
                <UserCircleIcon className="w-14 h-14 text-sm-text-muted" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm-text">{user.name}</p>
                <p className="text-sm text-sm-text-muted">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-4 w-full btn-secondary flex items-center justify-center gap-2 text-sm-expense"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              ออกจากระบบ
            </button>
          </motion.div>
        )}

        {/* Accounts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-sm-text">
              บัญชี & บัตร
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-sm flex items-center gap-1 py-2 px-3"
            >
              <PlusIcon className="w-4 h-4" />
              เพิ่ม
            </button>
          </div>

          <div className="space-y-2">
            {accounts
              .filter((acc) => acc.type !== 'CARRY_OVER')
              .map((account) => (
                <motion.div
                  key={account.id}
                  layout
                  className="card flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-sm-surface-alt flex items-center justify-center">
                    <AccountIcon
                      type={account.type}
                      className="w-6 h-6 text-sm-text"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm-text">{account.name}</p>
                    <p className="text-sm text-sm-text-muted">
                      {ACCOUNT_TYPES.find((t) => t.value === account.type)
                        ?.label || account.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingAccount(account)}
                      className="p-2 rounded-lg hover:bg-sm-surface-alt transition-colors"
                    >
                      <PencilIcon className="w-5 h-5 text-sm-text-muted" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(account)}
                      className="p-2 rounded-lg hover:bg-sm-expense/20 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5 text-sm-expense" />
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>

          {accounts.filter((acc) => acc.type !== 'CARRY_OVER').length === 0 &&
            !loading && (
              <div className="text-center py-8 text-sm-text-muted">
                ยังไม่มีบัญชี กดปุ่ม "เพิ่ม" เพื่อสร้าง
              </div>
            )}
        </motion.div>
      </div>

      <BottomNav />

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingAccount) && (
          <AccountModal
            account={editingAccount}
            onClose={() => {
              setShowAddModal(false);
              setEditingAccount(null);
            }}
            onSuccess={() => {
              setShowAddModal(false);
              setEditingAccount(null);
              fetchAccounts();
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-sm-expense/20 flex items-center justify-center">
                  <TrashIcon className="w-6 h-6 text-sm-expense" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm-text">ลบบัญชี?</h3>
                  <p className="text-sm text-sm-text-muted">
                    {deleteConfirm.name}
                  </p>
                </div>
              </div>
              <p className="text-sm text-sm-text-muted mb-4">
                หากมีรายการในบัญชีนี้ จะถูกซ่อนแทนการลบถาวร
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 btn bg-sm-expense text-white"
                >
                  ลบ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Account Add/Edit Modal Component
function AccountModal({
  account,
  onClose,
  onSuccess,
}: {
  account: Account | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(account?.name || '');
  const [type, setType] = useState(account?.type || 'CREDIT_CARD');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('กรุณากรอกชื่อบัญชี');
      return;
    }

    setLoading(true);
    try {
      if (account) {
        await accountApi.update(account.id, { name, type });
      } else {
        await accountApi.create({ name, type });
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save:', err);
      alert('ไม่สามารถบันทึกได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-sm-surface w-full max-w-md rounded-t-3xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-sm-text">
            {account ? 'แก้ไขบัญชี' : 'เพิ่มบัญชี'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sm-surface-alt"
          >
            <XMarkIcon className="w-6 h-6 text-sm-text-muted" />
          </button>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-sm-text mb-2">
            ชื่อบัญชี
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น KTC, กสิกร"
            className="input"
            autoFocus
          />
        </div>

        {/* Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-sm-text mb-2">
            ประเภท
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ACCOUNT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`p-3 rounded-xl border-2 transition-colors ${
                  type === t.value
                    ? 'border-sm-accent bg-sm-accent/10'
                    : 'border-sm-border hover:border-sm-accent/50'
                }`}
              >
                <t.icon
                  className={`w-6 h-6 mx-auto mb-1 ${
                    type === t.value ? 'text-sm-accent' : 'text-sm-text-muted'
                  }`}
                />
                <p
                  className={`text-xs ${
                    type === t.value ? 'text-sm-accent' : 'text-sm-text-muted'
                  }`}
                >
                  {t.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </motion.div>
    </motion.div>
  );
}


'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import {
  BanknotesIcon,
  ChartBarIcon,
  CreditCardIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sm-bg">
        <div className="animate-pulse text-sm-text">Loading...</div>
      </div>
    );
  }

  const features = [
    { icon: ChartBarIcon, text: 'ดูสรุปรายรับรายจ่าย' },
    { icon: CreditCardIcon, text: 'จัดการบัตรเครดิตหลายใบ' },
    { icon: CalendarDaysIcon, text: 'ติดตามการผ่อนชำระ' },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-sm-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sm-accent to-purple-600 flex items-center justify-center"
          >
            <BanknotesIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-sm-text">
            Salary Man
          </h1>
          <p className="text-sm-text-muted mt-2">
            จัดการรายรับรายจ่ายง่ายๆ
          </p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-sm-text mb-4 text-center">
            เข้าสู่ระบบ
          </h2>

          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors border border-gray-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-sm-text-muted text-center mt-4">
            เข้าสู่ระบบเพื่อซิงค์ข้อมูลข้ามอุปกรณ์
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-3"
        >
          {features.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-sm text-sm-text-muted"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}

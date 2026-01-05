'use client';

import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatThaiMonth, getPreviousMonth, getNextMonth } from '@/lib/utils';

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const handlePrev = () => {
    const prev = getPreviousMonth(year, month);
    onChange(prev.year, prev.month);
  };

  const handleNext = () => {
    const next = getNextMonth(year, month);
    onChange(next.year, next.month);
  };

  return (
    <div className="flex items-center justify-between py-4">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handlePrev}
        className="p-2 rounded-xl hover:bg-sm-surface-alt transition-colors"
      >
        <ChevronLeftIcon className="w-6 h-6 text-sm-text-muted" />
      </motion.button>

      <motion.h2
        key={`${year}-${month}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-display font-semibold text-sm-text"
      >
        {formatThaiMonth(year, month)}
      </motion.h2>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleNext}
        className="p-2 rounded-xl hover:bg-sm-surface-alt transition-colors"
      >
        <ChevronRightIcon className="w-6 h-6 text-sm-text-muted" />
      </motion.button>
    </div>
  );
}


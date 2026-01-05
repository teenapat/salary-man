'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  showAddButton?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  showAddButton = true,
}: EmptyStateProps) {
  const defaultIcon = <DocumentTextIcon className="w-16 h-16 text-sm-text-muted" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="mb-4"
      >
        {icon || defaultIcon}
      </motion.div>
      <h3 className="text-lg font-semibold text-sm-text mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-sm-text-muted mb-6 max-w-xs">{description}</p>
      )}
      {showAddButton && (
        <Link href="/add" className="btn-primary">
          เพิ่มรายการ
        </Link>
      )}
    </motion.div>
  );
}

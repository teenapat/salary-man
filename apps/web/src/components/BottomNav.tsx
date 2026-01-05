'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  CreditCardIcon,
  ClockIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  ClockIcon as ClockIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid';

const navItems = [
  { href: '/', label: 'สรุป', icon: HomeIcon, activeIcon: HomeIconSolid },
  { href: '/accounts', label: 'บัตร', icon: CreditCardIcon, activeIcon: CreditCardIconSolid },
  { href: '/add', label: '', icon: PlusCircleIcon, activeIcon: PlusCircleIcon, isAdd: true },
  { href: '/timeline', label: 'รายการ', icon: ClockIcon, activeIcon: ClockIconSolid },
  { href: '/settings', label: 'ตั้งค่า', icon: Cog6ToothIcon, activeIcon: Cog6ToothIconSolid },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-sm-border/30 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;

          if (item.isAdd) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-6"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-sm-accent to-sm-card flex items-center justify-center shadow-glow"
                >
                  <PlusCircleIcon className="w-8 h-8 text-white" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 transition-colors',
                isActive ? 'text-sm-accent' : 'text-sm-text-muted'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 w-10 h-0.5 bg-sm-accent rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

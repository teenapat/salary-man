import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMoney(amount: number): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absAmount);
  
  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatMoneyWithSign(amount: number): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absAmount);
  
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export const THAI_MONTHS = [
  '',
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  '',
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export function formatThaiDate(date: Date | string): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth() + 1];
  const year = d.getFullYear() + 543; // Buddhist Era
  return `${day} ${month} ${year}`;
}

export function formatThaiMonth(year: number, month: number): string {
  return `${THAI_MONTHS[month]} ${year + 543}`;
}

export function getThaiMonth(month: number): string {
  return THAI_MONTHS[month] || '';
}

export function formatShortThaiMonth(year: number, month: number): string {
  return `${THAI_MONTHS_SHORT[month]} ${(year + 543).toString().slice(-2)}`;
}

export function getCurrentYearMonth() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

export function getPreviousMonth(year: number, month: number) {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

export function getNextMonth(year: number, month: number) {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

export function getAccountTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    CASH: 'เงินสด',
    CREDIT_CARD: 'บัตรเครดิต',
    BANK_ACCOUNT: 'บัญชีธนาคาร',
    CARRY_OVER: 'ย้ายยอด',
  };
  return labels[type] || type;
}

// Account icon types for Heroicons mapping
export type AccountIconType = 'CASH' | 'CREDIT_CARD' | 'BANK_ACCOUNT' | 'CARRY_OVER';


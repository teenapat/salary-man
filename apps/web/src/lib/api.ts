const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types
export interface Account {
  id: string;
  name: string;
  type: 'CASH' | 'CREDIT_CARD' | 'BANK_ACCOUNT' | 'CARRY_OVER';
  isActive: boolean;
  sortOrder: number;
}

export interface Transaction {
  id: string;
  txDate: string;
  postedYear: number;
  postedMonth: number;
  amount: number;
  description: string;
  accountId: string;
  account?: Account;
  installmentGroupId?: string;
  installmentIndex?: number;
  installmentTotal?: number;
  isCarryOver: boolean;
  isPartiallyPaid?: boolean;
}

export interface MonthlySummary {
  year: number;
  month: number;
  income: number;
  expense: number;
  net: number;
  hasCarriedOver: boolean;
}

export interface AccountSummary {
  accountId: string;
  accountName: string;
  accountType: string;
  year: number;
  month: number;
  total: number;
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    installmentIndex?: number;
    installmentTotal?: number;
    installmentGroupId?: string;
    isPartiallyPaid?: boolean;
  }>;
}

// Helper function for API calls
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Send cookies with requests
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Account API
export const accountApi = {
  getAll: () => fetchAPI<Account[]>('/accounts'),
  getOne: (id: string) => fetchAPI<Account>(`/accounts/${id}`),
  create: (data: Partial<Account>) =>
    fetchAPI<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Account>) =>
    fetchAPI<Account>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<Account>(`/accounts/${id}`, { method: 'DELETE' }),
  seed: () =>
    fetchAPI<{ message: string; count: number }>('/accounts/seed', {
      method: 'POST',
    }),
};

// Transaction API
export const transactionApi = {
  getAll: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    return fetchAPI<Transaction[]>(`/transactions?${params}`);
  },
  getByAccount: (accountId: string, year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    return fetchAPI<Transaction[]>(`/transactions/account/${accountId}?${params}`);
  },
  getTimeline: (startDate: string, endDate: string) =>
    fetchAPI<Transaction[]>(
      `/transactions/timeline?startDate=${startDate}&endDate=${endDate}`
    ),
  getOne: (id: string) => fetchAPI<Transaction>(`/transactions/${id}`),
  create: (data: {
    txDate: string;
    postedYear: number;
    postedMonth: number;
    amount: number;
    description: string;
    accountId: string;
  }) =>
    fetchAPI<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createInstallment: (data: {
    txDate: string;
    postedYear: number;
    postedMonth: number;
    amount: number;
    description: string;
    accountId: string;
    installmentTotal: number;
  }) =>
    fetchAPI<Transaction[]>('/transactions/installment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  carryOver: (fromYear: number, fromMonth: number, amount: number) =>
    fetchAPI<Transaction>('/transactions/carry-over', {
      method: 'POST',
      body: JSON.stringify({ fromYear, fromMonth, amount }),
    }),
  update: (id: string, data: Partial<Transaction>) =>
    fetchAPI<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI<void>(`/transactions/${id}`, { method: 'DELETE' }),
  deleteInstallmentGroup: (groupId: string) =>
    fetchAPI<void>(`/transactions/installment-group/${groupId}`, {
      method: 'DELETE',
    }),
  partialPayment: (transactionId: string, paidAmount: number, interestAmount?: number) =>
    fetchAPI<{
      originalAmount: number;
      paidAmount: number;
      remainingAmount: number;
      interestAmount: number;
      totalNextMonth: number;
      nextMonth: { year: number; month: number };
    }>('/transactions/partial-payment', {
      method: 'POST',
      body: JSON.stringify({ transactionId, paidAmount, interestAmount }),
    }),
};

// Summary API
export const summaryApi = {
  getMonthly: (year: number, month: number) =>
    fetchAPI<MonthlySummary>(`/summary/month/${year}/${month}`),
  getYear: (year: number) =>
    fetchAPI<MonthlySummary[]>(`/summary/year/${year}`),
  getAccount: (accountId: string, year: number, month: number) =>
    fetchAPI<AccountSummary>(`/summary/account/${accountId}/${year}/${month}`),
  getAllAccounts: (year: number, month: number) =>
    fetchAPI<AccountSummary[]>(`/summary/accounts/${year}/${month}`),
  getUpcomingInstallments: (months?: number) =>
    fetchAPI<any[]>(`/summary/installments/upcoming?months=${months || 6}`),
};


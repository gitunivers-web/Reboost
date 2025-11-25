import { useQuery } from '@tanstack/react-query';

export interface DashboardData {
  balance: {
    currentBalance: number;
    activeLoansCount: number;
    totalBorrowed: number;
    availableCredit: number;
    lastUpdated: string;
  };
  loans: Array<{
    id: string;
    loanReference: string;
    amount: number;
    interestRate: number;
    nextPaymentDate: string | null;
    totalRepaid: number;
    status: string;
    contractStatus?: string | null;
    contractUrl?: string | null;
    signedContractUrl?: string | null;
  }>;
  transfers: Array<{
    id: string;
    transferReference: string;
    amount: number;
    recipient: string;
    status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'completed';
    currentStep: number;
    updatedAt: string;
  }>;
  fees: Array<{
    id: string;
    feeType: string;
    reason: string;
    amount: number;
    createdAt: string | null;
    category: 'loan' | 'transfer' | 'account';
  }>;
  borrowingCapacity: {
    maxCapacity: number;
    currentCapacity: number;
  };
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });
}

export function useAvailableFundsChart() {
  return useQuery<Array<{
    month: string;
    available: number;
    committed: number;
    reserved: number;
  }>>({
    queryKey: ['/api/charts/available-funds'],
  });
}

export function useUpcomingRepaymentsChart() {
  return useQuery<Array<{
    month: string;
    loan1: number;
    loan2: number;
    loan3: number;
  }>>({
    queryKey: ['/api/charts/upcoming-repayments'],
  });
}

import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { isProtectedRoute } from '@/lib/route-utils';

export interface UserStats {
  tier: string;
  completedLoans: number;
  activeLoans: number;
  maxActiveLoans: number;
  defaultedLoans: number;
}

export function useUserStats() {
  const [location] = useLocation();
  const [queryEnabled, setQueryEnabled] = useState(false);

  useEffect(() => {
    setQueryEnabled(isProtectedRoute(location));
  }, [location]);

  const query = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    enabled: queryEnabled,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  return query;
}

import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import type { User } from '@shared/schema';
import { queryClient, getApiUrl } from '@/lib/queryClient';
import { isProtectedRoute } from '@/lib/route-utils';
import { io } from 'socket.io-client';

export function useUser() {
  const [location] = useLocation();
  const [queryEnabled, setQueryEnabled] = useState(false);

  useEffect(() => {
    setQueryEnabled(isProtectedRoute(location));
  }, [location]);

  const query = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: queryEnabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Listen to real-time user updates via socket
  useEffect(() => {
    if (!queryEnabled) return;

    const socket = io();
    
    const handleDataUpdate = (event: any) => {
      if (event.type === 'user' && event.action === 'updated') {
        // Invalidate the user query to refetch it
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      }
    };

    socket.on('data:update', handleDataUpdate);

    return () => {
      socket.off('data:update', handleDataUpdate);
      socket.disconnect();
    };
  }, [queryEnabled]);

  return query;
}

export function useUserProfilePhotoUrl(): string | null {
  const { data: user } = useUser();
  
  if (!user?.profilePhoto) {
    console.log('[useUserProfilePhotoUrl] No profile photo in user data:', user);
    return null;
  }

  const queryState = queryClient.getQueryState(['/api/user']);
  const timestamp = queryState?.dataUpdatedAt || Date.now();
  
  const isFullUrl = user.profilePhoto.startsWith('http://') || user.profilePhoto.startsWith('https://');
  const photoUrl = isFullUrl 
    ? `${user.profilePhoto}?t=${timestamp}`
    : `${getApiUrl(user.profilePhoto)}?t=${timestamp}`;
  
  console.log('[useUserProfilePhotoUrl]', {
    profilePhoto: user.profilePhoto,
    isFullUrl,
    timestamp,
    finalUrl: photoUrl,
  });
  
  return photoUrl;
}

export function getUserInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAccountTypeLabel(accountType: string): string {
  const labels: Record<string, string> = {
    individual: 'Particulier',
    business: 'Entreprise',
  };
  return labels[accountType] || accountType;
}

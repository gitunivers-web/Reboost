import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Upload, User } from 'lucide-react';
import { useUser, getUserInitials, useUserProfilePhotoUrl } from '@/hooks/use-user';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { queryClient, getApiUrl } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/lib/i18n';

export default function UserProfileHeader() {
  const { data: user } = useUser();
  const profilePhotoUrl = useUserProfilePhotoUrl();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const t = useTranslations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = () => {
    setLocation('/');
  };

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const csrfToken = await fetch(getApiUrl('/api/csrf-token'), {
        credentials: 'include',
      }).then((res) => res.json()).then((data) => data.csrfToken);

      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await fetch(getApiUrl('/api/user/profile-photo'), {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t.messages.errorUploadingAvatar);
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: t.messages.avatarUpdated,
        description: t.messages.avatarUpdatedDesc,
      });
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast({
        title: t.common.error,
        description: error.message,
        variant: 'destructive',
      });
      setIsUploading(false);
    },
  });

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t.common.error,
          description: t.messages.fileTooLarge,
          variant: 'destructive',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: t.common.error,
          description: t.messages.invalidFileType,
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);
      uploadPhotoMutation.mutate(file);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3" data-testid="user-profile-header">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-profile-photo"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-12 w-12 rounded-full p-0"
            data-testid="button-profile-menu"
          >
            <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800">
              {profilePhotoUrl ? (
                <AvatarImage src={profilePhotoUrl} alt={user.fullName} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold">
                {getUserInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-10 w-10">
              {profilePhotoUrl ? (
                <AvatarImage src={profilePhotoUrl} alt={user.fullName} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                {getUserInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" data-testid="text-user-name">
                {user.fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
                {user.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handlePhotoClick}
            disabled={isUploading}
            data-testid="button-change-photo"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? t.settings.uploading : t.settings.changePhoto}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation('/settings')} data-testid="button-settings">
            <User className="mr-2 h-4 w-4" />
            {t.nav.settings}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="button-logout">
            <LogOut className="mr-2 h-4 w-4" />
            {t.nav.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

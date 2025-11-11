import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Shield, Palette, Camera, Mail, Phone, Building2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, useTranslations } from '@/lib/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useUser, getUserInitials, useUserProfilePhotoUrl } from '@/hooks/use-user';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient, getApiUrl } from '@/lib/queryClient';
import type { User as UserType } from '@shared/schema';
import { UserLayout } from '@/components/UserLayout';
import { Skeleton } from '@/components/ui/skeleton';

export default function Settings() {
  const { toast } = useToast();
  const t = useTranslations();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { data: user, isLoading } = useUser();
  const profilePhotoUrl = useUserProfilePhotoUrl();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    transferUpdates: true,
    loanReminders: true,
    marketingEmails: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.companyName || '',
      });
      setNotifications({
        emailAlerts: user.notificationEmailAlerts ?? true,
        transferUpdates: user.notificationTransferUpdates ?? true,
        loanReminders: user.notificationLoanReminders ?? true,
        marketingEmails: user.notificationMarketingEmails ?? false,
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserType>) => {
      const response = await apiRequest('PATCH', '/api/user/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: t.messages.profileUpdated,
        description: t.messages.profileUpdatedDesc,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: error.message || t.messages.errorUpdatingProfile,
      });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: {
      notificationEmailAlerts?: boolean;
      notificationTransferUpdates?: boolean;
      notificationLoanReminders?: boolean;
      notificationMarketingEmails?: boolean;
    }) => {
      const response = await apiRequest('PATCH', '/api/user/notifications', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: t.messages.preferencesUpdated,
        description: t.messages.preferencesUpdatedDesc,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: error.message || t.messages.errorUpdatingPreferences,
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const response = await apiRequest('POST', '/api/user/change-password', data);
      return response.json();
    },
    onSuccess: () => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast({
        title: t.messages.passwordChanged,
        description: t.messages.passwordChangedDesc,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: error.message || t.messages.errorChangingPassword,
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleSaveNotifications = () => {
    updateNotificationsMutation.mutate({
      notificationEmailAlerts: notifications.emailAlerts,
      notificationTransferUpdates: notifications.transferUpdates,
      notificationLoanReminders: notifications.loanReminders,
      notificationMarketingEmails: notifications.marketingEmails,
    });
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.messages.passwordMismatch,
      });
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.messages.invalidFileType,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.messages.fileTooLarge,
      });
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const csrfToken = await fetch(getApiUrl('/api/csrf-token'), {
        credentials: 'include',
      }).then((res) => res.json()).then((data) => data.csrfToken);

      const response = await fetch(getApiUrl('/api/user/profile-photo'), {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(t.messages.errorUploadingAvatar);
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      await queryClient.refetchQueries({ queryKey: ['/api/user'] });
      
      toast({
        title: t.messages.avatarUpdated,
        description: t.messages.avatarUpdatedDesc,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.messages.errorUploadingAvatar,
      });
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  if (isLoading || !user) {
    return (
      <UserLayout
        title={t.settings.title}
        description=""
      >
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout
      title={t.settings.title}
      description=""
      maxWidth="6xl"
    >
      <div className="w-full overflow-x-hidden">
      <Card className="mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-border">
                {profilePhotoUrl ? (
                  <AvatarImage src={profilePhotoUrl} alt="Profile" />
                ) : null}
                <AvatarFallback className="text-2xl font-semibold">
                  {getUserInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
                data-testid="input-avatar-upload"
              />
              <Button 
                size="icon"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                data-testid="button-change-avatar"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 space-y-2 w-full md:w-auto overflow-hidden">
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold truncate">
                  {user.fullName}
                </h2>
                {user.kycStatus === 'approved' && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {t.settings.verified}
                  </div>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {user.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </span>
                )}
                {user.companyName && (
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {user.companyName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6 w-full">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex h-12 min-w-full sm:min-w-0 sm:w-auto items-center justify-start sm:justify-center rounded-md bg-muted p-1 shadow-sm">
            <TabsTrigger 
              value="profile" 
              className="gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex-shrink-0 px-3" 
              data-testid="tab-profile"
            >
              <User className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.settings.profile}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex-shrink-0 px-3" 
              data-testid="tab-notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.settings.notifications}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex-shrink-0 px-3" 
              data-testid="tab-security"
            >
              <Shield className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.settings.security}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="gap-2 rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex-shrink-0 px-3" 
              data-testid="tab-appearance"
            >
              <Palette className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.settings.appearance}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <CardTitle>{t.settings.personalInfo}</CardTitle>
              </div>
              <CardDescription>
                {t.settings.updateInfo}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t.settings.fullName}</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    data-testid="input-full-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.settings.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.settings.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">{t.settings.company}</Label>
                  <Input
                    id="company"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                    data-testid="input-company"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? t.common.saving : t.settings.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.settings.accountType}</CardTitle>
              <CardDescription>
                {t.settings.yourAccountType} {user.accountType === 'business' ? t.settings.businessAccount : t.settings.individualAccount}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                <div className="space-y-1">
                  <p className="font-medium">
                    {user.accountType === 'business' ? t.settings.businessAccount : t.settings.individualAccount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.accountType === 'business' 
                      ? t.settings.businessAccess
                      : t.settings.individualAccess}
                  </p>
                </div>
                <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {user.status === 'active' ? t.common.active : user.status === 'pending' ? t.common.pending : user.status}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <CardTitle>{t.settings.notificationPreferences}</CardTitle>
              </div>
              <CardDescription>
                {t.settings.chooseNotifications}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-md hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="emailAlerts" className="text-base font-medium cursor-pointer">{t.settings.emailAlerts}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.emailAlertsDesc}
                  </p>
                </div>
                <Switch
                  id="emailAlerts"
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailAlerts: checked })
                  }
                  data-testid="switch-email-alerts"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4 rounded-md hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="transferUpdates" className="text-base font-medium cursor-pointer">{t.settings.transferUpdates}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.transferUpdatesDesc}
                  </p>
                </div>
                <Switch
                  id="transferUpdates"
                  checked={notifications.transferUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, transferUpdates: checked })
                  }
                  data-testid="switch-transfer-updates"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4 rounded-md hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="loanReminders" className="text-base font-medium cursor-pointer">{t.settings.loanReminders}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.loanRemindersDesc}
                  </p>
                </div>
                <Switch
                  id="loanReminders"
                  checked={notifications.loanReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, loanReminders: checked })
                  }
                  data-testid="switch-loan-reminders"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4 rounded-md hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="marketingEmails" className="text-base font-medium cursor-pointer">{t.settings.marketingEmails}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t.settings.marketingEmailsDesc}
                  </p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, marketingEmails: checked })
                  }
                  data-testid="switch-marketing-emails"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveNotifications}
                  disabled={updateNotificationsMutation.isPending}
                  data-testid="button-save-notifications"
                >
                  {updateNotificationsMutation.isPending ? t.common.saving : t.settings.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle>{t.settings.changePassword}</CardTitle>
              </div>
              <CardDescription>
                {t.settings.updatePassword}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t.settings.currentPassword}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t.settings.newPassword}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.settings.confirmNewPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  data-testid="input-confirm-password"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  data-testid="button-change-password"
                >
                  {changePasswordMutation.isPending ? t.common.saving : t.settings.changePassword}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle>{t.settings.twoFactorAuth}</CardTitle>
              </div>
              <CardDescription>
                {t.settings.twoFactorAuthDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <p className="font-medium">
                      {user?.twoFactorEnabled ? t.settings.twoFactorEnabled : t.settings.enable2FA}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user?.twoFactorEnabled 
                        ? t.settings.twoFactorEnabledDesc
                        : t.settings.twoFactorDisabledDesc}
                    </p>
                  </div>
                  {user?.twoFactorEnabled ? (
                    <Button 
                      variant="outline" 
                      data-testid="button-disable-2fa"
                      onClick={async () => {
                        try {
                          await apiRequest('POST', '/api/2fa/disable');
                          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                          toast({
                            title: t.settings.disable2FASuccess,
                            description: t.settings.disable2FASuccessDesc,
                          });
                        } catch (error: any) {
                          toast({
                            title: t.common.error,
                            description: error.message || t.settings.disable2FAError,
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      {t.settings.disable}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      data-testid="button-enable-2fa"
                      onClick={() => window.location.href = '/security/2fa'}
                    >
                      {t.settings.configure}
                    </Button>
                  )}
                </div>
                {user?.twoFactorEnabled && (
                  <div 
                    className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-md"
                    role="status"
                  >
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500 text-white">
                      {t.settings.enabled}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.twoFactorActiveMessage}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Palette className="h-5 w-4" />
                </div>
                <CardTitle>{t.settings.theme}</CardTitle>
              </div>
              <CardDescription>
                {t.settings.themeDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', name: t.settings.light },
                  { value: 'dark', name: t.settings.dark },
                  { value: 'system', name: language === 'fr' ? 'Système' : 'System' },
                ].map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => setTheme(themeOption.value as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-md border-2 transition-all hover-elevate active-elevate-2 ${
                      theme === themeOption.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                    data-testid={`button-theme-${themeOption.value}`}
                  >
                    <span className="font-medium text-sm">{themeOption.name}</span>
                    {theme === themeOption.value && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.settings.languageLabel}</CardTitle>
              <CardDescription>
                {t.settings.languageDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { code: 'fr', name: 'Français' },
                  { code: 'en', name: 'English' },
                  { code: 'es', name: 'Español' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-md border-2 transition-all hover-elevate active-elevate-2 ${
                      language === lang.code
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                    data-testid={`button-lang-${lang.code}`}
                  >
                    <span className="font-medium text-sm">{lang.name}</span>
                    {language === lang.code && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </UserLayout>
  );
}

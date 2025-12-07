import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Shield, Palette, Camera, Mail, Phone, Building2, CheckCircle2, Loader2, KeyRound, QrCode, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, useTranslations } from '@/lib/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useUser, getUserInitials, useUserProfilePhotoUrl } from '@/hooks/use-user';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient, getApiUrl } from '@/lib/queryClient';
import type { User as UserType } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionTitle, GlassPanel, DashboardCard, GradientButton } from '@/components/fintech';

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

  const [twoFactorData, setTwoFactorData] = useState({
    qrCode: '',
    secret: '',
    verificationCode: '',
    showSetup: false,
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
        title: t.settingsMessages.profileUpdated,
        description: t.settingsMessages.profileUpdatedDesc,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: error.message || t.settingsMessages.errorUpdatingProfile,
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
        title: t.settingsMessages.preferencesUpdated,
        description: t.settingsMessages.preferencesUpdatedDesc,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: error.message || t.settingsMessages.errorUpdatingPreferences,
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
        title: t.settingsMessages.passwordChanged,
        description: t.settingsMessages.passwordChangedDesc,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: error.message || t.settingsMessages.errorChangingPassword,
      });
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/2fa/setup', {});
      return response.json();
    },
    onSuccess: (data) => {
      setTwoFactorData({
        ...twoFactorData,
        qrCode: data.qrCode,
        secret: data.secret,
        showSetup: true,
        verificationCode: '',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: error.message || t.twoFactorAuth.setup.errorMessage,
      });
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/2fa/verify', { token: code, secret: twoFactorData.secret });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setTwoFactorData({
        qrCode: '',
        secret: '',
        verificationCode: '',
        showSetup: false,
      });
      toast({
        title: t.twoFactorAuth.settings.enabled,
        description: t.twoFactorAuth.settings.enabledMessage,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: error.message || t.twoFactorAuth.settings.invalidCode,
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/2fa/disable', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: t.twoFactorAuth.settings.disabled,
        description: t.twoFactorAuth.settings.disabledMessage,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: error.message || t.twoFactorAuth.disable.errorMessage,
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
        description: t.settingsMessages.passwordMismatch,
      });
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  const handleSetup2FA = () => {
    setup2FAMutation.mutate();
  };

  const handleVerify2FA = () => {
    if (!twoFactorData.verificationCode || twoFactorData.verificationCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.twoFactorAuth.setup.errorMessage,
      });
      return;
    }
    verify2FAMutation.mutate(twoFactorData.verificationCode);
  };

  const handleDisable2FA = () => {
    disable2FAMutation.mutate();
  };

  const handleCancel2FASetup = () => {
    setTwoFactorData({
      qrCode: '',
      secret: '',
      verificationCode: '',
      showSetup: false,
    });
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
        description: t.settingsMessages.invalidFileType,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.settingsMessages.fileTooLarge,
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
        throw new Error(t.settingsMessages.errorUploadingAvatar);
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      await queryClient.refetchQueries({ queryKey: ['/api/user'] });
      
      toast({
        title: t.settingsMessages.avatarUpdated,
        description: t.settingsMessages.avatarUpdatedDesc,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.settingsMessages.errorUploadingAvatar,
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
      <div className="p-6 md:p-8 space-y-8">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <SectionTitle
        title={t.settings.title}
        subtitle={t.settings.subtitle}
      />

      <GlassPanel intensity="medium" className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-70 blur group-hover:opacity-100 transition duration-300" />
              <Avatar className="relative h-32 w-32 ring-4 ring-background shadow-xl">
                {profilePhotoUrl ? (
                  <AvatarImage src={profilePhotoUrl} alt="Profile" className="object-cover" />
                ) : null}
                <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
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
                className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg bg-primary hover:bg-primary/90"
                data-testid="button-change-avatar"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="text-center lg:text-left space-y-2 w-full">
              <h2 className="text-2xl font-bold tracking-tight">{user.fullName}</h2>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center lg:justify-start">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                {user.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center lg:justify-start">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </p>
                )}
                {user.companyName && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center lg:justify-start">
                    <Building2 className="h-4 w-4" />
                    {user.companyName}
                  </p>
                )}
              </div>
            </div>

            {/* Logo officiel */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative group">
                <img 
                  src="/logo.png" 
                  alt="Altus Finances Group" 
                  className="h-16 w-auto opacity-90 dark:opacity-80 transition-all duration-300 group-hover:opacity-100"
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              {user.kycStatus === 'approved' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/30 text-accent rounded-full text-sm font-medium shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {t.settings.verified}
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 text-primary rounded-full text-sm font-medium shadow-sm">
                {user.accountType === 'business' ? t.settings.businessAccount : t.settings.individualAccount}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-muted to-muted/50 border border-border rounded-full text-sm font-medium shadow-sm">
                {user.status === 'active' ? t.common.active : user.status === 'pending' ? t.common.pending : user.status}
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {user.accountType === 'business' 
                ? t.settings.businessAccess
                : t.settings.individualAccess}
            </p>
          </div>
        </div>
      </GlassPanel>

      <Tabs defaultValue="profile" className="space-y-6 w-full">
        <GlassPanel className="p-1">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-transparent gap-1">
            <TabsTrigger 
              value="profile" 
              className="gap-2 data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:-translate-y-0.5 rounded-md"
              data-testid="tab-profile"
            >
              <User className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.settings.profile}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="gap-2 data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:-translate-y-0.5 rounded-md"
              data-testid="tab-notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.settings.notifications}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="gap-2 data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:-translate-y-0.5 rounded-md"
              data-testid="tab-security"
            >
              <Shield className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.settings.security}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="gap-2 data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 data-[state=active]:-translate-y-0.5 rounded-md"
              data-testid="tab-appearance"
            >
              <Palette className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{t.settings.appearance}</span>
            </TabsTrigger>
          </TabsList>
        </GlassPanel>

        <TabsContent value="profile" className="space-y-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4 duration-300">
          <DashboardCard
            title={t.settings.personalInfo}
            subtitle={t.settings.updateInfo}
            icon={User}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    {t.settings.fullName}
                  </Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="transition-all duration-200"
                    data-testid="input-full-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t.settings.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="transition-all duration-200"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    {t.settings.phone}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="transition-all duration-200"
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">
                    {t.settings.company}
                  </Label>
                  <Input
                    id="company"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                    className="transition-all duration-200"
                    data-testid="input-company"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <GradientButton 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.common.saving}
                    </>
                  ) : (
                    t.settings.saveChanges
                  )}
                </GradientButton>
              </div>
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4 duration-300">
          <DashboardCard
            title={t.settings.notificationPreferences}
            subtitle={t.settings.chooseNotifications}
            icon={Bell}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 rounded-xl hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="emailAlerts" className="text-base font-medium cursor-pointer">
                    {t.settings.emailAlerts}
                  </Label>
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
              <div className="flex items-center justify-between p-5 rounded-xl hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="transferUpdates" className="text-base font-medium cursor-pointer">
                    {t.settings.transferUpdates}
                  </Label>
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
              <div className="flex items-center justify-between p-5 rounded-xl hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="loanReminders" className="text-base font-medium cursor-pointer">
                    {t.settings.loanReminders}
                  </Label>
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
              <div className="flex items-center justify-between p-5 rounded-xl hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="marketingEmails" className="text-base font-medium cursor-pointer">
                    {t.settings.marketingEmails}
                  </Label>
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
              <div className="flex justify-end pt-6 border-t">
                <GradientButton 
                  onClick={handleSaveNotifications}
                  disabled={updateNotificationsMutation.isPending}
                  data-testid="button-save-notifications"
                >
                  {updateNotificationsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.common.saving}
                    </>
                  ) : (
                    t.settings.saveChanges
                  )}
                </GradientButton>
              </div>
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4 duration-300">
          <DashboardCard
            title={t.settings.changePassword}
            subtitle={t.settings.updatePassword}
            icon={Shield}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  {t.settings.currentPassword}
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="transition-all duration-200"
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  {t.settings.newPassword}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="transition-all duration-200"
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t.settings.confirmNewPassword}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="transition-all duration-200"
                  data-testid="input-confirm-password"
                />
              </div>
              <div className="flex justify-end pt-6 border-t">
                <GradientButton 
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  data-testid="button-change-password"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.common.saving}
                    </>
                  ) : (
                    t.settings.changePassword
                  )}
                </GradientButton>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard
            title={t.settings.twoFactorAuth}
            subtitle={t.settings.twoFactorAuthDesc}
            icon={ShieldCheck}
          >
            <div className="space-y-6">
              {!user?.twoFactorEnabled && !twoFactorData.showSetup && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-muted/30 border border-border">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium">{t.twoFactorAuth.setup.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.twoFactorAuth.setup.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <GradientButton
                      onClick={handleSetup2FA}
                      disabled={setup2FAMutation.isPending}
                      data-testid="button-enable-2fa"
                    >
                      {setup2FAMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t.twoFactorAuth.setup.verifying}
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4 mr-2" />
                          {t.settings.enable2FA}
                        </>
                      )}
                    </GradientButton>
                  </div>
                </div>
              )}

              {twoFactorData.showSetup && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-primary/5 border border-primary/30">
                    <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-primary mb-1">{t.twoFactorAuth.setup.step1}</p>
                      <p className="text-muted-foreground">
                        {t.twoFactorAuth.setup.step1Description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-6 p-8 bg-muted/30 rounded-xl border border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <QrCode className="h-4 w-4" />
                      <span>{t.twoFactorAuth.setup.qrCodeInstructions}</span>
                    </div>
                    {twoFactorData.qrCode && (
                      <div className="p-4 bg-white rounded-lg shadow-lg">
                        <img
                          src={twoFactorData.qrCode}
                          alt="QR Code 2FA"
                          className="w-48 h-48"
                          data-testid="img-2fa-qr-code"
                        />
                      </div>
                    )}
                    <div className="w-full max-w-md space-y-2">
                      <p className="text-xs text-center text-muted-foreground">
                        {t.twoFactorAuth.setup.cantScanQR}
                      </p>
                      <div className="flex items-center justify-center gap-2 p-3 bg-background rounded-lg border border-border font-mono text-sm">
                        <code className="text-primary">{twoFactorData.secret}</code>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode" className="text-sm font-medium">
                        {t.twoFactorAuth.setup.enterCode}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t.twoFactorAuth.setup.step3Description}
                      </p>
                      <Input
                        id="verificationCode"
                        type="text"
                        placeholder={t.twoFactorAuth.setup.codePlaceholder}
                        maxLength={6}
                        value={twoFactorData.verificationCode}
                        onChange={(e) => setTwoFactorData({ ...twoFactorData, verificationCode: e.target.value.replace(/\D/g, '') })}
                        className="text-center text-2xl tracking-widest font-mono"
                        data-testid="input-2fa-code"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleCancel2FASetup}
                      disabled={verify2FAMutation.isPending}
                      data-testid="button-cancel-2fa-setup"
                    >
                      {t.twoFactorAuth.setup.cancel}
                    </Button>
                    <GradientButton
                      onClick={handleVerify2FA}
                      disabled={verify2FAMutation.isPending || twoFactorData.verificationCode.length !== 6}
                      data-testid="button-verify-2fa"
                    >
                      {verify2FAMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t.twoFactorAuth.setup.verifying}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {t.twoFactorAuth.setup.verify}
                        </>
                      )}
                    </GradientButton>
                  </div>
                </div>
              )}

              {user?.twoFactorEnabled && !twoFactorData.showSetup && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-accent/10 border border-accent/30">
                    <div className="flex-shrink-0 p-2 bg-accent/10 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-accent">{t.twoFactorAuth.settings.enabled}</p>
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t.twoFactorAuth.settings.enabledMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={handleDisable2FA}
                      disabled={disable2FAMutation.isPending}
                      data-testid="button-disable-2fa"
                    >
                      {disable2FAMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t.twoFactorAuth.disable.disabling}
                        </>
                      ) : (
                        t.twoFactorAuth.disable.disable
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-4 duration-300">
          <DashboardCard
            title={t.settings.appearance}
            subtitle="Personnalisez l'apparence de votre interface"
            icon={Palette}
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">{t.settings.theme}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      theme === 'light' 
                        ? 'border-primary bg-primary/5 shadow-lg' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    data-testid="button-theme-light"
                  >
                    <div className="space-y-2">
                      <div className="text-lg font-medium">{t.settings.lightMode}</div>
                      <div className="text-sm text-muted-foreground">Interface claire et lumineuse</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'border-primary bg-primary/5 shadow-lg' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    data-testid="button-theme-dark"
                  >
                    <div className="space-y-2">
                      <div className="text-lg font-medium">{t.settings.darkMode}</div>
                      <div className="text-sm text-muted-foreground">Interface sombre et reposante</div>
                    </div>
                  </button>
                </div>
              </div>
              
              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Langue</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setLanguage('fr')}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      language === 'fr' 
                        ? 'border-primary bg-primary/5 shadow-lg' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    data-testid="button-language-fr"
                  >
                    <div className="text-lg font-medium">Français</div>
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      language === 'en' 
                        ? 'border-primary bg-primary/5 shadow-lg' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    data-testid="button-language-en"
                  >
                    <div className="text-lg font-medium">English</div>
                  </button>
                </div>
              </div>
            </div>
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

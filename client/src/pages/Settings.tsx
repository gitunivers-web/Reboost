import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Shield, Palette, Globe, Camera, Mail, Phone, Building2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, useTranslations } from '@/lib/i18n';
import { useTheme } from '@/hooks/use-theme';
import { useUser, getUserInitials } from '@/hooks/use-user';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient, getApiUrl } from '@/lib/queryClient';
import type { User as UserType } from '@shared/schema';

export default function Settings() {
  const { toast } = useToast();
  const t = useTranslations();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { data: user, isLoading } = useUser();
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
      const response = await fetch(getApiUrl('/api/user/profile-photo'), {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-violet-950/30 dark:to-blue-950/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-violet-950/30 dark:to-blue-950/30">
      <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-12 space-y-8">
        <div className="relative">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-300/10 dark:bg-cyan-500/10 rounded-full blur-3xl" />
          
          <Card className="relative border border-white/20 dark:border-white/10 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <Avatar className="relative h-24 w-24 border-4 border-white dark:border-slate-800 shadow-2xl ring-4 ring-violet-500/30 dark:ring-violet-400/30">
                    <AvatarImage src={user.profilePhoto ? getApiUrl(user.profilePhoto) : ''} alt="Profile" />
                    <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-600 text-white">
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
                  <button 
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 p-2 bg-gradient-to-br from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full shadow-xl transition-all transform hover:scale-110 ring-4 ring-white dark:ring-slate-900"
                    data-testid="button-change-avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      {user.fullName}
                    </h1>
                    {user.kycStatus === 'approved' && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-500/30 dark:to-emerald-500/30 border border-green-500/30 dark:border-green-400/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold shadow-lg shadow-green-500/10">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t.settings.verified}
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
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
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted/50 backdrop-blur-sm p-1.5 shadow-sm border">
            <TabsTrigger 
              value="profile" 
              className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all" 
              data-testid="tab-profile"
            >
              <User className="h-4 w-4" />
              <span>{t.settings.profile}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all" 
              data-testid="tab-notifications"
            >
              <Bell className="h-4 w-4" />
              <span>{t.settings.notifications}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all" 
              data-testid="tab-security"
            >
              <Shield className="h-4 w-4" />
              <span>{t.settings.security}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all" 
              data-testid="tab-appearance"
            >
              <Palette className="h-4 w-4" />
              <span>{t.settings.appearance}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
          <Card className="relative border border-blue-200/50 dark:border-blue-500/30 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent dark:from-blue-500/10 dark:via-cyan-500/10 pointer-events-none" />
            <CardHeader className="relative space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <User className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  {t.settings.personalInfo}
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                {t.settings.updateInfo}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">{t.settings.fullName}</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    data-testid="input-full-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">{t.settings.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">{t.settings.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">{t.settings.company}</Label>
                  <Input
                    id="company"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    data-testid="input-company"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="px-8 h-11 shadow-md hover:shadow-lg transition-all"
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? t.common.saving : t.settings.saveChanges}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border border-violet-200/50 dark:border-violet-500/30 shadow-xl shadow-violet-500/10 dark:shadow-violet-500/20 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-transparent dark:from-violet-500/10 dark:via-purple-500/10 pointer-events-none" />
            <CardHeader className="relative space-y-1 pb-6">
              <CardTitle className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t.settings.accountType}
              </CardTitle>
              <CardDescription className="text-base">
                {t.settings.yourAccountType} {user.accountType === 'business' ? t.settings.businessAccount : t.settings.individualAccount}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 backdrop-blur-sm rounded-xl border-2 border-violet-300/30 dark:border-violet-500/30 shadow-lg">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">
                    {user.accountType === 'business' ? t.settings.businessAccount : t.settings.individualAccount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.accountType === 'business' 
                      ? t.settings.businessAccess
                      : t.settings.individualAccess}
                  </p>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white rounded-full text-sm font-semibold shadow-xl shadow-violet-500/30">
                  {user.status === 'active' ? t.common.active : user.status === 'pending' ? t.common.pending : user.status}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="relative border border-amber-200/50 dark:border-amber-500/30 shadow-xl shadow-amber-500/10 dark:shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/20 dark:hover:shadow-amber-500/30 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-transparent dark:from-amber-500/10 dark:via-yellow-500/10 pointer-events-none" />
            <CardHeader className="relative space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Bell className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text text-transparent">
                  {t.settings.notificationPreferences}
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                {t.settings.chooseNotifications}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
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
              <Separator className="my-2" />
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
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
              <Separator className="my-2" />
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
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
              <Separator className="my-2" />
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
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
                  className="px-8 h-11 shadow-md hover:shadow-lg transition-all"
                  data-testid="button-save-notifications"
                >
                  {updateNotificationsMutation.isPending ? t.common.saving : t.settings.savePreferences}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="relative border border-green-200/50 dark:border-green-500/30 shadow-xl shadow-green-500/10 dark:shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/20 dark:hover:shadow-green-500/30 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-transparent dark:from-green-500/10 dark:via-emerald-500/10 pointer-events-none" />
            <CardHeader className="relative space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  {t.settings.changePassword}
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                {t.settings.updatePassword}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">{t.settings.currentPassword}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">{t.settings.newPassword}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">{t.settings.confirmNewPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  data-testid="input-confirm-password"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="px-8 h-11 shadow-md hover:shadow-lg transition-all"
                  data-testid="button-change-password"
                >
                  {changePasswordMutation.isPending ? t.common.saving : t.settings.changePassword}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border border-green-200/50 dark:border-green-500/30 shadow-xl shadow-green-500/10 dark:shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/20 dark:hover:shadow-green-500/30 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-transparent dark:from-green-500/10 dark:via-emerald-500/10 pointer-events-none" />
            <CardHeader className="relative space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Authentification à deux facteurs
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Ajoutez une couche de sécurité supplémentaire à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-col gap-4 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-xl border-2 border-green-300/30 dark:border-green-500/30 shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <p className="text-lg font-semibold text-foreground">
                      {user?.twoFactorEnabled ? 'Authentification à deux facteurs activée' : 'Activer 2FA'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user?.twoFactorEnabled 
                        ? 'Votre compte est protégé par l\'authentification à deux facteurs' 
                        : 'Protégez votre compte avec une vérification en deux étapes via Google Authenticator'}
                    </p>
                  </div>
                  {user?.twoFactorEnabled ? (
                    <Button 
                      variant="outline" 
                      className="h-11 px-6 border-red-500/50 text-red-700 dark:text-red-400"
                      data-testid="button-disable-2fa"
                      onClick={async () => {
                        try {
                          await apiRequest('POST', '/api/2fa/disable');
                          queryClient.invalidateQueries({ queryKey: ['/api/user'] });
                          toast({
                            title: 'Succès',
                            description: '2FA désactivée avec succès',
                          });
                        } catch (error: any) {
                          toast({
                            title: 'Erreur',
                            description: error.message || 'Erreur lors de la désactivation 2FA',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      Désactiver
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="h-11 px-6 border-green-500/50 text-green-700 dark:text-green-400"
                      data-testid="button-enable-2fa"
                      onClick={() => window.location.href = '/security/2fa'}
                    >
                      Configurer
                    </Button>
                  )}
                </div>
                {user?.twoFactorEnabled && (
                  <div 
                    className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-700 rounded-lg"
                    role="status"
                  >
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-500 dark:bg-green-600 text-white shadow-sm">
                      Activé
                    </span>
                    <p className="text-sm font-medium text-green-900 dark:text-green-200 leading-relaxed">
                      Votre compte est sécurisé avec Google Authenticator. Un code sera demandé à chaque connexion.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="relative border border-pink-200/50 dark:border-pink-500/30 shadow-xl shadow-pink-500/10 dark:shadow-pink-500/20 hover:shadow-2xl hover:shadow-pink-500/20 dark:hover:shadow-pink-500/30 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-transparent dark:from-pink-500/10 dark:via-rose-500/10 pointer-events-none" />
            <CardHeader className="relative space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400">
                  <Palette className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
                  Thème
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Choisissez votre thème préféré
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                    theme === 'light'
                      ? 'border-pink-500 bg-pink-500/10 dark:bg-pink-500/20'
                      : 'border-muted hover:border-pink-300'
                  }`}
                  data-testid="button-theme-light"
                >
                  <span className="font-semibold">Clair</span>
                  {theme === 'light' && <CheckCircle2 className="h-5 w-5 text-pink-600" />}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-pink-500 bg-pink-500/10 dark:bg-pink-500/20'
                      : 'border-muted hover:border-pink-300'
                  }`}
                  data-testid="button-theme-dark"
                >
                  <span className="font-semibold">Sombre</span>
                  {theme === 'dark' && <CheckCircle2 className="h-5 w-5 text-pink-600" />}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border border-indigo-200/50 dark:border-indigo-500/30 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/30 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent dark:from-indigo-500/10 dark:via-purple-500/10 pointer-events-none" />
            <CardHeader className="relative space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Globe className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Langue
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Sélectionnez votre langue
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setLanguage('fr')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    language === 'fr'
                      ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20'
                      : 'border-muted hover:border-indigo-300'
                  }`}
                  data-testid="button-lang-fr"
                >
                  <span className="font-semibold">Français</span>
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    language === 'en'
                      ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20'
                      : 'border-muted hover:border-indigo-300'
                  }`}
                  data-testid="button-lang-en"
                >
                  <span className="font-semibold">English</span>
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    language === 'es'
                      ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20'
                      : 'border-muted hover:border-indigo-300'
                  }`}
                  data-testid="button-lang-es"
                >
                  <span className="font-semibold">Español</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

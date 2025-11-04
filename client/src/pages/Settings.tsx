import { useState } from 'react';
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
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/hooks/use-theme';

export default function Settings() {
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  const [profileData, setProfileData] = useState({
    fullName: 'Jean Dupont',
    email: 'jean.dupont@entreprise.fr',
    phone: '+33612345678',
    company: 'Entreprise SARL',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    transferUpdates: true,
    loanReminders: true,
    marketingEmails: false,
  });

  const handleSaveProfile = () => {
    toast({
      title: 'Profil mis à jour',
      description: 'Vos informations ont été enregistrées avec succès.',
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Préférences enregistrées',
      description: 'Vos préférences de notification ont été mises à jour.',
    });
  };

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
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-600 text-white">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    className="absolute bottom-0 right-0 p-2 bg-gradient-to-br from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white rounded-full shadow-xl transition-all transform hover:scale-110 ring-4 ring-white dark:ring-slate-900"
                    data-testid="button-change-avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      {profileData.fullName}
                    </h1>
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-500/30 dark:to-emerald-500/30 border border-green-500/30 dark:border-green-400/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold shadow-lg shadow-green-500/10">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Vérifié
                    </div>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profileData.email}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {profileData.phone}
                    </span>
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {profileData.company}
                    </span>
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
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all" 
              data-testid="tab-notifications"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all" 
              data-testid="tab-security"
            >
              <Shield className="h-4 w-4" />
              <span>Sécurité</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all" 
              data-testid="tab-appearance"
            >
              <Palette className="h-4 w-4" />
              <span>Apparence</span>
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
                  Informations personnelles
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Mettez à jour vos informations de profil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Nom complet</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    data-testid="input-full-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
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
                  <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
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
                  <Label htmlFor="company" className="text-sm font-medium">Entreprise</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    data-testid="input-company"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSaveProfile} 
                  className="px-8 h-11 shadow-md hover:shadow-lg transition-all"
                  data-testid="button-save-profile"
                >
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border border-violet-200/50 dark:border-violet-500/30 shadow-xl shadow-violet-500/10 dark:shadow-violet-500/20 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-transparent dark:from-violet-500/10 dark:via-purple-500/10 pointer-events-none" />
            <CardHeader className="relative space-y-1 pb-6">
              <CardTitle className="text-2xl bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                Type de compte
              </CardTitle>
              <CardDescription className="text-base">
                Votre compte professionnel ProLoan
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 backdrop-blur-sm rounded-xl border-2 border-violet-300/30 dark:border-violet-500/30 shadow-lg">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">Compte Professionnel</p>
                  <p className="text-sm text-muted-foreground">
                    Accès complet aux services de financement d'entreprise
                  </p>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-white rounded-full text-sm font-semibold shadow-xl shadow-violet-500/30">
                  Actif
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
                  Préférences de notification
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Choisissez comment vous souhaitez être notifié
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="emailAlerts" className="text-base font-medium cursor-pointer">Alertes par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des alertes importantes par email
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
                  <Label htmlFor="transferUpdates" className="text-base font-medium cursor-pointer">Mises à jour de transfert</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications sur l'état de vos transferts
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
                  <Label htmlFor="loanReminders" className="text-base font-medium cursor-pointer">Rappels de paiement</Label>
                  <p className="text-sm text-muted-foreground">
                    Rappels pour vos échéances de prêt
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
                  <Label htmlFor="marketingEmails" className="text-base font-medium cursor-pointer">Emails marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des nouvelles et des offres spéciales
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
                  className="px-8 h-11 shadow-md hover:shadow-lg transition-all"
                  data-testid="button-save-notifications"
                >
                  Enregistrer les préférences
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
                  Mot de passe
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Modifiez votre mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                  data-testid="input-confirm-password"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  className="px-8 h-11 shadow-md hover:shadow-lg transition-all"
                  data-testid="button-change-password"
                >
                  Modifier le mot de passe
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
                Ajoutez une couche de sécurité supplémentaire
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-xl border-2 border-green-300/30 dark:border-green-500/30 hover:border-green-400/50 dark:hover:border-green-400/50 transition-all shadow-lg">
                <div className="space-y-1">
                  <p className="text-lg font-semibold">Activer 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Protégez votre compte avec une vérification en deux étapes
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="h-11 px-6 border-green-500/50 text-green-700 dark:text-green-400 hover:bg-green-500/10 dark:hover:bg-green-500/20 shadow-md hover:shadow-lg transition-all"
                  data-testid="button-enable-2fa"
                >
                  Configurer
                </Button>
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
                Personnalisez l'apparence de l'interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => setTheme('light')}
                  className={`group p-6 border-2 rounded-xl transition-all hover:shadow-xl ${
                    theme === 'light' 
                      ? 'border-pink-500/50 bg-gradient-to-br from-pink-500/10 to-rose-500/10 shadow-xl shadow-pink-500/20' 
                      : 'border-pink-200/30 dark:border-pink-500/20 hover:border-pink-400/50 dark:hover:border-pink-400/40'
                  }`}
                  data-testid="button-theme-light"
                >
                  <div className="aspect-video bg-gradient-to-br from-white via-violet-50 to-blue-50 rounded-lg mb-3 border-2 border-violet-200/50 shadow-md" />
                  <p className="text-base font-semibold">Clair</p>
                  <p className="text-xs text-muted-foreground mt-1">Mode lumineux</p>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`group p-6 border-2 rounded-xl transition-all hover:shadow-xl ${
                    theme === 'dark' 
                      ? 'border-pink-500/50 bg-gradient-to-br from-pink-500/10 to-rose-500/10 shadow-xl shadow-pink-500/20' 
                      : 'border-pink-200/30 dark:border-pink-500/20 hover:border-pink-400/50 dark:hover:border-pink-400/40'
                  }`}
                  data-testid="button-theme-dark"
                >
                  <div className="aspect-video bg-gradient-to-br from-slate-950 via-violet-950 to-blue-950 rounded-lg mb-3 border-2 border-violet-700/50 shadow-md" />
                  <p className="text-base font-semibold">Sombre</p>
                  <p className="text-xs text-muted-foreground mt-1">Mode nocturne</p>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative border border-purple-200/50 dark:border-purple-500/30 shadow-xl shadow-purple-500/10 dark:shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/30 transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-transparent dark:from-purple-500/10 dark:via-indigo-500/10 pointer-events-none" />
            <CardHeader className="relative space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  <Globe className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Langue
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Choisissez votre langue préférée
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setLanguage('fr')}
                  className={`p-5 border-2 rounded-xl transition-all flex items-center gap-3 hover:shadow-xl ${
                    language === 'fr' 
                      ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 shadow-xl shadow-purple-500/20' 
                      : 'border-purple-200/30 dark:border-purple-500/20 hover:border-purple-400/50 dark:hover:border-purple-400/40'
                  }`}
                  data-testid="button-lang-fr"
                >
                  <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold">Français</span>
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`p-5 border-2 rounded-xl transition-all flex items-center gap-3 hover:shadow-xl ${
                    language === 'en' 
                      ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 shadow-xl shadow-purple-500/20' 
                      : 'border-purple-200/30 dark:border-purple-500/20 hover:border-purple-400/50 dark:hover:border-purple-400/40'
                  }`}
                  data-testid="button-lang-en"
                >
                  <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold">English</span>
                </button>
                <button
                  onClick={() => setLanguage('es')}
                  className={`p-5 border-2 rounded-xl transition-all flex items-center gap-3 hover:shadow-xl ${
                    language === 'es' 
                      ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 shadow-xl shadow-purple-500/20' 
                      : 'border-purple-200/30 dark:border-purple-500/20 hover:border-purple-400/50 dark:hover:border-purple-400/40'
                  }`}
                  data-testid="button-lang-es"
                >
                  <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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

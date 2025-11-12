import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, clearCsrfToken, preloadCsrfToken } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Mail, Lock, Phone, FileText, Hash, ArrowLeft } from 'lucide-react';
import { useLanguage, useTranslations } from '@/lib/i18n';

export default function Auth() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<string>('login');
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');

  const loginSchema = useMemo(() => z.object({
    email: z.string().email(t.auth.emailInvalid),
    password: z.string().min(1, t.auth.required),
  }), [t]);

  const signupSchema = useMemo(() => z.object({
    accountType: z.enum(['personal', 'business']),
    email: z.string().email(t.auth.emailInvalid),
    password: z.string()
      .min(12, t.auth.passwordMinLength)
      .regex(/[A-Z]/, t.auth.passwordUppercase)
      .regex(/[a-z]/, t.auth.passwordLowercase)
      .regex(/[0-9]/, t.auth.passwordNumber)
      .regex(/[^A-Za-z0-9]/, t.auth.passwordSpecial),
    confirmPassword: z.string(),
    fullName: z.string().min(2, t.auth.required),
    phone: z.string().optional(),
    companyName: z.string().optional(),
    siret: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.auth.passwordMatch,
    path: ['confirmPassword'],
  }).refine((data) => {
    if (data.accountType === 'business') {
      return !!data.companyName;
    }
    return true;
  }, {
    message: t.auth.companyRequired,
    path: ['companyName'],
  }), [t]);

  type LoginFormData = z.infer<typeof loginSchema>;
  type SignupFormData = z.infer<typeof signupSchema>;

  useEffect(() => {
    if (location === '/signup') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
  }, [location]);

  useEffect(() => {
    preloadCsrfToken();
  }, []);

  useEffect(() => {
    const authMessage = sessionStorage.getItem('auth_redirect_message');
    const redirectFrom = sessionStorage.getItem('auth_redirect_from');
    
    if (authMessage) {
      toast({
        title: t.auth.sessionExpired,
        description: authMessage,
        variant: 'destructive',
      });
      sessionStorage.removeItem('auth_redirect_message');
      sessionStorage.removeItem('auth_redirect_from');
    }
  }, [toast, t]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: 'personal',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
      companyName: '',
      siret: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.requires2FA) {
        toast({
          title: t.common.success,
          description: data.message || t.auth.pleaseTwoFactorCode,
        });
        setLocation(`/verify-2fa?userId=${data.userId}`);
      } else if (data.requiresOtp) {
        toast({
          title: t.common.success,
          description: data.message || t.auth.verificationCodeSent,
        });
        setLocation(`/verify-otp/${data.userId}`);
      } else {
        clearCsrfToken();
        toast({
          title: t.auth.loginSuccess,
          description: t.auth.loginSuccessDesc,
        });
        if (data.user?.role === 'admin') {
          setLocation('/admin');
        } else {
          setLocation('/dashboard');
        }
      }
    },
    onError: (error: any) => {
      if (error.needsVerification) {
        toast({
          title: t.auth.emailNotVerified,
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t.auth.loginError,
          description: error.message || t.auth.loginErrorDesc,
          variant: 'destructive',
        });
      }
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await apiRequest('POST', '/api/auth/signup', { ...data, preferredLanguage: language });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t.auth.signupSuccess,
        description: data.message,
      });
      setActiveTab('login');
      loginForm.setValue('email', signupForm.getValues('email'));
    },
    onError: (error: any) => {
      toast({
        title: t.auth.signupError,
        description: error.message || t.auth.signupErrorDesc,
        variant: 'destructive',
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onSignupSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-[#002d52] dark:via-[#003d6f] dark:to-[#004b87] flex items-center justify-center p-3 sm:p-4 md:p-6">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-2 px-4 sm:px-6">
          <div className="flex justify-center mb-2">
            <img 
              src="/logo.png" 
              alt="Altus Finance Group" 
              className="h-24 sm:h-28 w-auto"
              data-testid="img-logo-auth"
            />
          </div>
          <CardDescription className="text-sm sm:text-base">
            {t.auth.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2" data-testid="tabs-auth">
              <TabsTrigger value="login" data-testid="tab-login">{t.auth.loginTab}</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">{t.auth.signupTab}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <Link href="/">
                    <Button
                      type="button"
                      variant="ghost"
                      className="mb-4 -mt-2"
                      data-testid="button-back-login"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t.auth.backToHome}
                    </Button>
                  </Link>

                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">{t.auth.email}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder={t.auth.emailPlaceholder}
                              className="pl-10"
                              data-testid="input-login-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">{t.auth.password}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="password"
                              placeholder={t.auth.passwordPlaceholder}
                              className="pl-10"
                              data-testid="input-login-password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-end">
                    <Link href="/forgot-password">
                      <button
                        type="button"
                        className="text-sm text-primary hover:text-primary/80 hover:underline font-medium"
                        data-testid="link-forgot-password"
                      >
                        Mot de passe oublié ?
                      </button>
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                    data-testid="button-submit-login"
                  >
                    {loginMutation.isPending ? t.auth.loggingIn : t.auth.login}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                  <Link href="/">
                    <Button
                      type="button"
                      variant="ghost"
                      className="mb-4 -mt-2"
                      data-testid="button-back-signup"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t.auth.backToHome}
                    </Button>
                  </Link>

                  <FormField
                    control={signupForm.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">{t.auth.accountType}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                              setAccountType(value as 'personal' | 'business');
                            }}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <div>
                              <RadioGroupItem
                                value="personal"
                                id="personal"
                                className="peer sr-only"
                                data-testid="radio-personal"
                              />
                              <Label
                                htmlFor="personal"
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-50 dark:peer-data-[state=checked]:bg-violet-950 cursor-pointer transition-all"
                                data-testid="label-personal"
                              >
                                <User className="mb-3 h-8 w-8 text-violet-600" />
                                <div className="text-center">
                                  <div className="font-semibold">{t.auth.personal}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {t.auth.personalLoan}
                                  </div>
                                </div>
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value="business"
                                id="business"
                                className="peer sr-only"
                                data-testid="radio-business"
                              />
                              <Label
                                htmlFor="business"
                                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-50 dark:peer-data-[state=checked]:bg-violet-950 cursor-pointer transition-all"
                                data-testid="label-business"
                              >
                                <Building2 className="mb-3 h-8 w-8 text-violet-600" />
                                <div className="text-center">
                                  <div className="font-semibold">{t.auth.business}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {t.auth.businessLoan}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={signupForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.auth.fullName} *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder={t.auth.fullNamePlaceholder}
                                className="pl-10"
                                data-testid="input-fullName"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.auth.phone}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder={t.auth.phonePlaceholder}
                                className="pl-10"
                                data-testid="input-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {accountType === 'business' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-violet-50 dark:bg-violet-950 rounded-lg border border-violet-200 dark:border-violet-800">
                      <FormField
                        control={signupForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.auth.companyName} *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  placeholder={t.auth.companyNamePlaceholder}
                                  className="pl-10 bg-white dark:bg-gray-800"
                                  data-testid="input-companyName"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signupForm.control}
                        name="siret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t.auth.siret}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  placeholder={t.auth.siretPlaceholder}
                                  className="pl-10 bg-white dark:bg-gray-800"
                                  data-testid="input-siret"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.auth.email} *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder={t.auth.emailPlaceholder}
                              className="pl-10"
                              data-testid="input-signup-email"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.auth.password} *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="password"
                                placeholder={t.auth.passwordPlaceholder}
                                className="pl-10"
                                data-testid="input-signup-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.auth.confirmPassword} *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type="password"
                                placeholder={t.auth.passwordPlaceholder}
                                className="pl-10"
                                data-testid="input-confirmPassword"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signupMutation.isPending}
                    data-testid="button-submit-signup"
                  >
                    {signupMutation.isPending ? t.auth.signingUp : t.auth.signup}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

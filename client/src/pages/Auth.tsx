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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaBuilding } from 'react-icons/fa';
import { ArrowLeft, Hash, FileText, Eye, EyeOff } from 'lucide-react';
import { useLanguage, useTranslations } from '@/lib/i18n';
import { translateBackendMessage } from '@/lib/translateBackendMessage';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Auth() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      if (data.requiresAdmin2FASetup) {
        toast({
          title: 'Configuration requise',
          description: translateBackendMessage(data.message, language) || 'Veuillez configurer l\'authentification à deux facteurs',
          variant: 'default',
        });
        setLocation(`/admin/setup-2fa?userId=${data.userId}&email=${encodeURIComponent(data.email)}`);
      } else if (data.requires2FA) {
        toast({
          title: t.common.success,
          description: translateBackendMessage(data.message, language) || t.auth.pleaseTwoFactorCode,
        });
        setLocation(`/verify-2fa?userId=${data.userId}`);
      } else if (data.requiresOtp) {
        toast({
          title: t.common.success,
          description: translateBackendMessage(data.message, language) || t.auth.verificationCodeSent,
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
          description: translateBackendMessage(error.message, language),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t.auth.loginError,
          description: translateBackendMessage(error.message, language) || t.auth.loginErrorDesc,
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
        description: translateBackendMessage(data.message, language),
      });
      setActiveTab('login');
      loginForm.setValue('email', signupForm.getValues('email'));
    },
    onError: (error: any) => {
      toast({
        title: t.auth.signupError,
        description: translateBackendMessage(error.message, language) || t.auth.signupErrorDesc,
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
    <div className="relative flex items-center justify-center min-h-screen bg-white dark:bg-slate-950 overflow-hidden">
      
      {/* ANIMATED BACKGROUND BUBBLES */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-altus-purple to-altus-blue opacity-20 dark:opacity-10 rounded-full blur-3xl animate-float top-10 left-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-altus-blue to-altus-purple opacity-20 dark:opacity-10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-9s' }} />

      {/* AUTH CARD */}
      <div className="relative z-10 w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-slate-700 shadow-2xl rounded-2xl p-8 sm:p-10 mx-4">

        {/* HEADER WITH LOGO AND LANGUAGE SWITCHER */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 text-center">
            <img 
              src="/logo.png" 
              alt="ALTUS FINANCES GROUP" 
              className="mx-auto h-20 w-auto mb-3"
              data-testid="img-logo-auth"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ALTUS FINANCES GROUP</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t.auth.subtitle}</p>
          </div>

          {/* LANGUAGE SELECTOR */}
          <div className="absolute right-4 top-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* TABS */}
        <div className="grid grid-cols-2 rounded-xl mb-8 border border-gray-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setActiveTab('login')}
            className={`py-3 font-semibold transition-all ${
              activeTab === 'login' 
                ? 'bg-altus-blue text-white' 
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
            }`}
            data-testid="tab-login"
          >
            {t.auth.loginTab}
          </button>

          <button
            onClick={() => setActiveTab('signup')}
            className={`py-3 font-semibold transition-all ${
              activeTab === 'signup' 
                ? 'bg-altus-blue text-white' 
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
            }`}
            data-testid="tab-signup"
          >
            {t.auth.signupTab}
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <Link href="/">
                <Button
                  type="button"
                  variant="ghost"
                  className="mb-2 -mt-2"
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
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold">{t.auth.email}</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-3 gap-3">
                        <FaEnvelope className="text-gray-500 dark:text-gray-400" />
                        <Input
                          {...field}
                          type="email"
                          placeholder={t.auth.emailPlaceholder}
                          className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold">{t.auth.password}</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-3 gap-3">
                        <FaLock className="text-gray-500 dark:text-gray-400" />
                        <Input
                          {...field}
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          data-testid="input-login-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          data-testid="button-toggle-login-password"
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right">
                <Link href="/forgot-password">
                  <button
                    type="button"
                    className="text-sm text-altus-blue hover:text-altus-purple font-medium transition-colors"
                    data-testid="link-forgot-password"
                  >
                    {t.auth.forgotPasswordLink}
                  </button>
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-altus-blue hover:bg-altus-purple text-white py-3 rounded-lg font-bold relative overflow-hidden group transition-all"
                data-testid="button-submit-login"
              >
                <span className="relative z-10">
                  {loginMutation.isPending ? t.auth.loggingIn : t.auth.login}
                </span>
                <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine" />
              </Button>
            </form>
          </Form>
        )}

        {/* SIGNUP FORM */}
        {activeTab === 'signup' && (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-5">
              <Link href="/">
                <Button
                  type="button"
                  variant="ghost"
                  className="mb-2 -mt-2"
                  data-testid="button-back-signup"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.auth.backToHome}
                </Button>
              </Link>

              {/* ACCOUNT TYPE */}
              <FormField
                control={signupForm.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold text-base">{t.auth.accountType}</FormLabel>
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
                            className="flex flex-col items-center justify-center border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg p-4 cursor-pointer transition-all peer-data-[state=checked]:border-altus-blue peer-data-[state=checked]:bg-altus-blue/10 dark:peer-data-[state=checked]:bg-altus-blue/20"
                            data-testid="label-personal"
                          >
                            <FaUser className="text-3xl mb-2 text-altus-blue" />
                            <span className="font-semibold text-gray-900 dark:text-white">{t.auth.personal}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">{t.auth.personalLoan}</span>
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
                            className="flex flex-col items-center justify-center border-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg p-4 cursor-pointer transition-all peer-data-[state=checked]:border-altus-blue peer-data-[state=checked]:bg-altus-blue/10 dark:peer-data-[state=checked]:bg-altus-blue/20"
                            data-testid="label-business"
                          >
                            <FaBuilding className="text-3xl mb-2 text-altus-blue" />
                            <span className="font-semibold text-gray-900 dark:text-white">{t.auth.business}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">{t.auth.businessLoan}</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FORM INPUTS */}
              <FormField
                control={signupForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold">{t.auth.fullName} *</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-3 gap-3">
                        <FaUser className="text-gray-500 dark:text-gray-400" />
                        <Input
                          {...field}
                          placeholder={t.auth.fullNamePlaceholder}
                          className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold">{t.auth.phone}</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-3 gap-3">
                        <FaPhone className="text-gray-500 dark:text-gray-400" />
                        <Input
                          {...field}
                          placeholder={t.auth.phonePlaceholder}
                          className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          data-testid="input-phone"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* BUSINESS FIELDS */}
              {accountType === 'business' && (
                <div className="space-y-4 p-4 bg-altus-blue/5 dark:bg-altus-blue/10 rounded-lg border border-altus-blue/30 dark:border-altus-blue/30">
                  <FormField
                    control={signupForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold">{t.auth.companyName} *</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-3 gap-3">
                            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <Input
                              {...field}
                              placeholder={t.auth.companyNamePlaceholder}
                              className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold">{t.auth.siret}</FormLabel>
                        <FormControl>
                          <div className="flex items-center border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-3 gap-3">
                            <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <Input
                              {...field}
                              placeholder={t.auth.siretPlaceholder}
                              className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold">{t.auth.email} *</FormLabel>
                    <FormControl>
                      <div className="flex items-center border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-3 gap-3">
                        <FaEnvelope className="text-gray-500 dark:text-gray-400" />
                        <Input
                          {...field}
                          type="email"
                          placeholder={t.auth.emailPlaceholder}
                          className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                      <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold">{t.auth.password} *</FormLabel>
                      <FormControl>
                        <div className="flex items-center border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-3 gap-3">
                          <FaLock className="text-gray-500 dark:text-gray-400" />
                          <Input
                            {...field}
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            data-testid="input-signup-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            data-testid="button-toggle-signup-password"
                          >
                            {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
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
                      <FormLabel className="text-gray-700 dark:text-gray-300 font-semibold">{t.auth.confirmPassword} *</FormLabel>
                      <FormControl>
                        <div className="flex items-center border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-3 gap-3">
                          <FaLock className="text-gray-500 dark:text-gray-400" />
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            data-testid="input-confirmPassword"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            data-testid="button-toggle-confirm-password"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full bg-altus-blue hover:bg-altus-purple text-white py-3 rounded-lg font-bold relative overflow-hidden group transition-all"
                data-testid="button-submit-signup"
              >
                <span className="relative z-10">
                  {signupMutation.isPending ? t.auth.signingUp : t.auth.signup}
                </span>
                <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine" />
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}

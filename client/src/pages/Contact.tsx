import Header from '@/components/Header';
import FooterPremium from '@/components/premium/FooterPremium';
import SEO from '@/components/SEO';
import { useTranslations } from '@/lib/i18n';
import { getApiUrl } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, Sparkles } from 'lucide-react';
import { contactPageSchema, breadcrumbSchema } from '@/lib/seo-data';
import { getOfficialStats } from '@/lib/constants';

export default function Contact() {
  const t = useTranslations();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const contactBreadcrumb = breadcrumbSchema([
    { name: t.nav.home, path: '/' },
    { name: t.nav.contact, path: '/contact' }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(getApiUrl('/api/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.contact.errorSending);
      }

      toast({
        title: t.contact.success,
        description: data.message || t.common.success,
      });
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast({
        title: t.contact.errorTitle,
        description: error instanceof Error ? error.message : t.contact.errorSending,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t.contact.emailLabel,
      value: "infos@altusfinancesgroup.org",
      detail: t.contact.responseTime,
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Phone,
      title: t.contact.phone,
      value: "+352 40 63 48",
      detail: t.contact.businessHours,
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: MapPin,
      title: t.contact.addressLabel,
      value: t.contact.addressStreet,
      detail: t.contact.addressFull,
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO
        title={t.seo.contact.title}
        description={t.seo.contact.description}
        keywords="contact Altus Finances Group, contact us, loan customer service, business financing help, Altus Finances customer support"
        path="/contact"
        structuredData={[contactPageSchema, contactBreadcrumb]}
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-4 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl animate-pulse" />
          <div className="absolute -bottom-48 -right-48 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 mb-6">
              <MessageCircle className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-sm font-semibold text-indigo-600">{t.contact.available247}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 bg-clip-text text-transparent">
              {t.contact.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t.contact.subtitle}
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
          >
            {getOfficialStats(t).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.color} mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <Card className="p-10 bg-white shadow-2xl border-0">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900">{t.contact.formTitle}</h2>
                  <p className="text-gray-600">{t.contact.formSubtitle}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium mb-2 block">
                        {t.contact.name}
                      </Label>
                      <Input
                        id="name"
                        data-testid="input-contact-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-12"
                        placeholder={t.contact.namePlaceholder}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium mb-2 block">
                        {t.contact.email}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        data-testid="input-contact-email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-12"
                        placeholder={t.contact.emailPlaceholder}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium mb-2 block">
                      {t.contact.phone}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      data-testid="input-contact-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-12"
                      placeholder={t.contact.phonePlaceholder}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium mb-2 block">
                      {t.contact.message}
                    </Label>
                    <Textarea
                      id="message"
                      data-testid="textarea-contact-message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      placeholder={t.contact.messagePlaceholder}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    data-testid="button-contact-submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-14 text-base font-semibold group" 
                    isLoading={isSubmitting}
                  >
                    {t.contact.send}
                    <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-6"
            >
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="p-8 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-visible">
                      <div className="flex items-start gap-5">
                        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${info.color} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-2 text-gray-900">{info.title}</h3>
                          <p className="text-gray-900 font-semibold mb-1">{info.value}</p>
                          <p className="text-sm text-gray-600">{info.detail}</p>
                        </div>
                      </div>
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${info.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    </Card>
                  </motion.div>
                );
              })}

              {/* Availability Badge */}
              <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900">{t.contact.weAreAvailable}</p>
                    <p className="text-sm text-green-700">{t.contact.responseGuaranteed}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Sparkles className="w-12 h-12 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t.contact.ctaTitle}
            </h2>
            <p className="text-xl text-white/90 mb-10">
              {t.contact.ctaSubtitle}
            </p>
            <a 
              href="/loans/new" 
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold text-lg rounded-xl hover:bg-gray-100 transition-colors"
            >
              {t.contact.ctaButton}
            </a>
          </motion.div>
        </div>
      </section>

      <FooterPremium />
    </div>
  );
}

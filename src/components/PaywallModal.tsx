import { getTranslation } from '../lib/i18n';
import React, { useState, useEffect } from 'react';
import { abtest_init, abtest_track } from '../lib/abtest';
import { motion, AnimatePresence } from 'motion/react';
import { X, BarChart2, ClipboardList, User, ArrowLeftRight, Check, Bell, Download } from 'lucide-react';

/*
  LEMONSQUEEZY SETUP — CREATE 3 PRODUCTS:

  Product 1: MediScan Pro Monthly
    Type: Subscription
    Price: $1.99/month
    Redirect: YOUR_APP_URL#payment-success?plan=monthly&email={email}

  Product 2: MediScan Pro Yearly
    Type: Subscription  
    Price: $9.99/year
    Redirect: YOUR_APP_URL#payment-success?plan=yearly&email={email}

  Product 3: MediScan Lifetime
    Type: Single payment
    Price: $4.99
    Redirect: YOUR_APP_URL#payment-success?plan=lifetime&email={email}

  Then replace the URLs below with real checkout URLs.
*/
const LEMONSQUEEZY_URLS: Record<string, string> = {
  monthly:  "YOUR_MONTHLY_1.99_CHECKOUT_URL",
  yearly:   "YOUR_YEARLY_9.99_CHECKOUT_URL",
  lifetime: "YOUR_LIFETIME_4.99_CHECKOUT_URL"
};

interface PaywallModalProps {
  trigger: string;
  onClose: () => void;
  onSuccess: (plan: string) => void;
}

export default function PaywallModal({ trigger, onClose, onSuccess }: PaywallModalProps) {
  const currentLang = typeof window !== 'undefined' ? (localStorage.getItem('dt_language') || 'en') : 'en';
  const t = (key: string) => getTranslation(currentLang, key);

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  useEffect(() => {
    abtest_init();
    abtest_track('paywall_shown');
  }, []);

  const getTriggerDetails = () => {
    switch (trigger) {
      case 'history':
        return {
          icon: <ClipboardList className="w-6 h-6 text-[#4A7C6F] relative z-10" />,
          title: "Unlock Your Analysis History",
          sub: "Save and revisit all your past prescription analyses anytime."
        };
      case 'compare':
        return {
          icon: <ArrowLeftRight className="w-6 h-6 text-[#4A7C6F] relative z-10" />,
          title: "Drug Comparison is Pro",
          sub: "Compare any two medications side by side for differences and costs."
        };
      case 'profile':
        return {
          icon: <User className="w-6 h-6 text-[#4A7C6F] relative z-10" />,
          title: "Patient Profile is Pro",
          sub: "Save your conditions and allergies for smarter, safer analysis."
        };
      case 'reminders':
        return {
          icon: <Bell className="w-6 h-6 text-[#4A7C6F] relative z-10" />,
          title: "Pill Reminders are Pro",
          sub: "Never miss a dose with smart medication reminders."
        };
      case 'pdf':
        return {
          icon: <Download className="w-6 h-6 text-[#4A7C6F] relative z-10" />,
          title: "PDF Export is Pro",
          sub: "Download a full report of your prescription analysis."
        };
      default:
        return {
          icon: <BarChart2 className="w-6 h-6 text-[#4A7C6F] relative z-10" />,
          title: "Upgrade to Pro",
          sub: "Get unlimited access to all features."
        };
    }
  };

  const details = getTriggerDetails();

  const handleCheckout = () => {
    setLoading(true);
    if (typeof window !== 'undefined' && (window as any).analytics_track) { 
      (window as any).analytics_track('upgrade_clicked', { plan: selectedPlan }); 
    }
    abtest_track('upgrade_clicked');

    const user = JSON.parse(localStorage.getItem('dt_user') || '{}');
    const baseUrl = LEMONSQUEEZY_URLS[selectedPlan];

    if (!baseUrl || baseUrl.includes('YOUR_')) {
      // Simulate purchase in Dev mode
      setTimeout(() => {
        setLoading(false);
        setActivatedPlan(selectedPlan);
        setSuccess(true);
      }, 1500);
      return;
    }

    const checkoutUrl = baseUrl
      + '?checkout[email]=' + encodeURIComponent(user.email || '')
      + '&checkout[custom][user_id]=' + encodeURIComponent(user.id || '')
      + '&checkout[custom][plan]=' + selectedPlan;

    const width  = 480;
    const height = 700;
    const left   = (screen.width  - width)  / 2;
    const top    = (screen.height - height) / 2;

    const popup = window.open(
      checkoutUrl,
      'Checkout',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    const checker = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checker);
        setLoading(false);
        // check payment status from local storage changes 
        // as handled by the hash listener in App.tsx
        const updatedUser = JSON.parse(localStorage.getItem('dt_user') || '{}');
        const paidPlans = ['pro_monthly','pro_yearly','lifetime'];
        if (paidPlans.includes(updatedUser.plan)) {
          setActivatedPlan(selectedPlan);
          setSuccess(true);
        }
      }
    }, 1000);
  };

  const handleActivatePlan = () => {
    onSuccess(activatedPlan);
    
    // Simulate updating user
    const user = JSON.parse(localStorage.getItem('dt_user') || '{}');
    const planLabels: any = { monthly: 'Pro', yearly: 'Pro Yearly', lifetime: 'Lifetime' };
    const billingTypes: any = { monthly: 'monthly', yearly: 'yearly', lifetime: 'once' };
    
    user.plan = activatedPlan === 'monthly' ? 'pro_monthly' : activatedPlan === 'yearly' ? 'pro_yearly' : 'lifetime';
    user.planLabel = planLabels[activatedPlan];
    user.billingType = billingTypes[activatedPlan];
    user.scansLimit = 999999;
    user.upgradedAt = new Date().toISOString();

    localStorage.setItem('dt_user', JSON.stringify(user));
  };

  const getSuccessDetails = () => {
    switch (activatedPlan) {
      case 'monthly': return { emoji: '🎉', title: 'Welcome to Pro!', sub: 'Your monthly plan is now active.\nEnjoy unlimited access to all features.', badge: 'PRO MONTHLY', color: '#4A7C6F' };
      case 'yearly': return { emoji: '🎉', title: 'Welcome to Pro Yearly!', sub: 'Great choice! You saved 58% vs monthly.\nAll features are now unlocked.', badge: 'PRO YEARLY', color: '#4A7C6F' };
      case 'lifetime': return { emoji: '🔓', title: 'Lifetime Access Unlocked!', sub: 'You paid once — yours forever.\nAll current and future Pro features included.', badge: 'LIFETIME', color: '#D97706' };
      default: return { emoji: '🎉', title: 'Welcome to Pro Yearly!', sub: 'Great choice! You saved 58% vs monthly.\nAll features are now unlocked.', badge: 'PRO YEARLY', color: '#4A7C6F' };
    }
  };

  const successData = getSuccessDetails();

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[4px] p-0 sm:p-4 pb-0 sm:pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="absolute inset-0" onClick={() => { if (!loading && !success) onClose(); }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: "100%" }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: "100%" }}
        transition={{ duration: 0.35, ease: [0.34, 1.1, 0.64, 1] }}
        className="relative bg-white w-full max-w-[480px] max-h-[92dvh] overflow-y-auto sm:rounded-[24px] rounded-t-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
      >
        <div className="w-[40px] h-[4px] bg-[#e2e8f0] rounded-[50px] mx-auto mt-[14px] mb-[6px] sm:hidden" />
        
        {success ? (
          <div className="paywall-bottom">
            <div style={{ textAlign: 'center', padding: '40px 28px' }}>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [1.1, 1] }}
                transition={{ type: "spring", duration: 0.4 }}
                style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}
              >
                {successData.emoji}
              </motion.div>
              <div style={{ display: 'inline-block', background: successData.color, color: 'white', borderRadius: '50px', padding: '3px 14px', fontSize: '10px', fontWeight: 800, letterSpacing: '.08em', marginBottom: '12px' }}>
                {successData.badge}
              </div>
              <h3 style={{ fontFamily: 'serif', fontSize: '1.4rem', color: '#1a3330', marginBottom: '10px' }}>
                {successData.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#6b9490', lineHeight: 1.8, marginBottom: '24px', whiteSpace: 'pre-line' }}>
                {successData.sub}
              </p>
              <button
                onClick={handleActivatePlan}
                style={{ width: '100%', height: '52px', background: successData.color, color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(74,124,111,.3)' }}
              >
                Start Exploring →
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="absolute top-4 right-4 z-10 hidden sm:block">
              <button 
                onClick={onClose}
                disabled={loading}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors border-none cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#4A7C6F] to-[#2D6B5E] pt-6 px-6 pb-7 flex flex-col relative text-left">
              <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center mb-[14px]">
                {details.icon}
              </div>
              <h2 className="text-white text-[1.4rem] mb-[6px] font-bold" style={{ fontFamily: 'serif' }}>{details.title}</h2>
              <p className="text-white/80 text-[13px] leading-[1.7] max-w-[340px]">
                {details.sub}
              </p>
            </div>

            <div className="bg-[#f8fffe] px-5 py-3.5 border-b border-[#e2e8f0] flex flex-row gap-4">
              <div className="flex-1">
                <div className="text-[11px] text-[#6b9490] uppercase font-semibold mb-2">You have now (Free)</div>
                <div className="text-[12px] text-gray-700 leading-snug space-y-1.5 font-medium">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-600" /> Unlimited scans</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-600" /> Basic drug info</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-600" /> Basic interactions</div>
                  <div className="flex items-center gap-1.5 opacity-40"><X className="w-3.5 h-3.5" /> History</div>
                  <div className="flex items-center gap-1.5 opacity-40"><X className="w-3.5 h-3.5" /> Compare</div>
                  <div className="flex items-center gap-1.5 opacity-40"><X className="w-3.5 h-3.5" /> Reminders & Profile</div>
                </div>
              </div>
              <div className="flex-1 pl-4 border-l border-[#e2e8f0]">
                <div className="text-[11px] text-[#4A7C6F] uppercase font-bold mb-2">With Pro</div>
                <div className="text-[12px] text-[#1a3330] leading-snug space-y-1.5 font-medium">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A7C6F]" /> Everything in Free</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A7C6F]" /> Full detailed analysis</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A7C6F]" /> History & PDF export</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A7C6F]" /> Compare</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A7C6F]" /> Reminders & Profile</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#4A7C6F]" /> Priority support</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5">
              <div className="text-[15px] font-semibold text-[#1a3330] mb-[14px]">Choose your plan</div>

              <div className="space-y-2.5">
                {/* Monthly */}
                <div 
                  id="plan-card-monthly"
                  onClick={() => setSelectedPlan('monthly')}
                  className={`border-[1.5px] rounded-[16px] p-4 flex items-center justify-between cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'border-[#4A7C6F] bg-[#f5faf9]' : 'border-[#e2e8f0] bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div id="plan-radio-monthly" className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-[#4A7C6F] bg-[#4A7C6F]' : 'border-[#cdcdcd] bg-white'}`}>
                      {selectedPlan === 'monthly' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <div>
                      <div className="text-[14px] font-[700] text-[#1a3330]">Monthly</div>
                      <div className="text-[12px] text-[#6b9490]">Billed every month</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[20px] font-[900] text-[#1a3330] leading-none">$1.99</div>
                    <div className="text-[12px] text-[#6b9490] mt-1">/month</div>
                  </div>
                </div>

                {/* Yearly */}
                <div 
                  id="plan-card-yearly"
                  onClick={() => setSelectedPlan('yearly')}
                  className={`border-[2px] rounded-[16px] p-4 relative cursor-pointer transition-all ${selectedPlan === 'yearly' ? 'border-[#4A7C6F] bg-[#f5faf9]' : 'border-[#e2e8f0] bg-white'}`}
                >
                  <div className="absolute top-[-10px] left-[16px] bg-[#4A7C6F] text-white rounded-[50px] px-3 py-0.5 text-[10px] font-bold tracking-[0.05em]">BEST VALUE</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div id="plan-radio-yearly" className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'yearly' ? 'border-[#4A7C6F] bg-[#4A7C6F]' : 'border-[#cdcdcd] bg-white'}`}>
                        {selectedPlan === 'yearly' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                      </div>
                      <div>
                        <div className="text-[14px] font-[700] text-[#1a3330]">Yearly</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[12px] font-[600] text-[#4A7C6F]">$0.83/month</span>
                          <span className="text-[11px] font-[700] text-[#16A34A]">· Save 58%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[20px] font-[900] text-[#1a3330] leading-none">$9.99</div>
                      <div className="text-[12px] text-[#6b9490] mt-1 flex items-center justify-end gap-1">
                        /year <span className="text-[11px] text-[#9ca3af] line-through">$23.88</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lifetime */}
                <div 
                  id="plan-card-lifetime"
                  onClick={() => setSelectedPlan('lifetime')}
                  className={`border-[1.5px] rounded-[16px] p-4 relative cursor-pointer transition-all ${selectedPlan === 'lifetime' ? 'border-[#D97706] bg-[#fffdf5]' : 'border-[#e2e8f0] bg-white'}`}
                >
                  <div className="absolute top-[-10px] left-[16px] bg-[#D97706] text-white rounded-[50px] px-3 py-0.5 text-[10px] font-bold">🔥 MOST POPULAR</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div id="plan-radio-lifetime" className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'lifetime' ? 'border-[#D97706] bg-[#D97706]' : 'border-[#cdcdcd] bg-white'}`}>
                        {selectedPlan === 'lifetime' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                      </div>
                      <div>
                        <div className="text-[14px] font-[700] text-[#1a3330]">Lifetime Access</div>
                        <div className="text-[12px] font-[600] text-[#D97706]">Pay once, yours forever</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[20px] font-[900] text-[#1a3330] leading-none">$4.99</div>
                      <div className="text-[12px] text-[#6b9490] mt-1">one-time</div>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                id="paywall-cta-btn"
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full h-[52px] rounded-[14px] border-none text-[16px] font-[700] text-white mt-[16px] cursor-pointer transition-all flex items-center justify-center ${selectedPlan === 'lifetime' ? 'bg-gradient-to-br from-[#D97706] to-[#B45309] shadow-[0_4px_20px_rgba(217,119,6,.35)]' : 'bg-[#4A7C6F] shadow-[0_4px_20px_rgba(74,124,111,.35)]'}`}
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  selectedPlan === 'monthly' ? 'Start Monthly — $1.99/mo' :
                  selectedPlan === 'yearly' ? 'Start Yearly — $9.99/yr' :
                  'Get Lifetime Access — $4.99'
                )}
              </button>
              
              <div className="flex justify-center gap-4 mt-3 text-[11px] text-[#6b9490]">
                <div className="flex items-center gap-1"><Check className="w-3 h-3" /> Cancel anytime</div>
                <div className="flex items-center gap-1"><Check className="w-3 h-3" /> 7-day free trial</div>
                <div className="flex items-center gap-1"><Check className="w-3 h-3" /> Secure checkout</div>
              </div>

              {!loading && (
                <div className="text-center mt-2.5">
                   <button onClick={onClose} className="text-[13px] text-[#6b9490] hover:text-[#4A7C6F] font-[500] bg-transparent border-none cursor-pointer p-2">
                     Continue with Free plan →
                   </button>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

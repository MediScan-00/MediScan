import { LANGUAGES, getTranslation } from '../lib/i18n';
import React, { useState, useRef, useEffect } from 'react';
import { Pill, Mail, Lock, Eye, EyeOff, Check, User, Globe, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Logo } from './Logo';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

interface AuthScreenProps {
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  onLogin: (user: any) => void;
  currentLang: string;
  setCurrentLang: (l: string) => void;
}

export default function AuthScreen({ onLogin, currentLang, setCurrentLang, onOpenTerms, onOpenPrivacy }: AuthScreenProps) {
  const t = (key: string) => getTranslation(currentLang, key);
  
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const langObj = LANGUAGES[currentLang] || LANGUAGES.en;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState(() => localStorage.getItem('dt_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('dt_remembered_email'));
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const [socialProvider, setSocialProvider] = useState<'Google' | 'Apple' | null>(null);
  const [socialName, setSocialName] = useState('');
  const [socialEmail, setSocialEmail] = useState('');
  const [socialError, setSocialError] = useState<{text: string; color: string} | null>(null);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [globalError, setGlobalError] = useState('');

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);
  const strengthColors = ['bg-gray-200', 'bg-[#EF4444]', 'bg-[#F97316]', 'bg-[#EAB308]', 'bg-[#22C55E]'];
  const strengthLabels = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColorLabels = ['#9ca3af', '#EF4444', '#F97316', '#EAB308', '#22C55E'];
  const strengthColor = password.length === 0 ? strengthColors[0] : strengthColors[strength === 0 ? 1 : Math.min(strength, 4)];
  const labelColor = password.length === 0 ? strengthColorLabels[0] : strengthColorLabels[strength === 0 ? 1 : Math.min(strength, 4)];

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setNameError('');
    setConfirmError('');
    setTermsError('');
    setGlobalError('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    let valid = true;

    if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Please enter a valid email address');
      valid = false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    if (!valid) {
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('dt_remembered_email', email);
      } else {
        localStorage.removeItem('dt_remembered_email');
      }

      await signInWithEmailAndPassword(auth, email, password);

      const user = {
        name: email.split('@')[0],
        email: email,
        plan: 'free',
        planLabel: 'Free',
        billingType: 'free',
        scansUsed: 0,
        scansLimit: 999999,
        joinDate: new Date().toISOString(),
        lastResetMonth: new Date().getMonth(),
        id: Date.now().toString()
      };
      
      const isNew = !localStorage.getItem('dt_welcomed');
      if (isNew) {
        localStorage.setItem('dt_welcomed', 'true');
        setTimeout(() => {
          const toast = document.createElement('div');
          toast.style.cssText = `
            position:fixed;
            bottom:calc(80px + env(safe-area-inset-bottom));
            left:50%;transform:translateX(-50%);
            background:#4A7C6F;color:white;
            padding:12px 24px;border-radius:50px;
            font-size:14px;font-weight:700;
            z-index:9999;white-space:nowrap;
            box-shadow:0 4px 20px rgba(74,124,111,.3);
            opacity:0; transition:opacity 0.3s ease;
          `;
          toast.textContent = `👋 Welcome, ${user.name}!`;
          document.body.appendChild(toast);
          setTimeout(() => { toast.style.opacity = '1'; }, 50);
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        }, 500);
      }

      localStorage.setItem('dt_user', JSON.stringify(user));
      onLogin(user);
    } catch (error: any) {
      setGlobalError('Email or password is incorrect');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    let valid = true;

    if (fullName.length < 2) {
      setNameError('Please enter your full name');
      valid = false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Please enter a valid email address');
      valid = false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    }
    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    }
    if (!agreeTerms) {
      setTermsError('Please accept the terms to continue');
      valid = false;
    }

    if (!valid) {
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('dt_remembered_email', email);
      } else {
        localStorage.removeItem('dt_remembered_email');
      }

      await createUserWithEmailAndPassword(auth, email, password);

      const user = {
        name: fullName,
        email: email,
        plan: 'free',
        planLabel: 'Free',
        billingType: 'free',
        scansUsed: 0,
        scansLimit: 999999,
        joinDate: new Date().toISOString(),
        lastResetMonth: new Date().getMonth(),
        id: Date.now().toString()
      };
      
      const isNew = !localStorage.getItem('dt_welcomed');
      if (isNew) {
        localStorage.setItem('dt_welcomed', 'true');
        setTimeout(() => {
          const toast = document.createElement('div');
          toast.style.cssText = `
            position:fixed;
            bottom:calc(80px + env(safe-area-inset-bottom));
            left:50%;transform:translateX(-50%);
            background:#4A7C6F;color:white;
            padding:12px 24px;border-radius:50px;
            font-size:14px;font-weight:700;
            z-index:9999;white-space:nowrap;
            box-shadow:0 4px 20px rgba(74,124,111,.3);
            opacity:0; transition:opacity 0.3s ease;
          `;
          toast.textContent = `👋 Welcome, ${user.name.split(' ')[0]}!`;
          document.body.appendChild(toast);
          setTimeout(() => { toast.style.opacity = '1'; }, 50);
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        }, 500);
      }

      localStorage.setItem('dt_user', JSON.stringify(user));
      onLogin(user);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setGlobalError('User already exists. Please sign in');
      } else {
        setGlobalError(error.message || 'Failed to sign up');
      }
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes('@') || !forgotEmail.includes('.')) {
      setEmailError('Please enter a valid email address');
      triggerShake();
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotSuccess(true);
    }, 1000);
  }

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const user = {
        name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        email: result.user.email,
        plan: 'free',
        planLabel: 'Free',
        billingType: 'free',
        scansUsed: 0,
        scansLimit: 999999,
        joinDate: new Date().toISOString(),
        lastResetMonth: new Date().getMonth(),
        id: result.user.uid
      };
      
      const isNew = !localStorage.getItem('dt_welcomed');
      if (isNew) {
        localStorage.setItem('dt_welcomed', 'true');
        setTimeout(() => {
          const toast = document.createElement('div');
          toast.style.cssText = `
            position:fixed;
            bottom:calc(80px + env(safe-area-inset-bottom));
            left:50%;transform:translateX(-50%);
            background:#4A7C6F;color:white;
            padding:12px 24px;border-radius:50px;
            font-size:14px;font-weight:700;
            z-index:9999;white-space:nowrap;
            box-shadow:0 4px 20px rgba(74,124,111,.3);
            opacity:0; transition:opacity 0.3s ease;
          `;
          toast.textContent = `👋 Welcome, ${user.name.split(' ')[0]}!`;
          document.body.appendChild(toast);
          setTimeout(() => { toast.style.opacity = '1'; }, 50);
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        }, 500);
      }

      localStorage.setItem('dt_user', JSON.stringify(user));
      onLogin(user);
    } catch (error: any) {
      setGlobalError(error.message || 'Authentication failed');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    try {
      setIsLoading(true);
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      
      const user = {
        name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        email: result.user.email,
        plan: 'free',
        planLabel: 'Free',
        billingType: 'free',
        scansUsed: 0,
        scansLimit: 999999,
        joinDate: new Date().toISOString(),
        lastResetMonth: new Date().getMonth(),
        id: result.user.uid
      };
      
      const isNew = !localStorage.getItem('dt_welcomed');
      if (isNew) {
        localStorage.setItem('dt_welcomed', 'true');
        setTimeout(() => {
          const toast = document.createElement('div');
          toast.style.cssText = `
            position:fixed;
            bottom:calc(80px + env(safe-area-inset-bottom));
            left:50%;transform:translateX(-50%);
            background:#4A7C6F;color:white;
            padding:12px 24px;border-radius:50px;
            font-size:14px;font-weight:700;
            z-index:9999;white-space:nowrap;
            box-shadow:0 4px 20px rgba(74,124,111,.3);
            opacity:0; transition:opacity 0.3s ease;
          `;
          toast.textContent = `👋 Welcome, ${user.name.split(' ')[0]}!`;
          document.body.appendChild(toast);
          setTimeout(() => { toast.style.opacity = '1'; }, 50);
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        }, 500);
      }

      localStorage.setItem('dt_user', JSON.stringify(user));
      onLogin(user);
    } catch (error: any) {
      setGlobalError(error.message || 'Authentication failed');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  const AppleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );

  return (
    <>
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(160deg, #EDF5F3 0%, #D6EFEB 50%, #EDF5F3 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px', overflowY: 'auto', minHeight: '100dvh'
      }}
    >
      <div className="absolute top-4 right-4" ref={langRef}>
        <button
          onClick={() => setShowLangDropdown(!showLangDropdown)}
          className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-xl shadow-sm border border-[#e2e8f0] transition-all cursor-pointer"
        >
          <span className="text-lg leading-none select-none">{langObj.flag}</span>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">{langObj.name}</span>
          <Globe className="w-4 h-4 text-slate-400" />
        </button>
        <AnimatePresence>
          {showLangDropdown && (
             <motion.div
               initial={{ opacity: 0, y: 8, scale: 0.96 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 8, scale: 0.96 }}
               transition={{ duration: 0.15 }}
               className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 text-left"
             >
               <div className="max-h-[300px] overflow-y-auto overscroll-contain">
                 {Object.entries(LANGUAGES).map(([code, lang]) => (
                   <button
                     key={code}
                     onClick={() => {
                       setCurrentLang(code);
                       localStorage.setItem('dt_language', code);
                       setShowLangDropdown(false);
                     }}
                     className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 ${currentLang === code ? 'bg-teal-50/50 text-teal-700' : 'text-slate-700'}`}
                   >
                     <span className="text-xl">{lang.flag}</span>
                     <span className="font-medium text-[15px]">{lang.native}</span>
                   </button>
                 ))}
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.97 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.45, ease: [0.34, 1.1, 0.64, 1] }}
        className="w-full flex flex-col items-center my-auto py-8"
        style={{ maxWidth: '380px' }}
      >
        <div className="logo-icon-wrap" style={{ width: 80, height: 80, margin: '0 auto 16px', borderRadius: 16, filter: 'drop-shadow(0 8px 24px rgba(74,124,111,.2))' }}>
          <Logo uniqueId="auth" className="logo-svg-bg"/>
        </div>
        <h1 style={{ display: 'flex', justifyContent: 'center', fontSize: '1.6rem', textAlign: 'center', marginBottom: 4, margin: '0 0 4px 0' }}>
          <span className="logo-medi">Medi</span>
          <span className="logo-scan">Scan</span>
        </h1>
        <p style={{ fontFamily: 'sans-serif', fontSize: '13px', color: '#6b9490', textAlign: 'center', margin: '0 0 24px 0' }}>Smart Pharmacist Assistant</p>

        <motion.div 
           animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}}
           transition={{ duration: 0.4 }}
           className="auth-card" 
           style={{ background: 'white', borderRadius: 24, boxShadow: '0 4px 6px rgba(0,0,0,.04), 0 20px 48px rgba(74,124,111,.10)', padding: '28px 24px', width: '100%' }}
        >
          {mode === 'forgot' ? (
            <AnimatePresence mode="wait">
              {!forgotSuccess ? (
                <motion.div key="forgot-form" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}}>
                  <button onClick={() => { setMode('signin'); clearErrors(); }} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4A7C6F] mb-6 hover:underline bg-transparent border-none cursor-pointer p-0">
                     <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <h2 className="text-[1.3rem] font-bold text-[#1a3330] mb-2">Reset Password</h2>
                  <p className="text-[14px] text-[#6b9490] mb-6">Enter your email and we'll send you a reset link</p>
                  
                  <div className="mb-4">
                    <label className="block text-[#374151] text-[13px] font-[600] mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-[14px] top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full h-[52px] pl-[44px] pr-[16px] border-[1.5px] border-[#e2e8f0] rounded-[12px] text-[16px] text-[#1a3330] bg-white outline-none transition-all placeholder:text-[#9ca3af] focus:border-[#4A7C6F] focus:shadow-[0_0_0_3px_rgba(74,124,111,.12)]"
                        style={{ WebkitAppearance: 'none' }}
                      />
                    </div>
                    {emailError && <p className="text-[12px] text-[#DC2626] mt-1 font-sans">{emailError}</p>}
                  </div>

                  <button
                    onClick={handleForgot}
                    disabled={isLoading}
                    className="w-full h-[52px] bg-[#4A7C6F] hover:bg-[#3D6B61] active:scale-[0.99] text-white rounded-[14px] font-[700] text-[16px] transition-all flex items-center justify-center gap-2 mt-5 shadow-[0_4px_16px_rgba(74,124,111,.3)] hover:shadow-[0_6px_24px_rgba(74,124,111,.4)] border-none cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2.5">
                        <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : 'Send Reset Link'}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="forgot-success" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="text-center py-4">
                  <div className="w-16 h-16 bg-[#f0fffe] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#4A7C6F]">
                     <Mail className="w-8 h-8 text-[#4A7C6F]" />
                  </div>
                  <h2 className="text-[1.2rem] font-bold text-[#1a3330] mb-2">Check your inbox!</h2>
                  <p className="text-[14px] text-[#6b9490] mb-8">We sent a reset link to {forgotEmail}</p>
                  
                  <button
                    onClick={() => { setMode('signin'); setForgotSuccess(false); setForgotEmail(''); clearErrors(); }}
                    className="w-full h-[52px] bg-white text-[#4A7C6F] border-2 border-[#e2e8f0] hover:bg-[#f8fffe] hover:border-[#4A7C6F] active:scale-[0.99] rounded-[14px] font-[700] text-[15px] transition-all flex items-center justify-center cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <>
              {/* Toggle */}
              <div style={{ background: '#f1f5f4', borderRadius: 12, padding: 4, display: 'flex', gap: 4, marginBottom: 24 }}>
                <button
                  onClick={() => { setMode('signin'); clearErrors(); }}
                  style={{ flex: 1, height: 40, border: 'none', borderRadius: 10, fontFamily: 'sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', ...(mode === 'signin' ? { background: 'white', color: '#1a3330', boxShadow: '0 2px 8px rgba(0,0,0,.08)' } : { background: 'transparent', color: '#6b9490' }) }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('signup'); clearErrors(); }}
                  style={{ flex: 1, height: 40, border: 'none', borderRadius: 10, fontFamily: 'sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', ...(mode === 'signup' ? { background: 'white', color: '#1a3330', boxShadow: '0 2px 8px rgba(0,0,0,.08)' } : { background: 'transparent', color: '#6b9490' }) }}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
                <AnimatePresence mode="wait">
                  {mode === 'signup' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ marginBottom: 16 }}>
                        <label className="block text-[#374151] text-[13px] font-[600] mb-1.5">Full Name</label>
                        <div className="relative">
                          <svg className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                             <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          <input
                            id="signup-name"
                            type="text"
                            placeholder="John Smith"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={`w-full h-[52px] pl-[44px] pr-[16px] border-[1.5px] rounded-[12px] text-[16px] text-[#1a3330] bg-white outline-none transition-all placeholder:text-[#9ca3af] ${nameError ? 'border-[#DC2626] shadow-[0_0_0_3px_rgba(220,38,38,.10)]' : 'border-[#e2e8f0] focus:border-[#4A7C6F] focus:shadow-[0_0_0_3px_rgba(74,124,111,.12)]'}`}
                            style={{ WebkitAppearance: 'none' }}
                          />
                        </div>
                        {nameError && <p className="text-[12px] text-[#DC2626] mt-1 font-sans">{nameError}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ marginBottom: 16 }}>
                  <label className="block text-[#374151] text-[13px] font-[600] mb-1.5">Email Address</label>
                  <div className="relative">
                    <svg className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      id={mode === 'signin' ? 'signin-email' : 'signup-email'}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full h-[52px] pl-[44px] pr-[16px] border-[1.5px] rounded-[12px] text-[16px] text-[#1a3330] bg-white outline-none transition-all placeholder:text-[#9ca3af] ${emailError ? 'border-[#DC2626] shadow-[0_0_0_3px_rgba(220,38,38,.10)]' : 'border-[#e2e8f0] focus:border-[#4A7C6F] focus:shadow-[0_0_0_3px_rgba(74,124,111,.12)]'}`}
                      style={{ WebkitAppearance: 'none' }}
                    />
                  </div>
                  {emailError && <p className="text-[12px] text-[#DC2626] mt-1 font-sans">{emailError}</p>}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="block text-[#374151] text-[13px] font-[600] mb-1.5">Password</label>
                  <div className="relative">
                    <svg className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                       <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    <input
                      id={mode === 'signin' ? 'signin-password' : 'signup-password'}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full h-[52px] pl-[44px] pr-[44px] border-[1.5px] rounded-[12px] text-[16px] text-[#1a3330] bg-white outline-none transition-all placeholder:text-[#9ca3af] ${passwordError ? 'border-[#DC2626] shadow-[0_0_0_3px_rgba(220,38,38,.10)]' : 'border-[#e2e8f0] focus:border-[#4A7C6F] focus:shadow-[0_0_0_3px_rgba(74,124,111,.12)]'}`}
                      style={{ WebkitAppearance: 'none' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                      {showPassword ? (
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      ) : (
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      )}
                    </button>
                  </div>
                  {passwordError && <p className="text-[12px] text-[#DC2626] mt-1 font-sans">{passwordError}</p>}
                  
                  {mode === 'signup' && (
                    <div className="mt-1.5">
                      <div className="flex gap-[4px] h-[3px] rounded-[50px] overflow-hidden">
                        {[1, 2, 3, 4].map((level) => (
                          <div key={level} className={`flex-1 transition-colors duration-300 ${strength >= level || (level === 1 && password.length > 0) ? strengthColor : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-[11px] mt-1 font-sans" style={{ color: labelColor }}>{strengthLabels[strength === 0 ? (password.length > 0 ? 1 : 0) : Math.min(strength, 4)]}</p>
                    </div>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {mode === 'signup' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ marginBottom: 16 }}>
                        <label className="block text-[#374151] text-[13px] font-[600] mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <svg className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                             <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                          </svg>
                          <input
                            id="signup-confirm"
                            type={showPassword ? "text" : "password"}
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full h-[52px] pl-[44px] pr-[44px] border-[1.5px] rounded-[12px] text-[16px] text-[#1a3330] bg-white outline-none transition-all placeholder:text-[#9ca3af] ${confirmError ? 'border-[#DC2626] shadow-[0_0_0_3px_rgba(220,38,38,.10)]' : 'border-[#e2e8f0] focus:border-[#4A7C6F] focus:shadow-[0_0_0_3px_rgba(74,124,111,.12)]'}`}
                            style={{ WebkitAppearance: 'none' }}
                          />
                          {confirmPassword.length > 0 && confirmPassword === password && (
                             <Check className="absolute right-[14px] top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {confirmError && <p className="text-[12px] text-[#DC2626] mt-1 font-sans">{confirmError}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {mode === 'signin' && (
                  <div className="flex items-center justify-between mb-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-[14px] h-[14px] rounded border-[#e2e8f0] text-[#4A7C6F] focus:ring-[#4A7C6F] cursor-pointer outline-none" />
                      <span className="text-[13px] text-[#374151]">Remember me</span>
                    </label>
                    <button type="button" onClick={() => { setMode('forgot'); clearErrors(); }} className="text-[13px] font-[600] text-[#4A7C6F] hover:underline bg-transparent border-none cursor-pointer p-0">
                      Forgot password?
                    </button>
                  </div>
                )}

                {mode === 'signup' && (
                   <div className="mb-1 mt-2">
                     <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className={`mt-0.5 w-[14px] h-[14px] rounded border text-[#4A7C6F] focus:ring-[#4A7C6F] cursor-pointer outline-none transition-colors ${termsError ? 'border-[#DC2626]' : 'border-[#e2e8f0]'}`} 
                      />
                      <span className="text-[12px] leading-snug text-[#374151]">
                        I agree to the <button type="button" onClick={(e) => { e.preventDefault(); onOpenTerms(); }} className="font-[600] text-[#4A7C6F] hover:underline border-none bg-transparent p-0 cursor-pointer">Terms of Service</button> and <button type="button" onClick={(e) => { e.preventDefault(); onOpenPrivacy(); }} className="font-[600] text-[#4A7C6F] hover:underline border-none bg-transparent p-0 cursor-pointer">Privacy Policy</button>
                      </span>
                    </label>
                    {termsError && <p className="text-[12px] text-[#DC2626] mt-1 font-sans">{termsError}</p>}
                   </div>
                )}

                {globalError && (
                  <p className="text-center text-[13px] text-[#DC2626] font-semibold mt-4">{globalError}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[52px] bg-[#4A7C6F] hover:bg-[#3D6B61] active:scale-[0.99] text-white rounded-[14px] font-[700] text-[16px] transition-all flex items-center justify-center gap-2 mt-5 shadow-[0_4px_16px_rgba(74,124,111,.3)] hover:shadow-[0_6px_24px_rgba(74,124,111,.4)] border-none cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2.5">
                      <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                    </div>
                  ) : (
                    mode === 'signin' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <span style={{ flex: 1, height: 1, background: '#e2e8f0' }}></span>
                <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap', fontFamily: 'sans-serif' }}>or continue with</span>
                <span style={{ flex: 1, height: 1, background: '#e2e8f0' }}></span>
              </div>

              <div className="flex flex-col gap-2.5 mb-4">
                <button 
                  type="button" 
                  onClick={handleGoogleAuth}
                  style={{ width: '100%', height: 48, background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'sans-serif', fontWeight: 500, fontSize: 14, color: '#374151', cursor: 'pointer', transition: 'all 0.2s' }}
                  className="hover:bg-[#f9fafb] hover:border-[#d1d5db]"
                >
                  <GoogleIcon /> Continue with Google
                </button>
                <button 
                  type="button" 
                  onClick={handleAppleAuth}
                  style={{ width: '100%', height: 48, background: '#000000', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: 'sans-serif', fontWeight: 500, fontSize: 14, color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}
                  className="hover:bg-[#1a1a1a]"
                >
                  <AppleIcon /> Continue with Apple
                </button>
              </div>

              <div className="text-center mt-2">
                <button
                   onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); clearErrors(); }}
                   className="text-[13px] text-[#9ca3af] font-medium bg-transparent border-none cursor-pointer p-0"
                >
                   {mode === 'signin' ? (
                     <>Don't have an account? <span className="text-[#4A7C6F] hover:underline">Sign up &rarr;</span></>
                   ) : (
                     <>Already have an account? <span className="text-[#4A7C6F] hover:underline">Sign in &rarr;</span></>
                   )}
                </button>
              </div>
            </>
          )}
        </motion.div>

        <div style={{ maxWidth: 340, margin: '16px auto 0' }}>
           <div style={{ background: 'rgba(255,255,255,.7)', border: '1px solid rgba(74,124,111,.15)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
             <Lock className="w-4 h-4 text-[#4A7C6F] shrink-0 mt-0.5" />
             <p style={{ fontSize: 12, color: '#5a7269', lineHeight: 1.6, margin: 0 }}>
               Your data stays on your device. We never store or share your medical information.
             </p>
           </div>
        </div>
      </motion.div>

      {/* Old Social Popup removed in favor of Firebase Native popups */}
    </div>
    </>
  );
}

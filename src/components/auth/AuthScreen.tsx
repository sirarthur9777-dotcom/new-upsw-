import React, { useState } from 'react';
import {
  Sun,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  X,
  Send,
  Sparkles
} from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  db,
  doc,
  setDoc
} from '../../lib/firebase';
import { useApp } from '../../context/AppContext';

export const AuthScreen: React.FC = () => {
  const { companySettings, isDarkMode, loginAsDemo } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Password Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Validation
  const validateEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());

  // Save User Profile to Firestore
  const saveUserProfileToFirestore = async (user: any, nameOverride?: string) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          displayName: nameOverride || user.displayName || 'Solar Enterprise User',
          email: user.email,
          photoURL: user.photoURL || null,
          role: 'Admin',
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore profile sync note:', err);
    }
  };

  // Set Firebase Persistence based on "Remember Me"
  const applyPersistence = async () => {
    try {
      const mode = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, mode);
    } catch (e) {
      console.warn('Persistence configuration note:', e);
    }
  };

  // Email / Password Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Field Validations
    if (!email.trim() || !validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);

    try {
      await applyPersistence();

      if (isSignUp) {
        // Sign Up Flow
        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (res.user) {
          await updateProfile(res.user, { displayName: fullName.trim() });
          await saveUserProfileToFirestore(res.user, fullName.trim());
        }
        setSuccessMsg('Account created successfully! Redirecting to dashboard...');
      } else {
        // Sign In Flow
        const res = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (res.user) {
          await saveUserProfileToFirestore(res.user);
        }
        setSuccessMsg('Sign in successful! Loading your dashboard...');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        setErrorMsg('Firebase Authentication provider is not enabled in the Firebase Console. Activating Demo Admin mode...');
        setSuccessMsg('Entering Demo Admin ERP Session...');
        setTimeout(() => {
          loginAsDemo(email.trim() || 'admin@solarix.com', fullName.trim() || 'Solar Admin');
        }, 1000);
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email address is already registered. Please sign in instead.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMsg('No user account found with this email.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Access temporarily blocked due to multiple failed attempts. Try again later.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Authentication Handler
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await applyPersistence();
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await saveUserProfileToFirestore(res.user);
        setSuccessMsg('Successfully authenticated with Google!');
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        setErrorMsg('Google Sign-In is not enabled in Firebase Console. Activating Demo Admin mode...');
        setSuccessMsg('Entering Demo Admin ERP Session...');
        setTimeout(() => {
          loginAsDemo('google.user@solarix.com', 'Google Admin (Demo)');
        }, 1000);
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setErrorMsg('This domain is not authorized in Firebase Console (Authentication > Settings > Authorized Domains). Adding Netlify domain to Firebase authorized domains is required.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);

    if (!resetEmail.trim() || !validateEmail(resetEmail)) {
      setResetStatus({ type: 'error', msg: 'Please enter a valid email address.' });
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetStatus({
        type: 'success',
        msg: `Password reset instructions sent to ${resetEmail}. Please check your inbox.`
      });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        setResetStatus({
          type: 'error',
          msg: 'Password reset via email is not enabled in Firebase Console. You can use Demo Admin access.'
        });
      } else if (err.code === 'auth/user-not-found') {
        setResetStatus({ type: 'error', msg: 'No account found with this email address.' });
      } else {
        setResetStatus({ type: 'error', msg: err.message || 'Failed to send password reset email.' });
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#E9EEE9] dark:bg-[#16211A] text-[#26372D] dark:text-[#E5ECE7] flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden selection:bg-[#25845A]/25 selection:text-[#25845A]">
      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-[#E9EEE9] dark:bg-[#1B2720] rounded-3xl border border-white/80 dark:border-white/10 shadow-[10px_10px_26px_rgba(175,192,178,0.75),-10px_-10px_26px_rgba(255,255,255,0.95)] dark:shadow-[10px_10px_26px_rgba(10,15,12,0.85),-6px_-6px_18px_rgba(38,54,44,0.4)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 my-auto">
        {/* LEFT COLUMN: SOLAR ENTERPRISE BRANDING (5 COLS ON DESKTOP) */}
        <div className="lg:col-span-5 bg-[#E1E8E1] dark:bg-[#141E17] p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#D5E1D7] dark:border-[#223328] relative overflow-hidden">
          {/* Top Brand Header */}
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              {companySettings.logoUrl ? (
                <img
                  src={companySettings.logoUrl}
                  alt="Upadhyay Brother Solar Works"
                  className="w-14 h-14 rounded-2xl object-contain bg-[#E9EEE9] p-1.5 shadow-[3px_3px_8px_rgba(175,192,178,0.7),-3px_-3px_8px_rgba(255,255,255,0.9)] dark:shadow-[3px_3px_8px_rgba(10,15,12,0.8)] shrink-0 border border-white/80 dark:border-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#25845A] shadow-[3px_3px_8px_rgba(37,132,90,0.4),-2px_-2px_6px_rgba(255,255,255,0.8)] flex items-center justify-center shrink-0 text-white font-bold">
                  <Sun className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-base font-black tracking-tight text-[#26372D] dark:text-white leading-tight">
                  {companySettings.companyName}
                </h1>
                <p className="text-[10px] font-bold text-[#25845A] dark:text-[#38B57D] uppercase tracking-wider">
                  Babhanauli Damrua, Jaunpur
                </p>
                <p className="text-[10px] text-[#728078] dark:text-[#8E9F95] font-mono">
                  GSTIN: {companySettings.gstNumber} · {companySettings.phone}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-2xl lg:text-3xl font-black text-[#26372D] dark:text-white leading-tight">
                Empowering Clean Energy <span className="text-[#25845A] dark:text-[#38B57D]">Operations</span>
              </h2>
              <p className="text-xs text-[#728078] dark:text-[#8E9F95] leading-relaxed">
                Streamline customer CRM, solar projects, GST billing, inventory, and cloud analytics in one secure portal.
              </p>
            </div>
          </div>

          {/* Key Feature Highlights */}
          <div className="my-8 space-y-3 relative z-10">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#E9EEE9] dark:bg-[#1A261F] border border-white/70 dark:border-white/10 shadow-[2.5px_2.5px_6px_rgba(175,192,178,0.6),-2.5px_-2.5px_6px_rgba(255,255,255,0.9)] dark:shadow-[2px_2px_5px_rgba(10,15,12,0.7)]">
              <div className="p-2 rounded-xl bg-[#25845A]/15 text-[#25845A] shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">Realtime GST Billing & Invoicing</p>
                <p className="text-[10px] text-[#728078] dark:text-[#8E9F95]">Automated CGST/SGST calculations and QR payments</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#E9EEE9] dark:bg-[#1A261F] border border-white/70 dark:border-white/10 shadow-[2.5px_2.5px_6px_rgba(175,192,178,0.6),-2.5px_-2.5px_6px_rgba(255,255,255,0.9)] dark:shadow-[2px_2px_5px_rgba(10,15,12,0.7)]">
              <div className="p-2 rounded-xl bg-[#D97706]/15 text-[#D97706] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">Cloud Data Encryption & Sync</p>
                <p className="text-[10px] text-[#728078] dark:text-[#8E9F95]">Firebase Firestore persistent cloud infrastructure</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#E9EEE9] dark:bg-[#1A261F] border border-white/70 dark:border-white/10 shadow-[2.5px_2.5px_6px_rgba(175,192,178,0.6),-2.5px_-2.5px_6px_rgba(255,255,255,0.9)] dark:shadow-[2px_2px_5px_rgba(10,15,12,0.7)]">
              <div className="p-2 rounded-xl bg-[#25845A]/15 text-[#25845A] shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">Govt. Subsidy & Project Tracker</p>
                <p className="text-[10px] text-[#728078] dark:text-[#8E9F95]">Complete end-to-end solar installation lifecycle</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="pt-4 border-t border-[#D5E1D7] dark:border-[#223328] flex items-center justify-between text-[11px] text-[#728078] dark:text-[#8E9F95] relative z-10">
            <span className="flex items-center gap-1.5 font-semibold">
              <Award className="w-3.5 h-3.5 text-[#25845A]" />
              <span>Enterprise Grade Security</span>
            </span>
            <span className="font-mono text-[10px] text-[#25845A] dark:text-[#38B57D] font-bold">Cloud Connected</span>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHENTICATION FORM (7 COLS ON DESKTOP) */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-[#E9EEE9] dark:bg-[#1B2720]">
          <div className="max-w-md mx-auto w-full space-y-6">
            {/* Tab Switcher Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-[#26372D] dark:text-white tracking-tight">
                  {isSignUp ? 'Create Your Account' : 'Welcome Back'}
                </h3>
                <p className="text-xs text-[#728078] dark:text-[#8E9F95] mt-1">
                  {isSignUp
                    ? 'Fill in details below to register for Solar ERP'
                    : 'Enter your credentials to access the ERP dashboard'}
                </p>
              </div>

              {/* Toggle Segmented Switch */}
              <div className="p-1 bg-[#E1E8E1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] dark:shadow-[inset_1.5px_1.5px_3.5px_rgba(9,14,11,0.85)] rounded-2xl flex border border-white/40 dark:border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    !isSignUp
                      ? 'bg-[#E9EEE9] dark:bg-[#1B2720] text-[#25845A] dark:text-[#38B57D] shadow-[2px_2px_5px_rgba(175,192,178,0.7),-2px_-2px_5px_rgba(255,255,255,0.95)]'
                      : 'text-[#728078] hover:text-[#26372D]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSignUp
                      ? 'bg-[#E9EEE9] dark:bg-[#1B2720] text-[#25845A] dark:text-[#38B57D] shadow-[2px_2px_5px_rgba(175,192,178,0.7),-2px_-2px_5px_rgba(255,255,255,0.95)]'
                      : 'text-[#728078] hover:text-[#26372D]'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-[#DC2626]/12 border border-[#DC2626]/30 text-[#DC2626] text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
                <span className="font-semibold leading-snug">{errorMsg}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-[#25845A]/12 border border-[#25845A]/30 text-[#25845A] dark:text-[#38B57D] text-xs flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#25845A]" />
                <span className="font-semibold leading-snug">{successMsg}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field (Sign Up Only) */}
              {isSignUp && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#728078]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] dark:shadow-[inset_1.5px_1.5px_3.5px_rgba(9,14,11,0.85)] border border-transparent focus:border-[#25845A] text-[#26372D] dark:text-[#E5ECE7] text-xs placeholder:text-[#8E9F95] focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              {/* Email Address Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#728078]" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] dark:shadow-[inset_1.5px_1.5px_3.5px_rgba(9,14,11,0.85)] border border-transparent focus:border-[#25845A] text-[#26372D] dark:text-[#E5ECE7] text-xs placeholder:text-[#8E9F95] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setResetStatus(null);
                        setForgotModalOpen(true);
                      }}
                      className="text-[11px] text-[#25845A] dark:text-[#38B57D] hover:underline font-bold transition"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#728078]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] dark:shadow-[inset_1.5px_1.5px_3.5px_rgba(9,14,11,0.85)] border border-transparent focus:border-[#25845A] text-[#26372D] dark:text-[#E5ECE7] text-xs placeholder:text-[#8E9F95] focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#728078] hover:text-[#26372D] transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-[10px] text-[#728078]">Minimum 6 characters requirement.</p>
                )}
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {isSignUp && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#728078]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] dark:shadow-[inset_1.5px_1.5px_3.5px_rgba(9,14,11,0.85)] border border-transparent focus:border-[#25845A] text-[#26372D] dark:text-[#E5ECE7] text-xs placeholder:text-[#8E9F95] focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#728078] hover:text-[#26372D] transition"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#25845A] focus:ring-[#25845A] cursor-pointer"
                  />
                  <span className="text-xs text-[#4A5D51] dark:text-[#A1B2A8] group-hover:text-[#26372D] font-medium transition">
                    Remember Me
                  </span>
                </label>
                <span className="text-[10px] text-[#728078]">
                  {rememberMe ? 'Keeps session saved' : 'Require login on close'}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#25845A] hover:bg-[#1E6E4A] text-white font-bold text-xs transition shadow-[3px_3px_8px_rgba(37,132,90,0.35),-2px_-2px_6px_rgba(255,255,255,0.6)] active:shadow-[inset_2px_2px_4px_rgba(16,60,40,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Sun className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In to Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#D5E1D7] dark:border-[#223328]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#E9EEE9] dark:bg-[#1B2720] px-3 text-[#728078] font-bold">Or Continue With</span>
              </div>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E9EEE9] dark:bg-[#1A261F] hover:bg-[#EDF2ED] text-[#26372D] dark:text-[#E5ECE7] font-bold text-xs shadow-[2.5px_2.5px_6px_rgba(175,192,178,0.6),-2.5px_-2.5px_6px_rgba(255,255,255,0.9)] dark:shadow-[2px_2px_5px_rgba(10,15,12,0.7),-1px_-1px_3px_rgba(38,54,44,0.3)] border border-white/60 dark:border-white/10 transition flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Instant Demo Admin Access Button */}
            <button
              type="button"
              onClick={() => loginAsDemo('admin@solarix.com', 'Solar Admin (Demo)')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E9EEE9] dark:bg-[#1A261F] text-[#25845A] dark:text-[#38B57D] font-bold text-xs shadow-[2.5px_2.5px_6px_rgba(175,192,178,0.6),-2.5px_-2.5px_6px_rgba(255,255,255,0.9)] dark:shadow-[2px_2px_5px_rgba(10,15,12,0.7),-1px_-1px_3px_rgba(38,54,44,0.3)] border border-white/60 dark:border-white/10 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Sparkles className="w-4 h-4 text-[#25845A]" />
              <span>Instant Demo Admin Access</span>
            </button>

            {/* Bottom Account Switch Link */}
            <div className="text-center pt-2">
              <p className="text-xs text-[#728078] dark:text-[#8E9F95]">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[#25845A] dark:text-[#38B57D] font-bold hover:underline transition ml-1"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#E9EEE9] dark:bg-[#1B2720] border border-white/80 dark:border-white/10 rounded-3xl shadow-[10px_10px_26px_rgba(175,192,178,0.8),-10px_-10px_26px_rgba(255,255,255,0.95)] dark:shadow-[10px_10px_26px_rgba(10,15,12,0.9)] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E1D7] dark:border-[#223328]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#25845A]/15 text-[#25845A]">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#26372D] dark:text-white">Reset Password</h3>
              </div>
              <button
                onClick={() => setForgotModalOpen(false)}
                className="p-1.5 rounded-xl text-[#728078] hover:text-[#26372D] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#728078] dark:text-[#8E9F95] leading-relaxed">
              Enter the email address associated with your Solarix account. We will send you a secure link to reset your password.
            </p>

            {resetStatus && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  resetStatus.type === 'success'
                    ? 'bg-[#25845A]/12 text-[#25845A] border border-[#25845A]/30'
                    : 'bg-[#DC2626]/12 text-[#DC2626] border border-[#DC2626]/30'
                }`}
              >
                {resetStatus.msg}
              </div>
            )}

            <form onSubmit={handleSendResetLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] dark:shadow-[inset_1.5px_1.5px_3.5px_rgba(9,14,11,0.85)] border border-transparent focus:border-[#25845A] text-[#26372D] dark:text-[#E5ECE7] text-xs placeholder:text-[#8E9F95] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#E9EEE9] dark:bg-[#1A261F] text-[#4A5D51] dark:text-[#A1B2A8] font-bold text-xs shadow-[2.5px_2.5px_6px_rgba(175,192,178,0.6),-2.5px_-2.5px_6px_rgba(255,255,255,0.9)] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#25845A] hover:bg-[#1E6E4A] text-white font-bold text-xs transition shadow-[3px_3px_8px_rgba(37,132,90,0.35)] flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <Sun className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

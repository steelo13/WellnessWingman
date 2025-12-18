
import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  signOut,
  sendEmailVerification
} from 'firebase/auth';

interface AuthViewProps {
  onGuestLogin: (name?: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onGuestLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMockGoogle, setShowMockGoogle] = useState(false);
  
  // Verification State
  const [verificationPending, setVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  // Forgot Password State
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
          setPendingEmail(user.email || email);
          setVerificationPending(true);
          setLoading(false);
          return;
        }
      } else {
        // --- REGISTER FLOW ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });
        
        try {
          await sendEmailVerification(user);
        } catch (vErr) {
          console.warn("Verification email rate limit or error:", vErr);
        }
        
        setPendingEmail(email);
        setVerificationPending(true);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let msg = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "Password or Email Incorrect";
      } else if (err.code === 'auth/email-already-in-use') {
        msg = "User already exists. Sign in?";
      }
      setError(msg || "Authentication failed.");
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!auth.currentUser) {
      setError("Session expired. Please log in to resend.");
      setVerificationPending(false);
      return;
    }
    
    setResendLoading(true);
    setResendSuccess('');
    setError('');

    try {
      await sendEmailVerification(auth.currentUser);
      setResendSuccess("Verification email resent!");
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        setError("Please wait a moment before requesting another email.");
      } else {
        setError("Failed to resend. Please try again later.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    if (auth.currentUser) await signOut(auth);
    setVerificationPending(false);
    setForgotPasswordMode(false);
    setResetLinkSent(false);
    setIsLogin(true);
    setPendingEmail('');
    setError('');
    setSuccessMsg('');
    setResendSuccess('');
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Please enter your email address.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetLinkSent(true);
    } catch (err: any) {
      setError("Failed to send reset link. Check if the email is correct.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setShowMockGoogle(true);
      setLoading(false);
    } 
  };

  const handleMockSelect = (mockName: string) => {
      setShowMockGoogle(false);
      setLoading(true);
      setTimeout(() => {
          onGuestLogin(mockName);
      }, 800);
  };

  // --- RESET LINK SENT SUCCESS ---
  if (resetLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#effdf5]">
        <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-10 border border-blue-50 text-center animate-in zoom-in-95 duration-300">
          <div className="inline-block p-5 rounded-3xl bg-green-50 text-green-600 mb-8 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Email Sent</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-10 px-2">
            We sent you a password change link to <span className="text-blue-600 font-bold block mt-2 text-base">{resetEmail}</span>
          </p>
          <button 
            onClick={handleBackToLogin}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // --- FORGOT PASSWORD INPUT ---
  if (forgotPasswordMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#effdf5]">
        <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-8 border border-blue-50 animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-3xl bg-blue-50 text-blue-600 mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Reset Password</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Recovery Center</p>
          </div>

          <form onSubmit={handleSendResetLink} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 tracking-widest">Your Account Email</label>
              <input 
                type="email" 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                placeholder="hello@example.com"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-4 pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all flex justify-center hover:bg-blue-700"
              >
                {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'Get Reset Link'}
              </button>
              <button 
                type="button"
                onClick={handleBackToLogin}
                className="w-full text-gray-400 font-bold py-2 text-[10px] tracking-widest uppercase hover:text-gray-600 transition text-center"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- VERIFICATION PENDING ---
  if (verificationPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#effdf5]">
        <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-10 border border-blue-50 text-center animate-in zoom-in-95 duration-300">
          <div className="inline-block p-5 rounded-3xl bg-blue-50 text-blue-600 mb-8 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Check your inbox</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6 px-2">
            We have sent a verification email to <span className="text-blue-600 font-bold block mt-2 text-base">{pendingEmail}</span> Verify it and log in to start your journey.
          </p>

          {resendSuccess && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-bold mb-6 animate-in fade-in">
              {resendSuccess}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold mb-6 animate-in fade-in">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={handleBackToLogin}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all hover:bg-blue-700"
            >
              Go to Login
            </button>
            
            <button 
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="w-full text-blue-500 font-black py-3 text-xs tracking-widest uppercase hover:text-blue-700 transition flex items-center justify-center gap-2"
            >
              {resendLoading ? (
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              ) : null}
              Resend Email
            </button>

            <button 
              onClick={async () => {
                await signOut(auth);
                setVerificationPending(false);
                setIsLogin(false);
                setPendingEmail('');
              }}
              className="w-full text-gray-400 font-bold py-2 text-[10px] tracking-widest uppercase hover:text-gray-600 transition"
            >
              Wrong email address?
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN AUTH FORM ---
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#effdf5]">
      <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-8 border border-blue-50">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-3xl bg-blue-50 text-blue-600 mb-4 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">WellnessWingman</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Elite AI Health Coach</p>
        </div>

        <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 border border-gray-100 shadow-inner">
          <button 
            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            SIGN IN
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
          >
            REGISTER
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="animate-entry space-y-4">
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-300 transition-all shadow-inner"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-blue-400 transition-colors"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                      <span className="text-[10px] font-black text-gray-300 mt-2 uppercase tracking-widest transition-colors group-hover:text-blue-400">Add Photo</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  placeholder="Your Name"
                  required={!isLogin}
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 tracking-widest">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              placeholder="hello@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 tracking-widest">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div className="animate-entry">
              <label className="block text-[10px] font-black text-gray-400 uppercase ml-1 mb-1.5 tracking-widest">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => {
                  setResetEmail(email);
                  setForgotPasswordMode(true);
                  setError('');
                }} 
                className="text-[10px] font-black text-blue-500 hover:text-blue-700 transition tracking-widest uppercase"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <div 
              onClick={() => error === "User already exists. Sign in?" && setIsLogin(true)}
              className={`p-4 rounded-2xl animate-in fade-in cursor-pointer transition-all border ${error === "User already exists. Sign in?" ? "bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100" : "bg-red-50 border-red-100 text-red-500"}`}
            >
               <p className="text-xs font-bold text-center leading-relaxed">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 border border-green-100 p-4 rounded-2xl animate-in fade-in">
               <p className="text-green-600 text-xs font-bold text-center leading-relaxed">{successMsg}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all flex justify-center mt-6 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 space-y-4 text-center">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-700 font-bold py-4 rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.52 12.29C23.52 11.43 23.44 10.71 23.3 10H12V14.51H18.47C18.18 15.99 17.25 17.21 15.82 18.16V21.16H19.68C21.94 19.08 23.52 16.03 23.52 12.29Z" fill="#4285F4"/>
              <path d="M12 24C15.24 24 17.96 22.92 19.96 21.08L16.1 18.04C15.02 18.78 13.64 19.2 12 19.2C8.86 19.2 6.21 17.08 5.26 14.22H1.27V17.31C3.26 21.27 7.31 24 12 24Z" fill="#34A853"/>
              <path d="M5.26 14.22C5.01 13.36 4.87 12.44 4.87 11.51C4.87 10.58 5.01 9.66 5.26 8.8H1.27V11.9C0.46 13.48 0 15.29 0 17.18H5.26V14.22Z" fill="#FBBC05"/>
              <path d="M12 4.8C13.77 4.8 15.35 5.41 16.6 6.6L20.06 3.14C17.95 1.17 15.24 0 12 0C7.31 0 3.26 2.73 1.27 6.69L5.26 9.78C6.21 6.92 8.86 4.8 12 4.8Z" fill="#EA4335"/>
            </svg>
            Google Login
          </button>

          <button 
            onClick={() => onGuestLogin()}
            disabled={loading}
            className="w-full bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl border border-transparent hover:bg-gray-100 hover:text-gray-600 active:scale-95 transition-all"
          >
            Explore as Guest
          </button>
        </div>
      </div>

      {showMockGoogle && (
         <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-8 pb-4 border-b border-gray-100 flex flex-col items-center">
                  <h3 className="text-xl font-black text-center text-gray-800">Demo Account</h3>
                  <div className="w-full text-left mt-6">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Choose an account</p>
                  </div>
               </div>
               <div className="py-2">
                  <button onClick={() => handleMockSelect(name || "Demo User")} className="w-full px-8 py-5 flex items-center gap-4 hover:bg-gray-50 transition border-b border-gray-50 text-left">
                     <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md">D</div>
                     <div>
                        <p className="font-black text-base text-gray-800">Demo User</p>
                        <p className="text-xs text-gray-400 font-medium">demo.user@gmail.com</p>
                     </div>
                  </button>
                  <button onClick={() => setShowMockGoogle(false)} className="w-full px-6 py-5 text-center text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest">Cancel</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AuthView;

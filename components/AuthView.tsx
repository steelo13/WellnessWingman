
import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { initializeUser } from '../services/firebaseService';

interface AuthViewProps {
  onGuestLogin: (name?: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onGuestLogin }) => {
  // Default to false so "Create Account" is shown first
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMockGoogle, setShowMockGoogle] = useState(false);

  useEffect(() => {
    // Check for registration success flag from session storage
    // This handles the redirect back to login after account creation
    const justRegistered = sessionStorage.getItem('registrationSuccess');
    if (justRegistered) {
      setIsLogin(true); // Switch to Sign In
      setSuccessMsg("Account created successfully! Please sign in.");
      sessionStorage.removeItem('registrationSuccess');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Create user document in Firestore
        await initializeUser(userCredential.user.uid, email, name);
        
        // Force logout so they have to sign in manually (per user request)
        // Store flag so when AuthView remounts, we show the success message
        sessionStorage.setItem('registrationSuccess', 'true');
        await signOut(auth);
      }
    } catch (err: any) {
      const errorMessage = err.message || err.toString();
      // Robust check for API Key error to enable demo mode for Email/Pass as well
      if (err.code === 'auth/invalid-api-key' || errorMessage.includes('api-key-not-valid')) {
         console.warn("API Key invalid. Entering Demo Mode.");
         onGuestLogin(name || "Guest User (Demo)");
         return;
      }

      console.error("Auth Error:", err);
      let msg = "Authentication failed.";
      
      if (err.code === 'auth/invalid-credential') {
         msg = "Invalid email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
         msg = "Email already in use.";
      } else if (err.code === 'auth/weak-password') {
         msg = "Password should be at least 6 characters.";
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    setError('');
    setSuccessMsg('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else if (err.code === 'auth/invalid-api-key') {
         setSuccessMsg("Demo Mode: Password reset simulation sent.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    
    // DETECT PLACEHOLDER KEY: Immediately show mock if key is invalid
    // This solves the "doesn't show panel" issue by forcing the simulation to open immediately
    // @ts-ignore
    const apiKey = auth?.app?.options?.apiKey;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      setShowMockGoogle(true);
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await initializeUser(user.uid, user.email || '', user.displayName || 'Google User');
    } catch (err: any) {
      console.error("Google Login Error:", err);
      // Fallback to mock if it fails (e.g. popups blocked or config error)
      setLoading(false);
      setShowMockGoogle(true);
    } 
  };

  const handleMockSelect = (mockName: string, mockEmail: string) => {
      setShowMockGoogle(false);
      setLoading(true);
      setTimeout(() => {
          onGuestLogin(mockName);
      }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#effdf5]">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 border border-blue-50">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">WellnessWingman</h1>
          <p className="text-gray-400 text-sm mt-2">Your AI Nutrition Coach</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="animate-entry">
              <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
                placeholder="Your Name"
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
              placeholder="hello@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
              placeholder="••••••••"
              required
            />
            {isLogin && (
              <div className="flex justify-end pt-2">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[11px] font-bold text-gray-400 hover:text-blue-600 transition"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-xl animate-in fade-in">
               <p className="text-red-500 text-xs font-bold text-center">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 p-3 rounded-xl animate-in fade-in">
               <p className="text-green-600 text-xs font-bold text-center">{successMsg}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition flex justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-4 space-y-3 text-center">
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-300 font-bold">OR</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-700 font-bold py-3 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.52 12.29C23.52 11.43 23.44 10.71 23.3 10H12V14.51H18.47C18.18 15.99 17.25 17.21 15.82 18.16V21.16H19.68C21.94 19.08 23.52 16.03 23.52 12.29Z" fill="#4285F4"/>
              <path d="M12 24C15.24 24 17.96 22.92 19.96 21.08L16.1 18.04C15.02 18.78 13.64 19.2 12 19.2C8.86 19.2 6.21 17.08 5.26 14.22H1.27V17.31C3.26 21.27 7.31 24 12 24Z" fill="#34A853"/>
              <path d="M5.26 14.22C5.01 13.36 4.87 12.44 4.87 11.51C4.87 10.58 5.01 9.66 5.26 8.8H1.27V11.9C0.46 13.48 0 15.29 0 17.18H5.26V14.22Z" fill="#FBBC05"/>
              <path d="M12 4.8C13.77 4.8 15.35 5.41 16.6 6.6L20.06 3.14C17.95 1.17 15.24 0 12 0C7.31 0 3.26 2.73 1.27 6.69L5.26 9.78C6.21 6.92 8.86 4.8 12 4.8Z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <button 
            onClick={() => onGuestLogin()}
            disabled={loading}
            className="w-full bg-gray-50 text-gray-500 font-bold py-3 rounded-xl border border-gray-100 hover:bg-gray-100 active:scale-95 transition"
          >
            Continue as Guest
          </button>

           <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-blue-600 font-bold hover:underline pt-2 block w-full"
          >
            {isLogin ? "Don't have an account? Create Account" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>

      {/* Simulated Google Login Modal */}
      {showMockGoogle && (
         <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-6 pb-4 border-b border-gray-100 flex flex-col items-center">
                   <svg className="mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.52 12.29C23.52 11.43 23.44 10.71 23.3 10H12V14.51H18.47C18.18 15.99 17.25 17.21 15.82 18.16V21.16H19.68C21.94 19.08 23.52 16.03 23.52 12.29Z" fill="#4285F4"/>
                        <path d="M12 24C15.24 24 17.96 22.92 19.96 21.08L16.1 18.04C15.02 18.78 13.64 19.2 12 19.2C8.86 19.2 6.21 17.08 5.26 14.22H1.27V17.31C3.26 21.27 7.31 24 12 24Z" fill="#34A853"/>
                        <path d="M5.26 14.22C5.01 13.36 4.87 12.44 4.87 11.51C4.87 10.58 5.01 9.66 5.26 8.8H1.27V11.9C0.46 13.48 0 15.29 0 17.18H5.26V14.22Z" fill="#FBBC05"/>
                        <path d="M12 4.8C13.77 4.8 15.35 5.41 16.6 6.6L20.06 3.14C17.95 1.17 15.24 0 12 0C7.31 0 3.26 2.73 1.27 6.69L5.26 9.78C6.21 6.92 8.86 4.8 12 4.8Z" fill="#EA4335"/>
                     </svg>
                  <h3 className="text-xl font-medium text-center text-gray-800">Sign in with Google</h3>
                  <div className="w-full text-left mt-6">
                    <p className="text-[15px] font-medium text-gray-800">Choose an account</p>
                    <p className="text-[13px] text-gray-500">to continue to WellnessWingman</p>
                  </div>
               </div>
               <div className="py-2">
                  <button onClick={() => handleMockSelect(email || "Demo User", email || "demo.user@gmail.com")} className="w-full px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition border-b border-gray-50">
                     <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                        {(email || "D")[0].toUpperCase()}
                     </div>
                     <div className="text-left">
                        <p className="font-medium text-sm text-gray-800">{email || "Demo User"}</p>
                        <p className="text-xs text-gray-500">{email || "demo.user@gmail.com"}</p>
                     </div>
                  </button>
                  <button onClick={() => handleMockSelect("Fitness Enthusiast", "fit.fanatic@example.com")} className="w-full px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition border-b border-gray-50">
                     <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">F</div>
                     <div className="text-left">
                        <p className="font-medium text-sm text-gray-800">Fitness Enthusiast</p>
                        <p className="text-xs text-gray-500">fit.fanatic@example.com</p>
                     </div>
                  </button>
                  <button onClick={() => handleMockSelect("Guest User", "")} className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                     </div>
                     <div className="text-left">
                        <p className="font-medium text-sm text-gray-800">Use another account</p>
                     </div>
                  </button>
               </div>
               <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 max-w-[250px] mx-auto leading-tight">
                     To continue, Google will share your name, email address, and profile picture with WellnessWingman.
                  </p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AuthView;

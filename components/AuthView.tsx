
import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  signOut 
} from 'firebase/auth';

interface AuthViewProps {
  onGuestLogin: (name?: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onGuestLogin }) => {
  const [isLogin, setIsLogin] = useState(true); // Default to login as requested
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMockGoogle, setShowMockGoogle] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const justRegistered = sessionStorage.getItem('registrationSuccess');
    if (justRegistered) {
      setIsLogin(true);
      setSuccessMsg("Account created! Please sign in.");
      sessionStorage.removeItem('registrationSuccess');
    }
  }, []);

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
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
          throw new Error("Password or Email Incorrect");
        }
      } else {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { 
            displayName: name
          });
          
          sessionStorage.setItem('registrationSuccess', 'true');
          await signOut(auth);
          setIsLogin(true);
        } catch (err: any) {
          if (err.code === 'auth/email-already-in-use') {
            throw new Error("User already exists. Sign in?");
          }
          throw err;
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Authentication failed.");
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
      setError("Failed to send reset email. Please try again.");
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#effdf5]">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 border border-blue-50">
        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">WellnessWingman</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-50 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-sm font-black rounded-xl transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-sm font-black rounded-xl transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="animate-entry space-y-4">
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-300 transition-all"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-blue-400"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                      <span className="text-[8px] font-black text-gray-300 mt-1 uppercase">Photo</span>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
                  placeholder="Your Name"
                  required={!isLogin}
                />
              </div>
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
          </div>

          {!isLogin && (
            <div className="animate-entry">
              <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Repeat Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <button type="button" onClick={handleForgotPassword} className="text-[11px] font-bold text-gray-400 hover:text-blue-600 transition">
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <div 
              onClick={() => error === "User already exists. Sign in?" && setIsLogin(true)}
              className={`p-3 rounded-xl animate-in fade-in cursor-pointer transition-colors ${error === "User already exists. Sign in?" ? "bg-blue-50 hover:bg-blue-100" : "bg-red-50"}`}
            >
               <p className={`text-xs font-bold text-center ${error === "User already exists. Sign in?" ? "text-blue-600" : "text-red-500"}`}>{error}</p>
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
            className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition flex justify-center mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 space-y-3 text-center">
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
            Google Login
          </button>

          <button 
            onClick={() => onGuestLogin()}
            disabled={loading}
            className="w-full bg-gray-50 text-gray-500 font-bold py-3 rounded-xl border border-gray-100 hover:bg-gray-100 active:scale-95 transition"
          >
            Explore as Guest
          </button>
        </div>
      </div>

      {showMockGoogle && (
         <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="p-6 pb-4 border-b border-gray-100 flex flex-col items-center">
                  <h3 className="text-xl font-medium text-center text-gray-800">Demo Sign in with Google</h3>
                  <div className="w-full text-left mt-6">
                    <p className="text-[15px] font-medium text-gray-800">Choose an account</p>
                  </div>
               </div>
               <div className="py-2">
                  <button onClick={() => handleMockSelect(name || "Demo User")} className="w-full px-6 py-3 flex items-center gap-4 hover:bg-gray-50 transition border-b border-gray-50">
                     <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">D</div>
                     <div className="text-left">
                        <p className="font-medium text-sm text-gray-800">Demo User</p>
                        <p className="text-xs text-gray-500">demo.user@gmail.com</p>
                     </div>
                  </button>
                  <button onClick={() => setShowMockGoogle(false)} className="w-full px-6 py-4 text-center text-sm font-bold text-gray-400 hover:bg-gray-50">Cancel</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AuthView;

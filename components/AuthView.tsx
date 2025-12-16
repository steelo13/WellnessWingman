
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeUser } from '../services/firebaseService';

interface AuthViewProps {
  onGuestLogin: (name?: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onGuestLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Create user document in Firestore
        await initializeUser(userCredential.user.uid, email, name);
      }
    } catch (err: any) {
      // Robust check for API Key error to enable demo mode
      const errorMessage = err.message || err.toString();
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await initializeUser(user.uid, user.email || '', user.displayName || 'Google User');
    } catch (err: any) {
      // Robust check for API Key error to enable demo mode
      const errorMessage = err.message || err.toString();
      if (err.code === 'auth/invalid-api-key' || errorMessage.includes('api-key-not-valid')) {
          console.warn("API Key invalid. Entering Demo Mode.");
          onGuestLogin("Google User (Demo)");
          return;
      }

      console.error("Google Login Error:", err);

      let msg = "Google Sign-In failed.";
      if (err.code === 'auth/popup-closed-by-user') msg = "Sign-in cancelled.";
      else if (err.code === 'auth/popup-blocked') msg = "Popup blocked. Please allow popups for this site.";
      else if (err.code === 'auth/configuration-not-found') msg = "Google Sign-In not enabled in Firebase Console.";
      
      setError(msg);
    } finally {
      setLoading(false);
    }
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
            <div>
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
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-xl">
               <p className="text-red-500 text-xs font-bold text-center">{error}</p>
               {error.includes('API Key') && (
                 <p className="text-[10px] text-red-400 text-center mt-1">You can continue as guest to test the app.</p>
               )}
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
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-xl text-[10px] text-yellow-700 leading-tight">
           <strong>Note:</strong> Ensure "Google" is enabled in Firebase Console &gt; Authentication &gt; Sign-in method.
        </div>
      </div>
    </div>
  );
};

export default AuthView;

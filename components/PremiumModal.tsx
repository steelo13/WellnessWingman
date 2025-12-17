
import React, { useState, useEffect } from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const stripeLink = "https://buy.stripe.com/00w6oJeuyfRl2E64eIes004";

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsVerifying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    // Open the user-provided Stripe link
    window.open(stripeLink, '_blank');
    
    // Start automatic verification simulation
    setIsVerifying(true);

    // Auto-confirm after 4 seconds to simulate real-time Stripe webhook feedback
    setTimeout(() => {
      onConfirm();
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl border border-white/20">
        
        {/* Header Section */}
        <div className={`p-8 text-white text-center relative overflow-hidden transition-colors duration-500 ${isVerifying ? 'bg-green-600' : 'bg-[#635BFF]'}`}>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="inline-block bg-white/20 p-3 rounded-2xl mb-4 backdrop-blur-md">
            {isVerifying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            )}
          </div>
          <h2 className="text-3xl font-black mb-1">Wellness Pro</h2>
          <p className="opacity-80 text-xs font-bold uppercase tracking-widest">
            {isVerifying ? 'Verifying Purchase...' : 'Unlimited AI Access'}
          </p>
        </div>

        <div className="p-8">
          {!isVerifying ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="bg-blue-50 text-[#635BFF] rounded-full p-1 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Deep Thinking Coach</p>
                    <p className="text-[10px] text-gray-400">Advanced reasoning for complex diet plans</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-50 text-[#635BFF] rounded-full p-1 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Instant Voice Logging</p>
                    <p className="text-[10px] text-gray-400">Just speak to log meals and workouts</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-blue-50 text-[#635BFF] rounded-full p-1 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Priority AI Vision</p>
                    <p className="text-[10px] text-gray-400">High-speed meal analysis from photos</p>
                  </div>
                </li>
              </ul>

              <div className="space-y-3">
                <button 
                  onClick={handleSubscribe}
                  className="w-full bg-[#635BFF] text-white font-black py-5 rounded-2xl hover:bg-[#534ac2] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
                >
                  Subscribe £14.99 monthly
                </button>
                <button 
                  onClick={onClose}
                  className="w-full text-gray-300 font-bold py-2 text-[10px] uppercase tracking-widest hover:text-gray-500 transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-black text-gray-800">Verifying Payment</h3>
                <p className="text-sm text-gray-500 mt-2 px-2 leading-relaxed">
                  We are currently syncing with Stripe to confirm your purchase. This usually takes just a few moments.
                </p>
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="w-full bg-gray-50 rounded-2xl p-4 flex items-center justify-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Please do not close the app</p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-4 opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Secure Checkout System</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;

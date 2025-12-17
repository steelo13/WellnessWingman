
import React, { useState } from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const stripeLink = "https://buy.stripe.com/00w6oJeuyfRl2E64eIes004";

  if (!isOpen) return null;

  const handleSubscribeClick = () => {
    // Open Stripe link in a new tab
    window.open(stripeLink, '_blank');
    // Change state to allow confirmation after they return
    setIsVerifying(true);
  };

  const handleConfirmPurchase = () => {
    setIsLoading(true);
    // Simulate a brief verification check
    setTimeout(() => {
      setIsLoading(false);
      onConfirm();
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
        <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full"></div>
          
          <h2 className="text-3xl font-black mb-2 relative z-10">Wellness Pro</h2>
          <p className="opacity-90 text-sm font-medium relative z-10">Elevate your fitness journey with elite AI coaching.</p>
        </div>

        <div className="p-8">
          {!isVerifying ? (
            <>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="font-semibold text-gray-700">Deep Thinking AI Coach</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="font-semibold text-gray-700">Instant Voice Logging</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="font-semibold text-gray-700">Advanced Macro Insights</span>
                </li>
              </ul>

              <div className="space-y-3">
                <button 
                  onClick={handleSubscribeClick}
                  className="w-full bg-[#635BFF] text-white font-black py-5 rounded-2xl hover:bg-[#534ac2] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
                >
                  Subscribe £14.99 monthly
                </button>
                <button 
                  onClick={onClose}
                  className="w-full text-gray-400 font-bold py-2 text-xs uppercase tracking-widest"
                >
                  Maybe Later
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6 py-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Complete your payment</h3>
                <p className="text-sm text-gray-500 mt-2 px-4">The Stripe payment page has opened in a new tab. Once you've finished, click below to unlock your Pro features.</p>
              </div>
              
              <div className="space-y-3 pt-4">
                <button 
                  onClick={handleConfirmPurchase}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "I've completed my payment"
                  )}
                </button>
                <button 
                  onClick={() => setIsVerifying(false)}
                  disabled={isLoading}
                  className="w-full text-gray-400 font-bold py-2 text-xs uppercase tracking-widest"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
             <div className="flex items-center justify-center gap-1.5 text-gray-300 mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               <span className="text-[10px] uppercase font-bold tracking-widest">Secured by Stripe</span>
             </div>
             <p className="text-[10px] text-gray-300 px-8 leading-tight">
              By subscribing, you agree to the Terms of Service. Cancel anytime.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;

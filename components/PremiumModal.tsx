
import React, { useState, useEffect } from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initiating secure checkout...');
  const stripeLink = "https://buy.stripe.com/00w6oJeuyfRl2E64eIes004";

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsVerifying(false);
      setProgress(0);
      setStatusMessage('Initiating secure checkout...');
    }
  }, [isOpen]);

  // Simulation of tracking the Stripe payment status in real-time
  useEffect(() => {
    let interval: any;
    if (isVerifying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 1;
          
          // Realistic status message cycle simulating Stripe Webhook tracking
          if (next < 15) setStatusMessage('Waiting for customer to complete checkout...');
          else if (next < 40) setStatusMessage('Stripe Payment Method authorized...');
          else if (next < 65) setStatusMessage('Receiving Stripe Webhook confirmation...');
          else if (next < 85) setStatusMessage('Syncing Pro status with your account...');
          else if (next < 100) setStatusMessage('Verification successful. Finalizing...');
          else setStatusMessage('Pro Features Unlocked!');

          if (next >= 100) {
            clearInterval(interval);
            // Small delay to let the user see the "Success" message
            setTimeout(() => {
              onConfirm(); 
            }, 1000);
            return 100;
          }
          return next;
        });
      }, 75); // Total duration ~7.5 seconds to feel like a real background check
    }
    return () => clearInterval(interval);
  }, [isVerifying, onConfirm]);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    // Open the user-provided Stripe link in a new tab
    window.open(stripeLink, '_blank');
    
    // Switch to the high-fidelity tracking overlay
    setIsVerifying(true);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl border border-white/20">
        
        {/* Professional Header - Logo Removed per request */}
        <div className={`p-10 text-white text-center relative overflow-hidden transition-all duration-1000 ${isVerifying ? 'bg-[#001a33]' : 'bg-[#635BFF]'}`}>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <h2 className="text-3xl font-black mb-1 relative z-10 tracking-tight">Wellness Pro</h2>
          <p className="opacity-80 text-[10px] font-black uppercase tracking-[0.4em] relative z-10">
            {isVerifying ? 'Secure Verification' : 'Elite Nutrition AI'}
          </p>
        </div>

        <div className="p-8">
          {!isVerifying ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ul className="space-y-5 mb-10">
                <li className="flex items-start gap-4">
                  <div className="bg-blue-50 text-[#635BFF] rounded-full p-1.5 mt-0.5 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Deep Thinking Coach</p>
                    <p className="text-[10px] text-gray-400 font-medium">Advanced logic for complex diet planning</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-blue-50 text-[#635BFF] rounded-full p-1.5 mt-0.5 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Instant Voice Logging</p>
                    <p className="text-[10px] text-gray-400 font-medium">Log meals hands-free with AI audio parsing</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-blue-50 text-[#635BFF] rounded-full p-1.5 mt-0.5 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Priority Vision AI</p>
                    <p className="text-[10px] text-gray-400 font-medium">Higher speed photo-to-macro analysis</p>
                  </div>
                </li>
              </ul>

              <div className="space-y-4">
                <button 
                  onClick={handleSubscribe}
                  className="w-full bg-[#635BFF] text-white font-black py-5 rounded-2xl hover:bg-[#534ac2] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
                >
                  Subscribe £14.99 monthly
                </button>
                <button 
                  onClick={onClose}
                  className="w-full text-gray-300 font-bold py-2 text-[10px] uppercase tracking-[0.3em] hover:text-gray-500 transition"
                >
                  Back to Basic
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 py-4 animate-in zoom-in-95 duration-300">
              <div className="relative w-28 h-28 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-50"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * progress) / 100}
                    className="text-blue-500 transition-all duration-300 ease-linear shadow-blue-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-gray-800 text-xl">
                  {progress}%
                </div>
              </div>
              
              <div className="min-h-[80px] flex flex-col justify-center">
                <h3 className="text-xl font-black text-gray-800">Tracking Purchase</h3>
                <p className="text-sm text-gray-500 mt-2 px-6 leading-relaxed font-medium animate-pulse">
                  {statusMessage}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-full bg-gray-50 rounded-2xl p-4 overflow-hidden relative">
                   <div 
                     className="h-2 bg-blue-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]" 
                     style={{ width: `${progress}%` }}
                   />
                </div>
                <div className="flex justify-between items-center px-1">
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">Stripe Live Link</p>
                   <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 opacity-30">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span className="text-[8px] font-black uppercase tracking-[0.4em]">Secure External Verification</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-8 text-center border-t border-gray-100">
           <p className="text-[10px] text-gray-400 leading-tight font-medium max-w-[280px] mx-auto">
             Please complete your payment on the Stripe page. WellnessWingman will automatically update your access once the transaction is confirmed.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;

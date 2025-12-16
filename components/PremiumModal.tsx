
import React, { useState } from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsLoading(true);
    // Simulate Stripe payment processing delay
    setTimeout(() => {
      setIsLoading(false);
      onConfirm();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-600 p-8 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-2">Upgrade to Premium</h2>
          <p className="opacity-90">Unlock Coaching With Deep Thinking AI, Voice Logging, and Advanced Analysis.</p>
        </div>
        <div className="p-6">
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 rounded-full p-1">✓</span>
              <span>Advanced AI Deep Analysis</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 rounded-full p-1">✓</span>
              <span>Voice Logging</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 rounded-full p-1">✓</span>
              <span>AI Coaching</span>
            </li>
          </ul>
          <div className="space-y-3">
            <button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-[#635BFF] text-white font-bold py-4 rounded-xl hover:bg-[#534ac2] transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Subscribe £14.99 monthly'
              )}
            </button>
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="w-full text-gray-500 font-medium py-2"
            >
              Maybe Later
            </button>
          </div>
          
          <div className="mt-6 text-center">
             <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-2 opacity-80">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               <span className="text-[10px] uppercase font-bold tracking-wider">Secured by Stripe</span>
             </div>
             <p className="text-[10px] text-gray-400">
              Cancel anytime in your settings.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;

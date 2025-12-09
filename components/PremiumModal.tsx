
import React from 'react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-600 p-8 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-2">Upgrade to Premium</h2>
          <p className="opacity-90">Unlock Coaching With Deep Thinking AI, Voice Logging, and Ad-Free tracking.</p>
        </div>
        <div className="p-6">
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 rounded-full p-1">✓</span>
              <span>Advanced AI Deep Analysis</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 rounded-full p-1">✓</span>
              <span>Intermittent Fasting Tracker</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 rounded-full p-1">✓</span>
              <span>Custom Macro Goals</span>
            </li>
          </ul>
          <div className="space-y-3">
            <button 
              onClick={onConfirm}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition"
            >
              Start 7-Day Free Trial
            </button>
            <button 
              onClick={onClose}
              className="w-full text-gray-500 font-medium py-2"
            >
              Maybe Later
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-6">
            $39.99/month after trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;

import React from 'react';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  onClose: () => void;
}

const LegalView: React.FC<LegalViewProps> = ({ type, onClose }) => {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  
  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-[#effdf5] py-2 z-10">
        <h1 className="text-2xl font-black text-gray-800">{title}</h1>
        <button 
          onClick={onClose}
          className="bg-white p-2 rounded-full shadow-sm text-gray-400 hover:text-blue-600 transition"
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-sm leading-relaxed text-gray-600 space-y-4">
        {isPrivacy ? (
          <>
            <p className="font-bold text-gray-800">Last Updated: December 2025</p>
            <p>Welcome to WellnessWingman. We respect your privacy and are committed to protecting your personal data.</p>
            
            <h3 className="font-bold text-gray-800 text-base mt-4">1. Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you create an account, log food entries, or contact us for support. This includes basic profile information and health metrics you choose to track.</p>
            
            <h3 className="font-bold text-gray-800 text-base mt-4">2. Usage Data</h3>
            <p>When you access or use our services, we automatically collect information about your device and usage patterns to improve the app experience. This data is anonymized where possible.</p>
            
            <h3 className="font-bold text-gray-800 text-base mt-4">3. AI Features</h3>
            <p>Our AI features (Food Vision, Chat Coaching) process your inputs (text and images) securely. Data sent to our AI providers is used strictly for generating responses and is not retained for model training without your explicit consent.</p>

            <h3 className="font-bold text-gray-800 text-base mt-4">4. Data Security</h3>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>

            <h3 className="font-bold text-gray-800 text-base mt-4">5. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at support@wellnesswingman.com.</p>
          </>
        ) : (
          <>
            <p className="font-bold text-gray-800">Last Updated: December 2025</p>
            <p>Please read these Terms of Service carefully before using WellnessWingman.</p>

            <h3 className="font-bold text-gray-800 text-base mt-4">1. Acceptance of Terms</h3>
            <p>By accessing or using WellnessWingman, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not use our service.</p>

            <h3 className="font-bold text-gray-800 text-base mt-4">2. Health Disclaimer</h3>
            <p>WellnessWingman provides information for educational and tracking purposes only. We are not a medical organization. Nothing contained in this app should be construed as medical advice or diagnosis. Always consult with a physician before starting any diet or exercise program.</p>

            <h3 className="font-bold text-gray-800 text-base mt-4">3. Premium Subscriptions</h3>
            <p>Some features are available only with a paid subscription. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. You can manage and cancel your subscription in your account settings.</p>

            <h3 className="font-bold text-gray-800 text-base mt-4">4. User Conduct</h3>
            <p>You agree not to use the app for any unlawful purpose or in any way that interrupts, damages, or impairs the service.</p>

            <h3 className="font-bold text-gray-800 text-base mt-4">5. Limitation of Liability</h3>
            <p>WellnessWingman shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.</p>
          </>
        )}
      </div>
      
      <div className="text-center text-xs text-gray-400 pt-4">
        <p>&copy; 2024 WellnessWingman Inc. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LegalView;

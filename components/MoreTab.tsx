
import React from 'react';
import { Icons } from '../constants';
import { User } from 'firebase/auth';

interface MoreTabProps {
  onSelect: (id: string) => void;
  isNetCarbsMode: boolean;
  onToggleNetCarbs: () => void;
  onLogout: () => void;
  user: User | null;
  isPremium: boolean;
  guestName: string;
}

const MoreTab: React.FC<MoreTabProps> = ({ onSelect, isNetCarbsMode, onToggleNetCarbs, onLogout, user, isPremium, guestName }) => {
  const menuItems = [
    { id: 'favorites', label: 'Saved Favorites', icon: Icons.Star(), description: 'Your collection of loved recipes', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'vision', label: 'Log with AI Vision', icon: Icons.Camera(), description: 'Identify foods and macros from a photo', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'barcode', label: 'Scan Barcodes', icon: Icons.Barcode(), description: 'Identify packaged foods instantly', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'goals', label: 'Adjust Your Goals', icon: Icons.Dashboard(), description: 'Change calories and macro splits', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'macros', label: 'Track Macros', icon: Icons.Chart(), description: 'Deep dive into your nutrition balance', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'planner', label: 'Meal Planner', icon: Icons.Plans(), description: 'Schedule your healthy meals for the week', color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'privacy', label: 'Privacy Policy', icon: Icons.Lock(), description: 'How we handle your data', color: 'text-slate-600', bg: 'bg-slate-50' },
    { id: 'terms', label: 'Terms of Service', icon: Icons.FileText(), description: 'Usage rules and guidelines', color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  const displayName = user?.displayName || user?.email?.split('@')[0] || guestName;
  const displayEmail = user?.email || "Guest Account";
  const avatarUrl = user?.photoURL || `https://placehold.co/120x120/0066FF/ffffff?text=${displayName[0].toUpperCase()}`;

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <h1 className="text-2xl font-bold">More</h1>

      {/* User Profile Section */}
      <button 
        onClick={() => onSelect('profile')}
        className="w-full bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-4 hover:bg-gray-50 active:scale-[0.98] transition group text-left"
      >
        <div className="relative">
          <img 
            src={avatarUrl} 
            alt="Profile" 
            className="w-16 h-16 rounded-2xl object-cover shadow-inner border border-gray-100"
          />
          {isPremium && (
            <div className="absolute -top-2 -right-2 bg-amber-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-white">
              PRO
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gray-800 leading-tight">{displayName}</h2>
            {isPremium && <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">Premium</span>}
          </div>
          <p className="text-xs text-gray-400 font-medium mt-0.5 truncate max-w-[180px]">{displayEmail}</p>
        </div>
        <div className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </button>

      <div className="space-y-4">
        {/* Regular Menu Items */}
        {menuItems.map(item => (
          <button 
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="w-full bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 active:scale-[0.98] transition group text-left"
          >
            <div className="flex items-center gap-4">
              <div className={`${item.bg} ${item.color} p-2.5 rounded-2xl`}>
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-gray-800">{item.label}</p>
                <p className="text-[10px] text-gray-400 font-medium line-clamp-1">{item.description}</p>
              </div>
            </div>
            <div className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </button>
        ))}

        <button 
          onClick={onLogout}
          className="w-full bg-red-50 p-5 rounded-3xl shadow-sm border border-red-100 flex items-center justify-between hover:bg-red-100 active:scale-[0.98] transition group text-left mt-8"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white text-red-500 p-2.5 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
            <div>
              <p className="font-bold text-red-600">Log Out</p>
              <p className="text-[10px] text-red-400 font-medium">Sign out of your account</p>
            </div>
          </div>
        </button>
      </div>

      <div className="p-8 text-center">
        <p className="text-xs text-gray-300 font-medium">WellnessWingman Version 2.6.0</p>
      </div>
    </div>
  );
};

export default MoreTab;

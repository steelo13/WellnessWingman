
import React, { useState } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { Icons } from '../constants';
import { FoodEntry, ExerciseEntry } from '../types';

interface ProfileViewProps {
  user: User | null;
  guestName: string;
  isPremium: boolean;
  onUpdateGuestName: (name: string) => void;
  onClose: () => void;
  entries: FoodEntry[];
  exercises: ExerciseEntry[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, guestName, isPremium, onUpdateGuestName, onClose, entries, exercises }) => {
  const [name, setName] = useState(user?.displayName || guestName);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    if (user) {
      try {
        await updateProfile(user, { displayName: name });
      } catch (e) {
        console.error("Failed to update Firebase profile", e);
      }
    } else {
      onUpdateGuestName(name);
    }
    setIsEditing(false);
    setLoading(false);
  };

  const totalCalories = entries.reduce((acc, curr) => acc + curr.calories, 0);
  const totalWorkouts = exercises.length;
  const avatarUrl = user?.photoURL || `https://placehold.co/200x200/0066FF/ffffff?text=${name[0]?.toUpperCase() || 'U'}`;

  return (
    <div className="pb-24 pt-6 px-4 space-y-8 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between sticky top-0 bg-[#effdf5] py-2 z-10">
        <h1 className="text-2xl font-black text-gray-800">Your Profile</h1>
        <button onClick={onClose} className="bg-white p-2 rounded-full shadow-sm text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <img src={avatarUrl} alt="Avatar" className="w-28 h-28 rounded-[40px] object-cover shadow-2xl border-4 border-white" />
          {isPremium && (
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-2 rounded-2xl shadow-lg border-2 border-white">
              {Icons.Star()}
            </div>
          )}
        </div>
        
        <div className="text-center w-full max-w-xs">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full text-center bg-white border border-blue-100 rounded-2xl px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="flex-1 py-2 text-gray-400 font-bold">Cancel</button>
                <button onClick={handleSave} disabled={loading} className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md">
                  {loading ? '...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="group cursor-pointer" onClick={() => setIsEditing(true)}>
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-black text-gray-800">{name}</h2>
                <div className="text-gray-300 group-hover:text-blue-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
              </div>
              <p className="text-sm text-gray-400 font-medium">{user?.email || (user ? "" : "Guest Explorer")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Card */}
      <div className={`p-6 rounded-[32px] border ${isPremium ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-transparent' : 'bg-white border-gray-100'}`}>
         <div className="flex justify-between items-center">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isPremium ? 'text-blue-100' : 'text-gray-400'}`}>Account Tier</p>
              <p className="text-xl font-black">{isPremium ? 'Wellness Pro' : 'Basic Member'}</p>
            </div>
            {!isPremium && (
              <div className="bg-amber-100 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-200">JOIN PRO</div>
            )}
         </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center">
          <p className="text-3xl font-black text-blue-600">{totalCalories.toLocaleString()}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase mt-1">Logged Cals</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center">
          <p className="text-3xl font-black text-green-600">{totalWorkouts}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase mt-1">Activities</p>
        </div>
      </div>

      {/* Detailed Info List */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
           <span className="text-sm font-bold text-gray-800">Account ID</span>
           <span className="text-xs text-gray-400 font-mono">{user?.uid?.substring(0, 10) || 'guest_v2_session'}...</span>
        </div>
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
           <span className="text-sm font-bold text-gray-800">Join Date</span>
           <span className="text-xs text-gray-400">{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A (Guest)'}</span>
        </div>
        <div className="p-6 flex items-center justify-between">
           <span className="text-sm font-bold text-gray-800">Region</span>
           <span className="text-xs text-gray-400">Global / EU</span>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest leading-loose">
          WellnessWingman Cloud Sync Active<br/>Encrypted End-to-End
        </p>
      </div>
    </div>
  );
};

export default ProfileView;

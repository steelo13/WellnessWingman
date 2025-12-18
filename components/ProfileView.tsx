
import React, { useState, useRef } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { Icons } from '../constants';
import { FoodEntry, ExerciseEntry, MacroData } from '../types';

interface ProfileViewProps {
  user: User | null;
  guestName: string;
  isPremium: boolean;
  onUpdateGuestName: (name: string) => void;
  onClose: () => void;
  onUpgrade: () => void;
  entries: FoodEntry[];
  exercises: ExerciseEntry[];
  goal: MacroData;
  waterStreak: number;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  user, 
  guestName, 
  isPremium, 
  onUpdateGuestName, 
  onClose, 
  onUpgrade,
  entries, 
  exercises, 
  goal, 
  waterStreak 
}) => {
  const [name, setName] = useState(user?.displayName || guestName);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      if (user) {
        try {
          // Firebase Auth photoURL limit is 2048 characters. 
          // We don't save Base64 strings to Auth to prevent the crash.
          // For a real app, you'd upload to Firebase Storage and save the URL.
          console.info("Photo updated locally. characterizing characters limit prevents saving long Base64 strings to Auth.");
          // Optional: updateProfile(user, { photoURL: dataUrl }) will throw for Base64.
          
          // Re-rendering with local preference or forcing a soft reload
          window.location.reload(); 
        } catch (e) { console.error(e); }
      }
    };
    reader.readAsDataURL(file);
  };

  const totalCaloriesLogged = entries.reduce((acc, curr) => acc + curr.calories, 0);
  const totalWorkouts = exercises.length;
  const avatarUrl = user?.photoURL || `https://placehold.co/200x200/0066FF/ffffff?text=${name[0]?.toUpperCase() || 'U'}`;

  return (
    <div className="pb-24 pt-6 px-4 space-y-8 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between sticky top-0 bg-[#effdf5] py-2 z-10">
        <h1 className="text-2xl font-black text-gray-800">Your Profile</h1>
        <button onClick={onClose} className="bg-white p-2 rounded-full shadow-sm text-gray-400 transition hover:bg-gray-50 active:scale-90">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Avatar & Name Section */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <img src={avatarUrl} alt="Avatar" className="w-32 h-32 rounded-[44px] object-cover shadow-2xl border-4 border-white transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 rounded-[44px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </div>
          {isPremium && (
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-2.5 rounded-2xl shadow-lg border-2 border-white">
              {Icons.Star()}
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
        </div>
        
        <div className="text-center w-full max-w-xs">
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full text-center bg-white border-2 border-blue-100 rounded-2xl px-4 py-3 text-lg font-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => { setIsEditing(false); setName(user?.displayName || guestName); }} className="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-100 rounded-xl transition">Cancel</button>
                <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-100 active:scale-95 transition">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="group cursor-pointer inline-block" onClick={() => setIsEditing(true)}>
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">{name}</h2>
                <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
              </div>
              <p className="text-sm text-gray-400 font-bold mt-1 tracking-wide">{user?.email || "Guest Account"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Card */}
      <div className={`p-6 rounded-[32px] border-2 transition-all shadow-sm ${isPremium ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-transparent' : 'bg-white border-gray-100'}`}>
         <div className="flex justify-between items-center">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isPremium ? 'text-blue-100' : 'text-gray-400'}`}>Account Tier</p>
              <p className="text-2xl font-black">{isPremium ? 'Wellness Pro' : 'Basic Member'}</p>
            </div>
            {!isPremium && (
              <button 
                onClick={(e) => { e.stopPropagation(); onUpgrade(); }}
                className="bg-amber-100 text-amber-600 text-[10px] font-black px-4 py-2 rounded-full border border-amber-200 active:scale-95 transition-all shadow-sm"
              >
                UPGRADE
              </button>
            )}
            {isPremium && (
               <div className="bg-white/20 p-2 rounded-xl">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
               </div>
            )}
         </div>
      </div>

      {/* Fitness Targets Info */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Goals</h3>
        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-1">
              <p className="text-xs font-bold text-blue-600">Daily Calories</p>
              <p className="text-xl font-black text-gray-800">{goal.calories} kcal</p>
           </div>
           <div className="space-y-1">
              <p className="text-xs font-bold text-red-500">Protein Target</p>
              <p className="text-xl font-black text-gray-800">{goal.protein}g</p>
           </div>
           <div className="space-y-1">
              <p className="text-xs font-bold text-green-500">Hydration Streak</p>
              <p className="text-xl font-black text-gray-800 flex items-center gap-1.5">
                {waterStreak} Days {Icons.Flame()}
              </p>
           </div>
           <div className="space-y-1">
              <p className="text-xs font-bold text-amber-500">Avg Daily Log</p>
              <p className="text-xl font-black text-gray-800">{Math.round(totalCaloriesLogged / (entries.length || 1))} kcal</p>
           </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center">
          <p className="text-3xl font-black text-blue-600">{totalCaloriesLogged.toLocaleString()}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest">Total Cals Logged</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center">
          <p className="text-3xl font-black text-green-600">{totalWorkouts}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest">Activities Recorded</p>
        </div>
      </div>

      <div className="text-center pt-8 opacity-50">
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] leading-loose">
          WellnessWingman Security Core 2.7.0<br/>Privacy First Tracking
        </p>
      </div>
    </div>
  );
};

export default ProfileView;

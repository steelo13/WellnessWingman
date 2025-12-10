import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FoodEntry, MacroData } from '../types';

interface MacroTrackerProps {
  entries: FoodEntry[];
  goal: MacroData;
  isNetMode: boolean;
  onClose: () => void;
}

const MacroTracker: React.FC<MacroTrackerProps> = ({ entries, goal, isNetMode, onClose }) => {
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  
  const chartData = categories.map(cat => {
    const catEntries = entries.filter(e => e.category === cat);
    return {
      name: cat,
      calories: catEntries.reduce((sum, e) => sum + e.calories, 0),
      protein: catEntries.reduce((sum, e) => sum + e.macros.protein, 0),
      carbs: catEntries.reduce((sum, e) => sum + (isNetMode ? (e.macros.carbs - (e.macros.fiber || 0)) : e.macros.carbs), 0),
      fat: catEntries.reduce((sum, e) => sum + e.macros.fat, 0),
    };
  });

  const totals = entries.reduce((acc, e) => ({
    protein: acc.protein + e.macros.protein,
    carbs: acc.carbs + (isNetMode ? (e.macros.carbs - (e.macros.fiber || 0)) : e.macros.carbs),
    fat: acc.fat + e.macros.fat,
  }), { protein: 0, carbs: 0, fat: 0 });

  const getPercentage = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-[#effdf5] py-2 z-10">
        <h1 className="text-2xl font-black text-gray-800">Macro Deep Dive</h1>
        <button 
          onClick={onClose}
          className="bg-white p-2 rounded-full shadow-sm text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-2">
            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Protein</p>
            <p className="text-xs text-gray-400 font-bold">{totals.protein.toFixed(0)}g / {goal.protein}g</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${getPercentage(totals.protein, goal.protein)}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-2">
            <p className="text-xs font-bold text-green-500 uppercase tracking-widest">{isNetMode ? 'Net Carbs' : 'Carbs'}</p>
            <p className="text-xs text-gray-400 font-bold">{totals.carbs.toFixed(0)}g / {goal.carbs}g</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${getPercentage(totals.carbs, goal.carbs)}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-2">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Fat</p>
            <p className="text-xs text-gray-400 font-bold">{totals.fat.toFixed(0)}g / {goal.fat}g</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${getPercentage(totals.fat, goal.fat)}%` }} />
          </div>
        </div>
      </div>

      {/* Calorie Split Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 text-sm mb-4 uppercase tracking-widest px-1">Calorie Split per Meal</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
              />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <Bar dataKey="calories" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
        <p className="text-xs text-gray-500">
          Viewing {isNetMode ? 'Net Carbs (Carbs - Fiber)' : 'Total Carbohydrates'}.
        </p>
      </div>
    </div>
  );
};

export default MacroTracker;
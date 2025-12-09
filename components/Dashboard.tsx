import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MacroData, FoodEntry, ExerciseEntry } from '../types';
import { Icons } from '../constants';

interface DashboardProps {
  entries: FoodEntry[];
  exercises: ExerciseEntry[];
  goal: MacroData;
  steps: number;
  isSyncing: boolean;
  onSync: () => void;
  onCameraClick: () => void;
  isNetCarbs: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ entries, exercises, goal, steps, isSyncing, onSync, onCameraClick, isNetCarbs }) => {
  const current = entries.reduce((acc, curr) => ({
    calories: acc.calories + curr.calories,
    carbs: acc.carbs + (isNetCarbs ? (curr.macros.carbs - (curr.macros.fiber || 0)) : curr.macros.carbs),
    fat: acc.fat + curr.macros.fat,
    protein: acc.protein + curr.macros.protein,
  }), { calories: 0, carbs: 0, fat: 0, protein: 0 });

  const burned = exercises.reduce((acc, curr) => acc + curr.caloriesBurned, 0);
  const remaining = (goal.calories + burned) - current.calories;

  const pieData = [
    { name: isNetCarbs ? 'Net Carbs' : 'Carbs', value: current.carbs || 1 },
    { name: 'Fat', value: current.fat || 1 },
    { name: 'Protein', value: current.protein || 1 },
  ];

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      {/* Daily Summary */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-gray-400 font-semibold uppercase tracking-wider text-xs mb-1">Net Calories Remaining</h2>
            <p className="text-4xl font-extrabold text-blue-600">{remaining}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-gray-400">Goal: {goal.calories}</p>
            <p className="text-xs font-medium text-gray-400">Food: <span className="text-red-500">-{current.calories}</span></p>
            <p className="text-xs font-medium text-gray-400">Exercise: <span className="text-green-500">+{burned}</span></p>
          </div>
        </div>
        
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-700 ease-out" 
            style={{ width: `${Math.min(100, (current.calories / (goal.calories + burned)) * 100)}%` }}
          />
        </div>
      </div>

      {/* AI Log Call to Action */}
      <button 
        onClick={onCameraClick}
        className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl flex items-center justify-between shadow-xl shadow-blue-100 group transition active:scale-[0.98]"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="bg-white/20 p-3 rounded-2xl group-hover:bg-white/30 transition">
            {Icons.Camera()}
          </div>
          <div>
            <h3 className="text-lg font-extrabold">Log with AI Vision</h3>
            <p className="text-xs text-blue-100 font-medium">Identify foods and macros from a photo</p>
          </div>
        </div>
        <div className="bg-white/20 p-2 rounded-full group-hover:translate-x-1 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </button>

      {/* Macros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="w-full font-bold text-gray-800 mb-4">Macro Distribution</h3>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                  isAnimationActive={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={entry.name.includes('Carbs') ? '#34C759' : entry.name === 'Fat' ? '#FFCC00' : '#FF3B30'} 
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 w-full mt-2 text-center">
            <div>
              <p className="text-[10px] text-gray-400 truncate">{isNetCarbs ? 'Net Carbs' : 'Carbs'}</p>
              <p className="font-bold text-sm" style={{ color: '#34C759' }}>{current.carbs.toFixed(0)}g</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Fat</p>
              <p className="font-bold text-sm" style={{ color: '#FFCC00' }}>{current.fat.toFixed(0)}g</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Protein</p>
              <p className="font-bold text-sm" style={{ color: '#FF3B30' }}>{current.protein.toFixed(0)}g</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Steps & Activity</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-4xl font-black text-blue-600 transition-all duration-300">
              {steps.toLocaleString()}
            </p>
            <p className="text-gray-400 text-xs font-medium">Steps Today</p>
            <button 
              onClick={onSync}
              disabled={isSyncing}
              className={`mt-4 px-6 py-2 rounded-full text-xs font-semibold transition flex items-center gap-2 ${
                isSyncing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {isSyncing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Syncing...
                </>
              ) : 'Sync Fitness Tracker'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
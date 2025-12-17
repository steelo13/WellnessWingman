
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
  onResetSteps: () => void;
  waterIntake: number;
  waterGoal: number;
  streak: number;
  onAddWater: () => void;
  onResetWater: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ entries, exercises, goal, steps, isSyncing, onSync, onCameraClick, isNetCarbs, onResetSteps, waterIntake, waterGoal, streak, onAddWater, onResetWater }) => {
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

  // Calculate fill percentage for the "big blue cup"
  const waterFillPercentage = Math.min(100, (waterIntake / waterGoal) * 100);

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

      {/* Macros & Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="w-full font-bold text-gray-800 mb-4 text-sm">Macro Distribution</h3>
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

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Steps & Activity</h3>
            <button 
              onClick={onResetSteps}
              className="text-[10px] text-gray-400 hover:text-red-500 font-bold bg-gray-50 px-2 py-1 rounded-lg transition"
            >
              RESET
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-4 relative z-10">
            <p className="text-4xl font-black text-blue-600 transition-all duration-300">
              {steps.toLocaleString()}
            </p>
            <p className="text-gray-400 text-xs font-medium mb-4">Steps Today</p>
            
            <div className="text-blue-400">
               {Icons.Walker()}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50"></div>
        </div>
      </div>

      {/* Water Intake Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex justify-between items-start mb-6 relative z-10">
           <div>
              <h3 className="font-bold text-gray-800 text-lg">Hydration</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Goal: {waterGoal}ml</p>
           </div>
           <div className="flex flex-col items-end gap-2">
              {streak > 0 ? (
                <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border border-orange-100 shadow-sm">
                   {Icons.Flame()} {streak} Day Streak
                </div>
              ) : (
                <div className="bg-gray-50 text-gray-400 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-100">
                   0 Day Streak
                </div>
              )}

              {/* BIG BLUE FILLING CUP */}
              <div className="relative w-16 h-20 mt-1 flex flex-col items-center">
                 <div className="relative w-full h-full border-[3px] border-blue-100 rounded-b-2xl rounded-t-sm overflow-hidden bg-white/50">
                    {/* The Water Fill Level */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-1000 ease-in-out shadow-[0_-4px_10px_rgba(59,130,246,0.3)]"
                      style={{ height: `${waterFillPercentage}%` }}
                    >
                      {/* Animated Surface Wave effect */}
                      {waterFillPercentage > 0 && waterFillPercentage < 100 && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400/50 animate-pulse"></div>
                      )}
                    </div>
                 </div>
                 {/* 250ml label in blue */}
                 <span className="text-[10px] font-black text-blue-500 mt-1">250ml</span>
              </div>
           </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="flex items-center gap-4 mb-6 relative z-10">
           <div className="flex-1">
              <div className="flex justify-between text-xs font-black mb-2">
                 <span className="text-blue-600">{Math.round(waterFillPercentage)}% Complete</span>
                 <span className="text-gray-300">{waterIntake}ml</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-50 p-0.5">
                 <div 
                   className="h-full bg-blue-500 rounded-full transition-all duration-1000 relative" 
                   style={{ width: `${waterFillPercentage}%` }}
                 >
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-[pulse_2s_infinite]"></div>
                 </div>
              </div>
           </div>
        </div>

        {/* Glasses Grid (Visual Checklist) */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 relative z-10">
           {[...Array(10)].map((_, i) => (
             <div key={i} className={`transition-all duration-500 transform ${i < (waterIntake / 250) ? 'scale-110' : 'scale-90 opacity-30 grayscale'}`}>
                {Icons.Glass(i < (waterIntake / 250))}
             </div>
           ))}
        </div>

        <div className="flex gap-3 relative z-10">
          <button 
            onClick={onResetWater}
            className="px-6 py-4 rounded-2xl font-bold bg-gray-50 text-gray-400 hover:text-red-500 transition border border-transparent hover:border-red-100 active:scale-95"
          >
            Reset
          </button>
          <button 
            onClick={onAddWater}
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-[0.97] transition-all flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            {Icons.DropletFilled(18)} Add Glass (250ml)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

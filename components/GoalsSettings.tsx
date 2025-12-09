
import React, { useState } from 'react';
import { MacroData } from '../types';

interface GoalsSettingsProps {
  currentGoal: MacroData;
  onSave: (newGoal: MacroData) => void;
}

const GoalsSettings: React.FC<GoalsSettingsProps> = ({ currentGoal, onSave }) => {
  const [goal, setGoal] = useState<MacroData>(currentGoal);

  const handleChange = (key: keyof MacroData, value: string) => {
    const numValue = parseInt(value) || 0;
    setGoal(prev => ({ ...prev, [key]: numValue }));
  };

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Adjust Your Goals</h1>
        <button 
          onClick={() => onSave(goal)}
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-md active:scale-95 transition"
        >
          Save
        </button>
      </div>

      {/* Calories Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <label className="text-gray-400 font-semibold uppercase tracking-wider text-xs mb-2 block">Daily Calorie Budget</label>
        <div className="flex items-baseline gap-2">
          <input 
            type="number" 
            value={goal.calories}
            onChange={(e) => handleChange('calories', e.target.value)}
            className="text-4xl font-black text-blue-600 outline-none w-full bg-transparent"
          />
          <span className="text-gray-300 font-bold">kcal</span>
        </div>
      </div>

      {/* Macros Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide px-1">Macro Splits</h3>
        
        <div className="grid grid-cols-1 gap-3">
          {/* Protein */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-500 uppercase">Protein</p>
              <div className="flex items-baseline gap-1 mt-1">
                <input 
                  type="number" 
                  value={goal.protein}
                  onChange={(e) => handleChange('protein', e.target.value)}
                  className="text-2xl font-black text-gray-800 outline-none w-20 bg-transparent"
                />
                <span className="text-gray-400 font-medium">g</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">{(goal.protein * 4)} kcal</p>
              <p className="text-[10px] text-gray-400 font-bold">{Math.round((goal.protein * 4 / goal.calories) * 100)}%</p>
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-500 uppercase">Carbohydrates</p>
              <div className="flex items-baseline gap-1 mt-1">
                <input 
                  type="number" 
                  value={goal.carbs}
                  onChange={(e) => handleChange('carbs', e.target.value)}
                  className="text-2xl font-black text-gray-800 outline-none w-20 bg-transparent"
                />
                <span className="text-gray-400 font-medium">g</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">{(goal.carbs * 4)} kcal</p>
              <p className="text-[10px] text-gray-400 font-bold">{Math.round((goal.carbs * 4 / goal.calories) * 100)}%</p>
            </div>
          </div>

          {/* Fat */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase">Fat</p>
              <div className="flex items-baseline gap-1 mt-1">
                <input 
                  type="number" 
                  value={goal.fat}
                  onChange={(e) => handleChange('fat', e.target.value)}
                  className="text-2xl font-black text-gray-800 outline-none w-20 bg-transparent"
                />
                <span className="text-gray-400 font-medium">g</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">{(goal.fat * 9)} kcal</p>
              <p className="text-[10px] text-gray-400 font-bold">{Math.round((goal.fat * 9 / goal.calories) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 px-4 text-center">
        Note: The totals may not perfectly add up to the calorie goal depending on rounding. 
        Aim for consistency!
      </p>
    </div>
  );
};

export default GoalsSettings;

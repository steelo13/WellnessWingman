import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';

interface MealPlannerProps {
  savedRecipes: Recipe[];
  onClose: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const MealPlanner: React.FC<MealPlannerProps> = ({ savedRecipes, onClose }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [plan, setPlan] = useState<Record<string, Record<string, Recipe | null>>>({});
  const [showRecipePicker, setShowRecipePicker] = useState<{ day: string, meal: string } | null>(null);

  useEffect(() => {
    const savedPlan = localStorage.getItem('wellness_meal_plan');
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error("Failed to parse meal plan");
      }
    }
  }, []);

  const savePlan = (newPlan: Record<string, Record<string, Recipe | null>>) => {
    setPlan(newPlan);
    localStorage.setItem('wellness_meal_plan', JSON.stringify(newPlan));
  };

  const handleSetMeal = (recipe: Recipe) => {
    if (!showRecipePicker) return;
    const { day, meal } = showRecipePicker;
    
    const newPlan = { ...plan };
    if (!newPlan[day]) newPlan[day] = {};
    newPlan[day][meal] = recipe;
    
    savePlan(newPlan);
    setShowRecipePicker(null);
  };

  const handleClearMeal = (day: string, meal: string) => {
    const newPlan = { ...plan };
    if (newPlan[day]) {
      newPlan[day][meal] = null;
      savePlan(newPlan);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 space-y-6 bg-[#effdf5] min-h-full">
      <div className="flex items-center justify-between sticky top-0 bg-[#effdf5] py-2 z-10">
        <h1 className="text-2xl font-black text-gray-800">Weekly Planner</h1>
        <button 
          onClick={onClose}
          className="bg-white p-2 rounded-full shadow-sm text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Day Selector - Fixed 7 Day Layout */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 flex justify-between items-center">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
              selectedDay === day 
                ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* Meal Slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-lg font-bold text-gray-800">{selectedDay}</h2>
           <span className="text-xs text-gray-400 font-medium">{Object.keys(plan[selectedDay] || {}).filter(k => plan[selectedDay][k]).length} meals planned</span>
        </div>

        {MEALS.map(mealType => {
          const planned = plan[selectedDay]?.[mealType];
          
          return (
            <div key={mealType} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{mealType}</span>
                {planned && (
                  <button 
                    onClick={() => handleClearMeal(selectedDay, mealType)}
                    className="text-gray-300 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
              
              {planned ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">{planned.title}</h3>
                    <p className="text-[10px] font-medium text-gray-400">{planned.calories} kcal · {planned.macros.protein}g Protein</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowRecipePicker({ day: selectedDay, meal: mealType })}
                  className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-bold text-xs gap-2 hover:bg-slate-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Schedule Meal
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Recipe Selector Modal */}
      {showRecipePicker && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Choose Recipe</h2>
              <button 
                onClick={() => setShowRecipePicker(null)}
                className="bg-gray-100 p-2 rounded-full text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto space-y-3 custom-scrollbar overscroll-none">
              {savedRecipes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm font-medium">No saved recipes found.</p>
                  <p className="text-xs">Go to Ideas tab to search and save your favorites first!</p>
                </div>
              ) : (
                savedRecipes.map(recipe => (
                  <button 
                    key={recipe.id}
                    onClick={() => handleSetMeal(recipe)}
                    className="w-full text-left bg-gray-50 p-4 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition"
                  >
                    <h3 className="font-bold text-gray-800">{recipe.title}</h3>
                    <p className="text-[10px] text-gray-400">{recipe.calories} cal · {recipe.macros.protein}g Protein</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
        <p className="text-xs font-bold text-blue-600 uppercase mb-2">Pro Tip</p>
        <p className="text-gray-500 text-xs leading-relaxed">
          Planning your meals in advance reduces the chance of impulsive eating and helps you hit your macro targets perfectly.
        </p>
      </div>
    </div>
  );
};

export default MealPlanner;
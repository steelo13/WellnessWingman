import React, { useState } from 'react';
import { MacroData, Recipe } from '../types';
import { getRecipeRecommendations } from '../services/geminiService';
import { Icons } from '../constants';

interface RecipeExplorerProps {
  remainingMacros: MacroData;
  savedRecipes: Recipe[];
  isNetMode: boolean;
  onToggleSave: (recipe: Recipe) => void;
  onEditGoals: () => void;
}

const RecipeExplorer: React.FC<RecipeExplorerProps> = ({ remainingMacros, savedRecipes, isNetMode, onToggleSave, onEditGoals }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleSuggest = async (customQuery?: string) => {
    setIsLoading(true);
    try {
      const queryToUse = customQuery || searchQuery.trim() || undefined;
      const suggested = await getRecipeRecommendations(remainingMacros, queryToUse);
      setRecipes(suggested);
    } catch (error) {
      console.error("Recipe generation failed:", error);
      alert("Wellness Wingman couldn't cook up ideas right now. Try again later!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (recipe: Recipe) => {
    const textToShare = [
      `🍳 ${recipe.title}`,
      `📝 ${recipe.description}`,
      `⚡ ${recipe.calories} kcal | 🥩 ${recipe.macros.protein}g Protein`,
      '',
      '🥕 INGREDIENTS:',
      recipe.ingredients.map(i => `• ${i}`).join('\n'),
      '',
      '👨‍🍳 INSTRUCTIONS:',
      recipe.instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')
    ].join('\n');

    // 1. Try Native Share
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: textToShare,
        });
        return; 
      } catch (err) {
        // Ignore AbortError (user cancelled)
        if ((err as Error).name === 'AbortError') return;
        console.warn('Share API failed, trying clipboard...', err);
      }
    }

    // 2. Try Clipboard API
    try {
      await navigator.clipboard.writeText(textToShare);
      alert('Recipe copied to clipboard!');
    } catch (err) {
      // 3. Fallback to legacy execCommand
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToShare;
        textArea.style.position = "fixed"; 
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Recipe copied to clipboard!');
      } catch (e) {
        alert('Could not share or copy recipe.');
      }
    }
  };

  const isSaved = (id: string) => savedRecipes.some(r => r.id === id);

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Healthy Suggestions</h1>
        
        {/* Primary AI Action */}
        <button 
          onClick={() => handleSuggest()}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5 rounded-3xl font-bold shadow-xl shadow-blue-100 flex items-center justify-between group active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="bg-white/20 p-2 rounded-2xl">
              {Icons.Brain()}
            </div>
            <div>
              <p className="text-lg">AI Meal Suggestions</p>
              <p className="text-xs text-blue-100 font-medium">Balanced for your remaining macros</p>
            </div>
          </div>
          <div className="group-hover:translate-x-1 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </button>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
              placeholder="Search ingredient or dish..."
              className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-3 pl-10 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          <button 
            onClick={() => handleSuggest()}
            disabled={isLoading}
            className="bg-white text-blue-600 border border-blue-100 px-6 py-3 rounded-2xl font-bold shadow-sm active:scale-95 disabled:bg-gray-50 transition shrink-0"
          >
            Go
          </button>
        </div>
      </div>

      <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Current Balance Focus</p>
          <button 
            onClick={onEditGoals}
            className="text-[10px] font-bold text-blue-600 underline"
          >
            Adjust Goals
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <p className="text-[10px] text-gray-400">Cal</p>
            <p className="font-bold text-gray-800">{remainingMacros.calories}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Pro</p>
            <p className="font-bold text-red-500">{remainingMacros.protein}g</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">{isNetMode ? 'Net Car' : 'Car'}</p>
            <p className="font-bold text-green-500">{remainingMacros.carbs}g</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Fat</p>
            <p className="font-bold text-amber-500">{remainingMacros.fat}g</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
           <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
           <p className="mt-4 text-blue-600 font-bold">Chef Wingman is on it...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-12 px-6">
          <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-3xl">🍲</span>
          </div>
          <p className="text-gray-500 font-medium leading-relaxed">Tap the blue button above for personalized meal suggestions or search for a specific dish!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recipes.map(recipe => (
            <div 
              key={recipe.id} 
              onClick={() => setSelectedRecipe(recipe)}
              className="animate-entry bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex items-start gap-4 cursor-pointer hover:border-blue-100 transition"
            >
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1">{recipe.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{recipe.calories} kcal</span>
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {recipe.prepTime}
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 text-blue-600 p-2 rounded-xl self-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300 custom-scrollbar overscroll-none">
          <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
             <button onClick={() => setSelectedRecipe(null)} className="p-2 -ml-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
             </button>
             <h2 className="text-lg font-bold truncate px-4 flex-1 text-center">{selectedRecipe.title}</h2>
             <div className="flex items-center gap-1">
               <button 
                  onClick={(e) => { e.stopPropagation(); handleShare(selectedRecipe); }}
                  className="p-2 text-blue-600 transition active:scale-90"
               >
                  {Icons.Share()}
               </button>
               <button 
                  onClick={(e) => { e.stopPropagation(); onToggleSave(selectedRecipe); }}
                  className="p-2 transition active:scale-90"
               >
                  {Icons.Heart(isSaved(selectedRecipe.id))}
               </button>
             </div>
          </header>
          <div className="px-6 pb-24 pt-4 space-y-6">
            <div className="space-y-4">
              <p className="text-gray-500 leading-relaxed">{selectedRecipe.description}</p>
              
              <div className="bg-gray-50 p-5 rounded-3xl space-y-4 border border-gray-100 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Calories</p>
                    <p className="text-2xl font-black text-blue-600">{selectedRecipe.calories} <span className="text-xs font-bold text-gray-300">kcal</span></p>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Time</p>
                    <p className="text-2xl font-black text-gray-800">{selectedRecipe.prepTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t pt-4 border-gray-200">
                  <div className="text-center">
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">Protein</p>
                    <p className="text-lg font-black text-red-500">{selectedRecipe.macros.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-1">{isNetMode ? 'Net Carbs' : 'Total Carbs'}</p>
                    <p className="text-lg font-black text-green-500">{isNetMode ? (selectedRecipe.macros.carbs - (selectedRecipe.macros.fiber || 0)).toFixed(1) : selectedRecipe.macros.carbs}g</p>
                    {selectedRecipe.macros.fiber ? <p className="text-[10px] text-gray-400">Fiber: {selectedRecipe.macros.fiber}g</p> : null}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Fat</p>
                    <p className="text-lg font-black text-amber-500">{selectedRecipe.macros.fat}g</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Ingredients</h3>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span className="text-sm text-gray-700">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Preparation</h3>
              <div className="space-y-4">
                {selectedRecipe.instructions.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="font-black text-blue-200 text-3xl shrink-0 leading-none">{i+1}</span>
                    <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onToggleSave(selectedRecipe)}
              className={`w-full py-4 rounded-2xl font-bold transition shadow-lg flex items-center justify-center gap-3 ${
                isSaved(selectedRecipe.id) 
                  ? 'bg-red-50 text-red-600 border border-red-100 shadow-none' 
                  : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {Icons.Heart(isSaved(selectedRecipe.id))}
              {isSaved(selectedRecipe.id) ? 'Saved to Favorites' : 'Save for Later'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeExplorer;
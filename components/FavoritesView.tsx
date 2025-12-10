
import React, { useState } from 'react';
import { Recipe } from '../types';
import { Icons } from '../constants';

interface FavoritesViewProps {
  recipes: Recipe[];
  onRemove: (recipe: Recipe) => void;
  onClose: () => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ recipes, onRemove, onClose }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleShare = async (recipe: Recipe) => {
    const shareData = {
      title: `Healthy Recipe: ${recipe.title}`,
      text: `I found this great recipe on WellnessWingman!\n\n${recipe.title}\n${recipe.calories} kcal | ${recipe.macros.protein}g Protein\n\n${recipe.description}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
         const text = `${shareData.title}\n\n${shareData.text}\n\nIngredients:\n${recipe.ingredients.join(', ')}\n\nInstructions:\n${recipe.instructions.join('\n')}`;
         await navigator.clipboard.writeText(text);
         alert('Recipe details copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleRemove = (recipe: Recipe) => {
    onRemove(recipe);
    if (selectedRecipe?.id === recipe.id) {
      setSelectedRecipe(null);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-slate-50 py-2 z-10">
        <h1 className="text-2xl font-black text-gray-800">Saved Favorites</h1>
        <button 
          onClick={onClose}
          className="bg-white p-2 rounded-full shadow-sm text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
           <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-4">
             {Icons.Star()}
           </div>
           <h3 className="text-lg font-bold text-gray-700">No Favorites Yet</h3>
           <p className="text-gray-400 mt-2 max-w-xs">Explore the Plans tab to find and save healthy recipes you love!</p>
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
              <div className="bg-yellow-50 text-yellow-500 p-2 rounded-xl self-center">
                 {Icons.Star()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
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
                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-1">Carbs</p>
                    <p className="text-lg font-black text-green-500">{selectedRecipe.macros.carbs}g</p>
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
              onClick={() => handleRemove(selectedRecipe)}
              className="w-full py-4 rounded-2xl font-bold transition shadow-none bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              Remove from Favorites
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesView;

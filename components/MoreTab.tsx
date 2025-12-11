import React from 'react';
import { Icons } from '../constants';

interface MoreTabProps {
  onSelect: (id: string) => void;
  isNetCarbsMode: boolean;
  onToggleNetCarbs: () => void;
}

const MoreTab: React.FC<MoreTabProps> = ({ onSelect, isNetCarbsMode, onToggleNetCarbs }) => {
  const menuItems = [
    { id: 'favorites', label: 'Saved Favorites', icon: Icons.Star(), description: 'Your collection of loved recipes', color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'vision', label: 'Log with AI Vision', icon: Icons.Camera(), description: 'Identify foods and macros from a photo', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'barcode', label: 'Scan Barcodes', icon: Icons.Barcode(), description: 'Identify packaged foods instantly', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'goals', label: 'Adjust Your Goals', icon: Icons.Dashboard(), description: 'Change calories and macro splits', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'macros', label: 'Track Macros', icon: Icons.Chart(), description: 'Deep dive into your nutrition balance', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'planner', label: 'Meal Planner', icon: Icons.Plans(), description: 'Schedule your healthy meals for the week', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="pb-24 pt-6 px-4 space-y-6">
      <h1 className="text-2xl font-bold">More Features</h1>

      <div className="space-y-4">
        {/* Special Toggle Mode */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl">
              {Icons.Leaf()}
            </div>
            <div>
              <p className="font-bold text-gray-800">Net Carb Mode</p>
              <p className="text-[10px] text-gray-400 font-medium">Subtract fiber from total carbs</p>
            </div>
          </div>
          <button 
            onClick={onToggleNetCarbs}
            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${isNetCarbsMode ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isNetCarbsMode ? 'translate-x-6' : ''}`} />
          </button>
        </div>

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
      </div>

      <div className="p-8 text-center">
        <p className="text-xs text-gray-300 font-medium">WellnessWingman Version 2.6.0</p>
      </div>
    </div>
  );
};

export default MoreTab;

export interface MacroData {
  carbs: number;
  fat: number;
  protein: number;
  calories: number;
  fiber?: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  amount: string;
  calories: number;
  macros: MacroData;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  timestamp: number;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  duration: number; // in minutes
  caloriesBurned: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  calories: number;
  macros: MacroData;
  prepTime: string;
  ingredients: string[];
  instructions: string[];
}

export enum AppView {
  DASHBOARD = 'dashboard',
  DIARY = 'diary',
  PLANS = 'plans',
  CHAT = 'chat',
  MORE = 'more',
  SCANNER = 'scanner',
  MEAL_PLANNER = 'meal_planner',
  MACRO_TRACKER = 'macro_tracker',
  CAMERA = 'camera',
  FAVORITES = 'favorites'
}

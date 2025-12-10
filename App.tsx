import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FoodEntry, ExerciseEntry, MacroData, AppView, ChatMessage, Recipe } from './types';
import { Icons, COLORS } from './constants';
import Dashboard from './components/Dashboard';
import PremiumModal from './components/PremiumModal';
import GoalsSettings from './components/GoalsSettings';
import RecipeExplorer from './components/RecipeExplorer';
import MoreTab from './components/MoreTab';
import BarcodeScannerView from './components/BarcodeScannerView';
import MealPlanner from './components/MealPlanner';
import MacroTracker from './components/MacroTracker';
import CameraCaptureView from './components/CameraCaptureView';
import FavoritesView from './components/FavoritesView';
import { analyzeFoodImage, createCoachChatSession, parseVoiceCommand, lookupFoodByBarcode } from './services/geminiService';

const DEFAULT_GOAL: MacroData = {
  calories: 2200,
  carbs: 250,
  fat: 70,
  protein: 150,
  fiber: 30
};

const QUICK_FOODS = [
  { name: '1 Banana', calories: 105, macros: { carbs: 27, fat: 0, protein: 1, fiber: 3, calories: 105 }, amount: '1 medium', category: 'Snacks' as const },
  { name: '1 scoop Whey', calories: 120, macros: { carbs: 3, fat: 1, protein: 24, fiber: 0, calories: 120 }, amount: '30g', category: 'Snacks' as const },
  { name: '1 bowl Rice', calories: 205, macros: { carbs: 45, fat: 0, protein: 4, fiber: 1, calories: 205 }, amount: '1 cup', category: 'Lunch' as const },
  { name: '1 Apple', calories: 95, macros: { carbs: 25, fat: 0, protein: 1, fiber: 4.5, calories: 95 }, amount: '1 large', category: 'Snacks' as const },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [moreSubView, setMoreSubView] = useState<'menu' | 'goals'>('menu');
  const [isNetCarbsMode, setIsNetCarbsMode] = useState(false);
  
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  
  // Step tracking state
  const [steps, setSteps] = useState(0);
  const [isSyncingSteps, setIsSyncingSteps] = useState(false);
  
  // Water tracking state
  const [waterIntake, setWaterIntake] = useState(0);

  const [userGoal, setUserGoal] = useState<MacroData>(DEFAULT_GOAL);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Hey champion! Wellness Wingman here. Ready to crush your fitness goals today? Ask me anything!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [useDeepThinking, setUseDeepThinking] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [pendingInstructions, setPendingInstructions] = useState('');
  
  const [lastLoggedId, setLastLoggedId] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const chatSessionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exName, setExName] = useState('');
  const [exDuration, setExDuration] = useState('');
  const [exCalories, setExCalories] = useState('');

  // Step detection refs
  const lastStepTime = useRef(0);

  // Define handleMotion via useCallback so it can be added/removed reliably
  const handleMotion = useCallback((event: any) => {
    // accelerationIncludingGravity provides the most reliable step data across devices
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const { x, y, z } = acc;
    // Calculate magnitude of the acceleration vector
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Threshold adjusted to 13.5 m/s^2 (Gravity ~9.8).
    // This reduces false positives from sitting/handling the phone vs walking.
    if (magnitude > 13.5) {
      const now = Date.now();
      // Debounce steps to prevent double counting (max 2 steps/sec roughly)
      if (now - lastStepTime.current > 500) {
        setSteps(prev => prev + 1);
        lastStepTime.current = now;
      }
    }
  }, []);

  // Initialize listeners
  useEffect(() => {
    // Check if we can add listener immediately (non-iOS or previously granted)
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
       // We try to add it. On iOS 13+ this might do nothing without a user gesture request first,
       // which is handled in handleSyncSteps.
       window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [handleMotion]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isAiThinking]);

  useEffect(() => {
    chatSessionRef.current = null;
  }, [useDeepThinking, customInstructions]);

  useEffect(() => {
    const saved = localStorage.getItem('wellness_saved_recipes');
    if (saved) {
      try {
        setSavedRecipes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved recipes");
      }
    }
    const savedInstructions = localStorage.getItem('wellness_coach_instructions');
    if (savedInstructions) {
      setCustomInstructions(savedInstructions);
      setPendingInstructions(savedInstructions);
    }
    const savedNetMode = localStorage.getItem('wellness_net_carbs_mode');
    if (savedNetMode) setIsNetCarbsMode(savedNetMode === 'true');

    // Load water intake
    const savedWater = localStorage.getItem('wellness_water_intake');
    const savedDate = localStorage.getItem('wellness_water_date');
    const today = new Date().toDateString();
    
    if (savedDate === today && savedWater) {
      setWaterIntake(parseInt(savedWater));
    } else {
      setWaterIntake(0);
      localStorage.setItem('wellness_water_date', today);
    }
  }, []);

  const toggleNetCarbs = () => {
    const newVal = !isNetCarbsMode;
    setIsNetCarbsMode(newVal);
    localStorage.setItem('wellness_net_carbs_mode', newVal.toString());
  };

  const persistRecipes = (updated: Recipe[]) => {
    localStorage.setItem('wellness_saved_recipes', JSON.stringify(updated));
  };

  const handleToggleSaveRecipe = (recipe: Recipe) => {
    const isAlreadySaved = savedRecipes.some(r => r.id === recipe.id);
    let updated;
    if (isAlreadySaved) {
      updated = savedRecipes.filter(r => r.id !== recipe.id);
    } else {
      updated = [...savedRecipes, recipe];
    }
    setSavedRecipes(updated);
    persistRecipes(updated);
  };

  const saveInstructions = () => {
    setCustomInstructions(pendingInstructions);
    localStorage.setItem('wellness_coach_instructions', pendingInstructions);
    setShowInstructionsModal(false);
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setVoiceTranscript(prev => prev + event.results[i][0].transcript + ' ');
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startVoiceLogging = () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }

    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    setVoiceTranscript('');
    setIsListening(true);
    setShowVoiceModal(true);
    recognitionRef.current.start();
  };

  const stopVoiceLoggingAndParse = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    
    if (!voiceTranscript.trim()) {
      setShowVoiceModal(false);
      return;
    }

    setIsAiThinking(true);
    try {
      const result = await parseVoiceCommand(voiceTranscript);
      if (result.type === 'food') {
        const newEntry: FoodEntry = {
          id: crypto.randomUUID(),
          name: result.data.name,
          amount: result.data.amount || '1 serving',
          calories: result.data.calories || 0,
          macros: {
            carbs: result.data.carbs || 0,
            fat: result.data.fat || 0,
            protein: result.data.protein || 0,
            fiber: result.data.fiber || 0,
            calories: result.data.calories || 0
          },
          category: result.data.category || 'Lunch',
          timestamp: Date.now()
        };
        addEntry(newEntry);
      } else if (result.type === 'exercise') {
        const newExId = crypto.randomUUID();
        const newEx: ExerciseEntry = {
          id: newExId,
          name: result.data.name,
          duration: result.data.duration || 30,
          caloriesBurned: result.data.caloriesBurned || 200,
          timestamp: Date.now()
        };
        setExercises(prev => [...prev, newEx]);
        setLastLoggedId(newExId);
        setTimeout(() => setLastLoggedId(null), 2500);
      }
      setActiveView(AppView.DIARY);
    } catch (err) {
      console.error("Voice parse error:", err);
      alert("I understood you spoke, but I couldn't quite map that to an entry. Try being more specific like 'I had an apple' or 'I ran for 20 minutes'.");
    } finally {
      setIsAiThinking(false);
      setShowVoiceModal(false);
      setVoiceTranscript('');
    }
  };

  const currentConsumption = entries.reduce((acc, curr) => ({
    calories: acc.calories + curr.calories,
    carbs: acc.carbs + (isNetCarbsMode ? curr.macros.carbs - (curr.macros.fiber || 0) : curr.macros.carbs),
    fat: acc.fat + curr.macros.fat,
    protein: acc.protein + curr.macros.protein,
  }), { calories: 0, carbs: 0, fat: 0, protein: 0 });

  const burned = exercises.reduce((acc, curr) => acc + curr.caloriesBurned, 0);

  const remainingMacros: MacroData = {
    calories: Math.max(0, (userGoal.calories + burned) - currentConsumption.calories),
    carbs: Math.max(0, userGoal.carbs - currentConsumption.carbs),
    fat: Math.max(0, userGoal.fat - currentConsumption.fat),
    protein: Math.max(0, userGoal.protein - currentConsumption.protein),
  };

  const handleSyncSteps = () => {
    setIsSyncingSteps(true);
    
    // 1. Hardware Permission Request (iOS 13+)
    // This is the critical "Sync" action for iOS devices to allow accelerometer access
    if (typeof (DeviceMotionEvent as any) !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
             // Re-bind to ensure it is active
             window.removeEventListener('devicemotion', handleMotion);
             window.addEventListener('devicemotion', handleMotion);
          } else {
             alert("Permission is required to sync real-time steps.");
          }
        })
        .catch(console.error);
    } else {
      // For non-iOS, just re-ensure the listener is active
      window.removeEventListener('devicemotion', handleMotion);
      window.addEventListener('devicemotion', handleMotion);
    }

    // 2. Simulate Cloud Sync
    setTimeout(() => {
      // Simulate fetching 'missed' steps from a wearable or background process
      const syncedSteps = Math.floor(Math.random() * 200) + 50; 
      setSteps(prev => prev + syncedSteps);
      setIsSyncingSteps(false);
    }, 1500);
  };

  const handleResetSteps = () => {
    setSteps(0);
  };

  const handleAddWater = () => {
    const newAmount = waterIntake + 250;
    setWaterIntake(newAmount);
    localStorage.setItem('wellness_water_intake', newAmount.toString());
    localStorage.setItem('wellness_water_date', new Date().toDateString());
  };

  const handleResetWater = () => {
    setWaterIntake(0);
    localStorage.setItem('wellness_water_intake', '0');
    localStorage.setItem('wellness_water_date', new Date().toDateString());
  };

  const addEntry = (entry: FoodEntry) => {
    setEntries(prev => [...prev, entry]);
    setLastLoggedId(entry.id);
    setTimeout(() => setLastLoggedId(null), 2500);
  };

  const handleQuickAdd = (item: typeof QUICK_FOODS[number]) => {
    const newEntry: FoodEntry = {
      id: crypto.randomUUID(),
      name: item.name,
      amount: item.amount,
      calories: item.calories,
      macros: { ...item.macros },
      category: item.category,
      timestamp: Date.now()
    };
    addEntry(newEntry);
  };

  const addExercise = () => {
    if (!exName || !exDuration || !exCalories) return;
    const newExId = crypto.randomUUID();
    const newEx: ExerciseEntry = {
      id: newExId,
      name: exName,
      duration: parseInt(exDuration),
      caloriesBurned: parseInt(exCalories),
      timestamp: Date.now()
    };
    setExercises(prev => [...prev, newEx]);
    setLastLoggedId(newExId);
    setTimeout(() => setLastLoggedId(null), 2500);
    
    setShowExerciseModal(false);
    setExName('');
    setExDuration('');
    setExCalories('');
    setActiveView(AppView.DIARY);
  };

  const handleBarcodeScanned = async (barcode: string) => {
    setIsAiThinking(true);
    setActiveView(AppView.DIARY);
    try {
      const result = await lookupFoodByBarcode(barcode);
      const newEntry: FoodEntry = {
        id: crypto.randomUUID(),
        name: result.name || 'Scanned Product',
        amount: result.amount || '1 portion',
        calories: result.calories || 0,
        macros: result.macros || { carbs: 0, fat: 0, protein: 0, fiber: 0, calories: 0 },
        category: (result.category as any) || 'Lunch',
        timestamp: Date.now()
      };
      addEntry(newEntry);
    } catch (err) {
      console.error("Barcode lookup error:", err);
      alert("I couldn't identify that product precisely. Try logging manually or using AI Vision!");
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleCameraCapture = async (dataUrl: string) => {
    setIsAiThinking(true);
    // Switch to diary view to show progress
    setActiveView(AppView.DIARY);

    const mimeType = dataUrl.split(';')[0].split(':')[1];
    const base64 = dataUrl.split(',')[1];

    try {
      const result = await analyzeFoodImage(base64, mimeType);
      const newEntry: FoodEntry = {
        id: crypto.randomUUID(),
        name: result.name || 'Analyzed Meal',
        amount: result.amount || '1 portion',
        calories: result.calories || 0,
        macros: result.macros || { carbs: 0, fat: 0, protein: 0, fiber: 0, calories: 0 },
        category: (result.category as any) || 'Lunch',
        timestamp: Date.now()
      };
      addEntry(newEntry);
    } catch (err) {
      console.error("Camera analysis error:", err);
      alert("Wellness Wingman had trouble seeing that meal. Please try again or check your connection.");
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiThinking(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const resultStr = reader.result as string;
      // Extract mime type dynamically (e.g. data:image/png;base64,...)
      const mimeType = resultStr.split(';')[0].split(':')[1];
      const base64 = resultStr.split(',')[1];
      
      try {
        const result = await analyzeFoodImage(base64, mimeType);
        const newEntry: FoodEntry = {
          id: crypto.randomUUID(),
          name: result.name || 'Analyzed Meal',
          amount: result.amount || '1 portion',
          calories: result.calories || 0,
          macros: result.macros || { carbs: 0, fat: 0, protein: 0, fiber: 0, calories: 0 },
          category: (result.category as any) || 'Lunch',
          timestamp: Date.now()
        };
        addEntry(newEntry);
        setActiveView(AppView.DIARY);
      } catch (err) {
        console.error("Image analysis error:", err);
        alert("Wellness Wingman had trouble seeing that meal. Please try again or check your connection.");
      } finally {
        setIsAiThinking(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }

    const userInput = chatInput;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: userInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiThinking(true);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createCoachChatSession(useDeepThinking, customInstructions);
      }

      const response = await chatSessionRef.current.sendMessage({ message: userInput });
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.text || "I'm processing that. One second!",
        isThinking: useDeepThinking
      }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Lost connection to HQ. Try again in a moment!"
      }]);
      chatSessionRef.current = null;
    } finally {
      setIsAiThinking(false);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case AppView.CAMERA:
        return <CameraCaptureView 
                  onCapture={handleCameraCapture} 
                  onClose={() => setActiveView(AppView.MORE)} 
                />;
      case AppView.MACRO_TRACKER:
        return <MacroTracker entries={entries} goal={userGoal} isNetMode={isNetCarbsMode} onClose={() => setActiveView(AppView.MORE)} />;
      case AppView.MEAL_PLANNER:
        return <MealPlanner 
                  savedRecipes={savedRecipes} 
                  onClose={() => setActiveView(AppView.MORE)} 
                />;
      case AppView.SCANNER:
        return <BarcodeScannerView 
                  onScan={handleBarcodeScanned} 
                  onClose={() => setActiveView(AppView.MORE)} 
                />;
      case AppView.FAVORITES:
        return <FavoritesView 
                  recipes={savedRecipes} 
                  onRemove={handleToggleSaveRecipe} 
                  onClose={() => setActiveView(AppView.MORE)} 
               />;
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            entries={entries} 
            exercises={exercises}
            goal={userGoal} 
            steps={steps} 
            isSyncing={isSyncingSteps} 
            onSync={handleSyncSteps} 
            onCameraClick={() => fileInputRef.current?.click()}
            isNetCarbs={isNetCarbsMode}
            onResetSteps={handleResetSteps}
            waterIntake={waterIntake}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
          />
        );
      case AppView.DIARY:
        return (
          <div className="pb-24 pt-6 px-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Diary</h1>
              <div className="flex gap-2">
                <button 
                  onClick={startVoiceLogging}
                  className="relative bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full border border-blue-200 flex items-center gap-2"
                >
                  {!isPremium && <div className="absolute -top-2 -right-2 text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-black shadow-sm transform scale-90">PRO</div>}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                  VOICE
                </button>
                <button 
                  onClick={() => setShowExerciseModal(true)}
                  className="bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-full border border-green-200"
                >
                  + EXERCISE
                </button>
              </div>
            </div>
            
            {entries.length === 0 && exercises.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl text-center text-gray-400">
                <p>Nothing logged for today.</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 text-blue-600 font-bold"
                >
                  Scan a meal to start
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(cat => {
                  const categoryEntries = entries.filter(e => e.category === cat);
                  if (categoryEntries.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-2">
                      <h3 className="font-bold text-gray-800 text-xs uppercase tracking-widest px-1 text-gray-400">{cat}</h3>
                      {categoryEntries.map(entry => (
                        <div 
                          key={entry.id} 
                          className={`animate-entry bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center transition-all ${lastLoggedId === entry.id ? 'animate-success-highlight' : ''}`}
                        >
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 line-clamp-1">{entry.name}</p>
                            <p className="text-xs text-gray-400">{entry.amount} {isNetCarbsMode && entry.macros.fiber ? `(${(entry.macros.carbs - entry.macros.fiber).toFixed(1)}g net carbs)` : ''}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">{entry.calories} cal</p>
                            <p className="text-[10px] text-gray-300">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {exercises.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-green-600 text-xs uppercase tracking-widest px-1">Exercise</h3>
                    {exercises.map(ex => (
                      <div 
                        key={ex.id} 
                        className={`animate-entry bg-green-50/30 p-4 rounded-2xl shadow-sm border border-green-100 flex justify-between items-center transition-all ${lastLoggedId === ex.id ? 'animate-success-highlight !border-green-400' : ''}`}
                      >
                        <div className="flex-1">
                          <p className="font-bold text-green-800 line-clamp-1">{ex.name}</p>
                          <p className="text-xs text-green-500">{ex.duration} minutes</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">-{ex.caloriesBurned} cal</p>
                          <p className="text-[10px] text-green-300">{new Date(ex.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Quick Log</h3>
              <div className="grid grid-cols-2 gap-3 pb-4">
                {QUICK_FOODS.map(food => (
                  <button
                    key={food.name}
                    onClick={() => handleQuickAdd(food)}
                    className="w-full bg-white border border-gray-100 px-4 py-3 rounded-2xl shadow-sm hover:border-blue-200 transition active:scale-95 text-left flex flex-col justify-center"
                  >
                    <p className="font-bold text-gray-800 text-sm">{food.name}</p>
                    <p className="text-[10px] text-blue-500 font-bold">{food.calories} cal</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case AppView.PLANS:
        return <RecipeExplorer 
                  remainingMacros={remainingMacros} 
                  savedRecipes={savedRecipes} 
                  isNetMode={isNetCarbsMode}
                  onToggleSave={handleToggleSaveRecipe} 
                  onEditGoals={() => {
                    setMoreSubView('goals');
                    setActiveView(AppView.MORE);
                  }}
               />;
      case AppView.CHAT:
        return (
          <div className="flex flex-col h-[calc(100vh-140px)] pb-2 pt-4">
             <div className="flex items-center justify-between px-4 mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Wingman</h1>
                  <button 
                    onClick={() => setShowInstructionsModal(true)}
                    className="text-gray-300 hover:text-blue-500 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full relative">
                  {!isPremium && <div className="absolute -top-1 -right-1 z-10 text-[8px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-black shadow-sm">PRO ONLY</div>}
                  <button 
                    onClick={() => setUseDeepThinking(false)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${!useDeepThinking ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                  >
                    Fast {!isPremium && <Icons.Bolt />}
                  </button>
                  <button 
                    onClick={() => setUseDeepThinking(true)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${useDeepThinking ? 'bg-white shadow text-purple-600' : 'text-gray-400'}`}
                  >
                    {Icons.Brain()} Thinking {!isPremium && <Icons.Bolt />}
                  </button>
                </div>
             </div>
             <div 
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto px-4 space-y-4 scroll-smooth"
              >
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      {msg.isThinking && <p className="text-[10px] uppercase font-bold tracking-widest text-purple-500 mb-1 flex items-center gap-1">Deep Think Mode</p>}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
             </div>
             <div className="px-4 py-2 border-t mt-auto bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={isPremium ? "Ask Wellness Wingman..." : "Upgrade for AI Coaching"}
                    className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={isAiThinking || !chatInput.trim()}
                    className={`bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200 transition active:scale-90 disabled:bg-gray-300 disabled:shadow-none`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
             </div>
          </div>
        );
      case AppView.MORE:
        if (moreSubView === 'goals') {
          return (
            <GoalsSettings 
              currentGoal={userGoal} 
              onSave={(newGoal) => {
                setUserGoal(newGoal);
                setMoreSubView('menu');
                setActiveView(AppView.DASHBOARD);
              }} 
            />
          );
        }
        return (
          <MoreTab 
            isNetCarbsMode={isNetCarbsMode}
            onToggleNetCarbs={toggleNetCarbs}
            onSelect={(id) => {
              if (id === 'goals') setMoreSubView('goals');
              else if (id === 'barcode') setActiveView(AppView.SCANNER);
              else if (id === 'planner') setActiveView(AppView.MEAL_PLANNER);
              else if (id === 'macros') setActiveView(AppView.MACRO_TRACKER);
              else if (id === 'vision') setActiveView(AppView.CAMERA);
              else if (id === 'favorites') setActiveView(AppView.FAVORITES);
            }} 
          />
        );
      default:
        return <div className="p-8 text-center text-gray-400">Coming Soon!</div>;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen relative bg-[#effdf5] overflow-hidden shadow-2xl flex flex-col">
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileUpload}
        className="hidden" 
      />

      <header className="px-6 py-4 flex items-center justify-between sticky top-0 bg-[#effdf5] z-10 border-b border-gray-100">
        <h1 className="text-xl font-black text-blue-600 tracking-tight">WellnessWingman</h1>
        <div className="flex items-center gap-3">
          {!isPremium && (
            <button 
              onClick={() => setShowPremiumModal(true)}
              className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200 shadow-sm"
            >
              UPGRADE
            </button>
          )}
          <img src="https://placehold.co/80x80/0066FF/ffffff?text=WW" alt="WellnessWingman Logo" className="h-10 w-10 object-contain rounded-lg" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain scroll-smooth custom-scrollbar">
        {renderView()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-md border-t border-gray-100 px-2 py-2 flex justify-around items-center z-20">
        <button 
          onClick={() => setActiveView(AppView.DASHBOARD)}
          className={`flex flex-col items-center p-2 transition flex-1 ${activeView === AppView.DASHBOARD ? 'text-blue-600' : 'text-gray-400'}`}
        >
          {Icons.Dashboard()}
          <span className="text-[10px] mt-1 font-semibold">Home</span>
        </button>
        <button 
          onClick={() => setActiveView(AppView.DIARY)}
          className={`flex flex-col items-center p-2 transition flex-1 ${activeView === AppView.DIARY ? 'text-blue-600' : 'text-gray-400'}`}
        >
          {Icons.Diary()}
          <span className="text-[10px] mt-1 font-semibold">Diary</span>
        </button>
        <button 
          onClick={() => setActiveView(AppView.CHAT)}
          className={`flex flex-col items-center p-2 transition flex-1 ${activeView === AppView.CHAT ? 'text-blue-600' : 'text-gray-400'}`}
        >
          {Icons.Chat()}
          <span className="text-[10px] mt-1 font-semibold">Coach</span>
        </button>
        <button 
          onClick={() => setActiveView(AppView.PLANS)}
          className={`flex flex-col items-center p-2 transition flex-1 ${activeView === AppView.PLANS ? 'text-blue-600' : 'text-gray-400'}`}
        >
          {Icons.Plans()}
          <span className="text-[10px] mt-1 font-semibold">Ideas</span>
        </button>
        <button 
          onClick={() => {
            setMoreSubView('menu');
            setActiveView(AppView.MORE);
          }}
          className={`flex flex-col items-center p-2 transition flex-1 ${activeView === AppView.MORE ? 'text-blue-600' : 'text-gray-400'}`}
        >
          {Icons.More()}
          <span className="text-[10px] mt-1 font-semibold">More</span>
        </button>
      </nav>

      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onConfirm={() => {
          setIsPremium(true);
          setShowPremiumModal(false);
        }}
      />

      {showInstructionsModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 animate-entry shadow-2xl space-y-4">
            <h2 className="text-2xl font-black text-gray-800">Coach Settings</h2>
            <textarea 
              value={pendingInstructions}
              onChange={(e) => setPendingInstructions(e.target.value)}
              placeholder="Tell Wingman about your specific needs..."
              className="w-full bg-gray-100 rounded-2xl p-4 h-40 outline-none focus:ring-2 focus:ring-blue-500 transition text-sm leading-relaxed"
            />
            <div className="pt-2 flex gap-3">
              <button onClick={() => setShowInstructionsModal(false)} className="flex-1 font-bold text-gray-400 py-3">Cancel</button>
              <button onClick={saveInstructions} className="flex-1 bg-blue-600 text-white rounded-xl font-bold py-3 shadow-lg hover:bg-blue-700 active:scale-95 transition">Apply</button>
            </div>
          </div>
        </div>
      )}

      {showVoiceModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-sm p-8 text-center animate-entry shadow-2xl space-y-6">
            <h2 className="text-2xl font-black text-blue-600">Voice Logging</h2>
            <div className="flex justify-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 border-blue-100 transition-all ${isListening ? 'animate-pulse scale-110 bg-blue-50' : 'bg-gray-50 opacity-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
              </div>
            </div>
            <div className="min-h-[100px] flex flex-col justify-center">
              {voiceTranscript ? (
                <p className="text-gray-800 font-medium text-lg leading-relaxed italic">"{voiceTranscript}"</p>
              ) : (
                <p className="text-gray-400 animate-pulse">Say something like 'I had an egg sandwich for breakfast'...</p>
              )}
            </div>
            <div className="pt-2">
              <button onClick={stopVoiceLoggingAndParse} className="w-full bg-blue-600 text-white rounded-2xl font-black py-4 shadow-lg active:scale-95 transition">
                {isListening ? "I'm Done" : "Log Now"}
              </button>
              <button onClick={() => { if (recognitionRef.current) recognitionRef.current.stop(); setShowVoiceModal(false); }} className="w-full mt-2 text-gray-400 font-bold py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-entry shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Log Exercise</h2>
            <div className="space-y-4">
              <input type="text" value={exName} onChange={(e) => setExName(e.target.value)} placeholder="Activity Name" className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={exDuration} onChange={(e) => setExDuration(e.target.value)} placeholder="Min" className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none" />
                <input type="number" value={exCalories} onChange={(e) => setExCalories(e.target.value)} placeholder="Cal" className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none" />
              </div>
              <div className="pt-2 flex gap-3">
                <button onClick={() => setShowExerciseModal(false)} className="flex-1 text-gray-500 font-bold py-3 hover:bg-gray-50 rounded-xl">Cancel</button>
                <button onClick={addExercise} className="flex-1 bg-blue-600 text-white rounded-xl font-bold py-3">Log</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAiThinking && activeView !== AppView.CHAT && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
             <div className="w-12 h-12 bg-white rounded-full animate-ping opacity-40"></div>
          </div>
          <p className="mt-8 text-xl font-bold text-gray-800">WellnessWingman Thinking...</p>
        </div>
      )}
    </div>
  );
};

export default App;
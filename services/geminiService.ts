import { GoogleGenAI, Type } from "@google/genai";
import { FoodEntry, MacroData, Recipe, ExerciseEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const BASE_SYSTEM_INSTRUCTION = `You are Wellness Wingman, an elite nutrition and fitness coach. 
Your goal is to provide evidence-based, supportive, and highly actionable advice. 
Help users navigate their fitness journey, explain macro distributions, suggest workout tweaks, and offer motivational boosts. 
Keep your responses concise (under 200 words), formatted with markdown for clarity, and always maintain a professional yet friendly coach persona.`;

export const getFastResponse = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || "I'm sorry, I couldn't process that quickly.";
};

export const getDeepThinkingResponse = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
  return response.text || "Deep thinking failed to produce a result.";
};

export const createCoachChatSession = (isPro: boolean = false, customInstructions: string = "") => {
  const finalInstruction = `${BASE_SYSTEM_INSTRUCTION}${customInstructions ? `\n\nSpecific User Preferences/Goals: ${customInstructions}` : ""}`;
  
  return ai.chats.create({
    model: isPro ? 'gemini-3-pro-preview' : 'gemini-2.5-flash',
    config: {
      systemInstruction: finalInstruction,
      thinkingConfig: isPro ? { thinkingBudget: 32768 } : undefined
    }
  });
};

export const parseVoiceCommand = async (text: string): Promise<{ type: 'food' | 'exercise', data: any }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Parse this natural language input from a user: "${text}". 
    Determine if the user is logging a food/meal or an exercise activity.
    Return JSON format.
    If food: { type: 'food', name, calories, carbs, fat, protein, fiber, amount, category: 'Breakfast'|'Lunch'|'Dinner'|'Snacks' }
    If exercise: { type: 'exercise', name, duration, caloriesBurned }`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['food', 'exercise'] },
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fat: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          fiber: { type: Type.NUMBER },
          amount: { type: Type.STRING },
          category: { type: Type.STRING },
          duration: { type: Type.NUMBER },
          caloriesBurned: { type: Type.NUMBER }
        },
        required: ['type', 'name']
      }
    }
  });

  const rawJson = response.text;
  const parsed = JSON.parse(rawJson || '{}');
  return {
    type: parsed.type,
    data: parsed
  };
};

export const lookupFoodByBarcode = async (barcode: string): Promise<Partial<FoodEntry>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Identify the food product with barcode "${barcode}" and provide its nutritional data (Calories, Carbs, Fat, Protein, Fiber) per serving. Use search to find accurate data. 
    Return strictly JSON matching: 
    { 
      "name": string, 
      "calories": number, 
      "carbs": number, 
      "fat": number, 
      "protein": number, 
      "fiber": number,
      "amount": string, 
      "category": 'Breakfast'|'Lunch'|'Dinner'|'Snacks' 
    }`,
    config: {
      tools: [{ googleSearch: {} }]
    },
  });

  const rawText = response.text || '';
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not find product details for barcode: " + barcode);
  
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    name: parsed.name,
    calories: parsed.calories,
    amount: parsed.amount,
    category: parsed.category,
    macros: {
      carbs: parsed.carbs,
      fat: parsed.fat,
      protein: parsed.protein,
      fiber: parsed.fiber || 0,
      calories: parsed.calories
    }
  };
};

export const analyzeFoodImage = async (base64Image: string, mimeType: string): Promise<Partial<FoodEntry>> => {
  // Use gemini-2.5-flash for multimodal inputs (image + text analysis)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Analyze this meal image. Identify the food name, estimated calories, macros (carbs, fat, protein, fiber), serving amount, and meal category (Breakfast, Lunch, Dinner, or Snacks).",
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            amount: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            fiber: { type: Type.NUMBER },
          },
          required: ['name', 'calories', 'amount', 'category', 'carbs', 'fat', 'protein']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    
    return {
      name: parsed.name || 'Analyzed Food',
      calories: parsed.calories || 0,
      amount: parsed.amount || '1 serving',
      category: parsed.category || 'Lunch',
      macros: {
        carbs: parsed.carbs || 0,
        fat: parsed.fat || 0,
        protein: parsed.protein || 0,
        fiber: parsed.fiber || 0,
        calories: parsed.calories || 0
      }
    };
  } catch (e) {
    console.error("AI Vision Error:", e);
    throw new Error("Failed to analyze image. Please ensure the image is clear and try again.");
  }
};

export const getRecipeRecommendations = async (remaining: MacroData, query?: string): Promise<Recipe[]> => {
  const basePrompt = `Based on these remaining daily macros: Calories: ${remaining.calories}, Protein: ${remaining.protein}g, Carbs: ${remaining.carbs}g, Fat: ${remaining.fat}g. `;
  const specificQuery = query ? `Specifically search for recipes related to: "${query}". ` : "";
  const prompt = `${basePrompt}${specificQuery}Suggest 3 healthy recipes. Each recipe should list title, calories, macros (including fiber), and basic steps.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER },
              },
              required: ['carbs', 'fat', 'protein']
            },
            prepTime: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['title', 'description', 'calories', 'macros', 'prepTime', 'ingredients', 'instructions']
        }
      }
    }
  });

  const normalizeStringArray = (input: any): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) {
        return input.flatMap(item => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item !== null) {
                 // Handle potential object structures
                 if ('amount' in item && 'name' in item) return `${item.amount} ${item.name}`;
                 if ('item' in item && 'quantity' in item) return `${item.quantity} ${item.item}`;
                 
                 // Fallback: treat as key-value map (e.g. {"tuna": "1 can"})
                 return Object.entries(item).map(([k, v]) => `${v} ${k}`);
            }
            return String(item);
        });
    }
    if (typeof input === 'object') {
        return Object.entries(input).map(([k, v]) => `${v} ${k}`);
    }
    return [String(input)];
  };

  const rawJson = response.text;
  return JSON.parse(rawJson || '[]').map((r: any) => ({
    ...r,
    id: crypto.randomUUID(),
    macros: { ...r.macros, calories: r.calories, fiber: r.macros.fiber || 0 },
    ingredients: normalizeStringArray(r.ingredients),
    instructions: normalizeStringArray(r.instructions)
  }));
};
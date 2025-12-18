
import { db, auth } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, orderBy, deleteDoc, writeBatch } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { FoodEntry, ExerciseEntry, Recipe, MacroData } from '../types';

// Collection references
const getUserRef = (uid: string) => doc(db, 'users', uid);
const getEntriesRef = (uid: string) => collection(db, 'users', uid, 'entries');
const getExercisesRef = (uid: string) => collection(db, 'users', uid, 'exercises');
const getRecipesRef = (uid: string) => collection(db, 'users', uid, 'savedRecipes');

/**
 * Ensures user document exists with required profile fields
 */
export const initializeUser = async (uid: string, email: string, name: string, photoURL?: string) => {
  const userRef = getUserRef(uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: email || '',
      name: name || email?.split('@')[0] || 'Wingman User',
      photoURL: photoURL || '',
      createdAt: Date.now(),
      goal: {
        calories: 2200,
        carbs: 250,
        fat: 70,
        protein: 150,
        fiber: 30
      },
      waterHistory: {},
      customInstructions: '',
      isNetCarbsMode: false
    });
  } else {
    // If user exists, optionally sync the email/name if they are missing in DB
    const data = snap.data();
    if (!data.name || !data.email) {
      await updateDoc(userRef, {
        name: data.name || name,
        email: data.email || email,
        photoURL: data.photoURL || photoURL || ''
      });
    }
  }
};

export const updateProfileInDb = async (uid: string, updates: { name?: string, photoURL?: string }) => {
  const userRef = getUserRef(uid);
  await updateDoc(userRef, updates);
};

/**
 * Deletes user document and attempts to delete Firebase Auth account
 */
export const deleteUserAccount = async (uid: string) => {
  const user = auth.currentUser;
  if (!user || user.uid !== uid) throw new Error("Unauthorized deletion attempt.");

  // 1. Delete Firestore User Document
  const userRef = getUserRef(uid);
  await deleteDoc(userRef);

  // Note: For a production app, you would use a Cloud Function to recursively 
  // delete subcollections (entries, exercises, recipes). 
  // In the client SDK, we can only easily delete the main doc.

  // 2. Delete the Auth Account
  await deleteUser(user);
};

export const fetchUserData = async (uid: string) => {
  try {
    const userRef = getUserRef(uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    // Fetch Subcollections
    const entriesQ = query(getEntriesRef(uid), orderBy('timestamp', 'desc'));
    const exercisesQ = query(getExercisesRef(uid), orderBy('timestamp', 'desc'));
    const recipesSnap = await getDocs(getRecipesRef(uid));

    const entriesSnap = await getDocs(entriesQ);
    const exercisesSnap = await getDocs(exercisesQ);

    return {
      settings: userData || {},
      entries: entriesSnap.docs.map(d => ({ ...d.data(), id: d.id } as FoodEntry)),
      exercises: exercisesSnap.docs.map(d => ({ ...d.data(), id: d.id } as ExerciseEntry)),
      savedRecipes: recipesSnap.docs.map(d => ({ ...d.data(), id: d.id } as Recipe))
    };
  } catch (error: any) {
    console.warn("Firebase fetch warning:", error.message);
    return {
      settings: {},
      entries: [],
      exercises: [],
      savedRecipes: []
    };
  }
};

export const addFoodEntryToDb = async (uid: string, entry: FoodEntry) => {
  await setDoc(doc(db, 'users', uid, 'entries', entry.id), entry);
};

export const addExerciseToDb = async (uid: string, exercise: ExerciseEntry) => {
  await setDoc(doc(db, 'users', uid, 'exercises', exercise.id), exercise);
};

export const saveGoalToDb = async (uid: string, goal: MacroData) => {
  await updateDoc(getUserRef(uid), { goal });
};

export const saveWaterHistoryToDb = async (uid: string, history: Record<string, number>) => {
  await updateDoc(getUserRef(uid), { waterHistory: history });
};

export const saveSettingsToDb = async (uid: string, settings: { isNetCarbsMode?: boolean, customInstructions?: string }) => {
  await updateDoc(getUserRef(uid), settings);
};

export const toggleRecipeInDb = async (uid: string, recipe: Recipe, isSaved: boolean) => {
  const ref = doc(db, 'users', uid, 'savedRecipes', recipe.id);
  if (isSaved) {
    await setDoc(ref, recipe);
  } else {
    await deleteDoc(ref);
  }
};

import {db} from '../config/firebase';
import {collection, doc, getDoc, setDoc} from 'firebase/firestore';
import {DocumentData} from "@firebase/firestore";


export type MacronutrientProfile = {
    calories: number;      // in kcal
    protein: number;       // in grams
    carbohydrates: number; // in grams
    fats: number;          // in grams
}

export type MealData = {
    name: string;
    macros: MacronutrientProfile;
}


const COLLECTION: string = "meal-macros-library";


function getSetID(item:string):string {
    return item[0].toLowerCase(); // Sorted by first letter
}

function sanitiseString(str: string): string {
    return str.toLowerCase()          // Lower case, for comparison
        .replace(/[^\w]/g, ""); // Remove symbols
}

function getMealNames(meals: MealData[]): string[] {
    return meals.map(meal => meal.name);
}

function packData(meals: MealData[]) {
    const mealsObject: { [key: string]: any } = {};

    meals.forEach((meal) => {
        mealsObject[meal.name] = {
            protein: meal.macros.protein,
            calories: meal.macros.calories,
            carbohydrates: meal.macros.carbohydrates,
            fats: meal.macros.fats,
        };
    });

    return mealsObject
}

function unpackData(rawData:DocumentData):MealData[] {
    return Object.entries(rawData).map(([name, macros]) => ({
        name,
        macros,
    }));
}


export async function addNewMeal(mealData:MealData):Promise<boolean> {
    const SET_ID:string = getSetID(mealData.name);

    try {
        const docSnapshot = await getDoc(doc(db, COLLECTION, SET_ID));
        const collectionRef = collection(db, COLLECTION);
        const setDocRef = doc(collectionRef, SET_ID);

        if (docSnapshot.exists()) {
            // Retrieve set data and add new element
            let setData = unpackData(docSnapshot.data());
            setData.push(mealData); // Add new meal

            // Update set (document contents)
            await setDoc(setDocRef, packData(setData)); // Use setDoc with the specific doc ref
        }
        else {
            // Create set
            await setDoc(setDocRef, packData([mealData])); // Use setDoc with the specific doc ref
        }

        return true;
    } catch (error) {
        console.error("Error updating data:", error);
        return false;
    }
}

/**
 * Fetches the relevant meal sub-set.
 * @param set The meal input (or it so far).
 */
export async function queryMeals(set:string):Promise<MealData[]> {
    const SET_ID:string = getSetID(set);

    try {
        const docSnapshot = await getDoc(doc(db, COLLECTION, SET_ID));
        if (!docSnapshot.exists())
            return []; // No meals matching query.

        // Map to raw data to type
        const rawData:DocumentData = docSnapshot.data();
        return unpackData(rawData);
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

/**
 * Retrieves possible matches based on the current user input.
 * @param input The users meal input.
 * @param mealSet The current stored meal set.
 */
export async function getPossibleMatches(input:string, mealSet:MealData[]):Promise<string[]> {
    return getMealNames(mealSet).filter(meal =>
        sanitiseString(meal).startsWith(sanitiseString(input))
    );
}

/**
 * Retrieves the matching meal data of the input.
 * @param input The users meal input.
 * @param mealSet The current stored meal set.
 */
export async function getMeal(input:string, mealSet:MealData[]):Promise<MealData | null> {
    const mealNames:string[] = getMealNames(mealSet);
    const sanitisedInput:string = sanitiseString(input);

    // Find matching meal in dataset
    for (let i = 0; i < mealNames.length; i++) {
        if (sanitiseString(mealNames[i]) === sanitisedInput) {
            return mealSet[i];
        }
    }

    return null; // No match found
}

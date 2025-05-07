import {db} from '../../config/firebase';
import {doc, getDoc} from 'firebase/firestore';


export type MacronutrientProfile = {
    calories: number;
    protein: number;       // in grams
    carbohydrates: number; // in grams
    fats: number;          // in grams
}

export type MealData = {
    name: string;
    macros: MacronutrientProfile;
}


// TODO: Rename to sanitiseString
function sanitiseText(text:string):string {
    return text.toLowerCase()          // Lower case, for comparison
               .replace(/[^\w]/g, ""); // Remove symbols
}

function getMealNames(meals:MealData[]):string[] {
    return meals.map(meal => meal.name);
}

// TODO: Implement
export async function addNewOption() {
}

export async function getPossibleMatches(input:string, mealSet:MealData[]):Promise<string[]> {
    return getMealNames(mealSet).filter(meal =>
        sanitiseText(meal).startsWith(sanitiseText(input))
    );
}

export async function getMeal(input:string, mealSet:MealData[]):Promise<MealData | null> {
    const mealNames:string[] = getMealNames(mealSet);
    const sanitisedInput:string = sanitiseText(input);

    // Find matching meal in dataset
    for (let i = 0; i < mealNames.length; i++) {
        if (sanitiseText(mealNames[i]) === sanitisedInput) {
            return mealSet[i];
        }
    }

    return null; // No match found
}

export async function queryMeals(setId:string):Promise<MealData[]> {
    setId = setId[0]; // Sorted by first letter

    try {
        const docSnapshot = await getDoc(doc(db, "meal-macros-library", setId));
        if (!docSnapshot.exists())
            return []; // No meals matching query.

        // Map to raw data to type
        const rawData = docSnapshot.data();
        return Object.entries(rawData).map(([name, macros]) => ({
            name,
            macros,
        }));
    } catch (error) {
        // TODO: Re-look at error handling & message
        console.error("Error fetching data:", error);
        return [];
    }
}
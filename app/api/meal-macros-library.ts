import {db} from '../../config/firebase';
import {doc, getDoc} from 'firebase/firestore';


type MacronutrientProfile = {
    calories: number;
    protein: number;       // in grams
    carbohydrates: number; // in grams
    fat: number;           // in grams
}

type MealData = {
    name: string;
    macros: MacronutrientProfile;
}


// TODO: Rename to sanitiseString
export function sanitiseText(text:string):string {
    return text.toLowerCase()          // Lower case, for comparison
               .replace(/[^\w]/g, ""); // Remove symbols
}

export function getMealNames(meals:MealData[]):string[] {
    return meals.map(meal => meal.name);
}

// TODO: Implement
export async function addNewOption() {
}

export async function getSuggestions(input:string):Promise<string[]> {
    const meals:MealData[] = await queryMeals("c"); // TODO: Implement real input

    return getMealNames(meals).filter(meal =>
        sanitiseText(meal).startsWith(sanitiseText(input))
    );
}

export async function getMealData(input:string):Promise<MealData | null> {
    const meals:MealData[] = await queryMeals("c");
    const mealNames:string[] = getMealNames(meals);
    const sanitisedInput:string = sanitiseText(input);

    // Find matching meal in dataset
    for (let i = 0; i < mealNames.length; i++) {
        if (sanitiseText(mealNames[i]) === sanitisedInput) {
            return meals[i];
        }
    }

    return null;
}

async function queryMeals(setId:string):Promise<MealData[]> {
    try {
        const docSnapshot = await getDoc(doc(db, "meal-macros-library", setId));
        if (!docSnapshot.exists())
            return []; // No meals matching query.

        const rawData = docSnapshot.data();
        console.log('rawData:', rawData); // TODO: Remove, for debugging

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
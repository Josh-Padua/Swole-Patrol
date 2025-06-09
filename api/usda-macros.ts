import {doc, getDoc} from "firebase/firestore";
import {db} from "../config/firebase";
import {MacronutrientProfile, MealData, sanitiseString} from "./meal-macros-library";
import {unflatten} from "react-native-reanimated/lib/typescript/animation/transformationMatrix/matrixUtils";


const NUTRIENT_ID_WHITELIST:number[] = [1003, 1004, 1005, 1008];
// 1003: Protein, 1004: Total lipid (fat), 1005: Carbohydrate, 1008: Energy

type apiDoc = {
  key:string
};

type nutrientData = {
    nutrientId: number;
    nutrientName: string;
    value: number;
};
type detailedFoodData = {
    fdcId: number;
    description: string;
    foodNutrients: nutrientData[];
};

async function getAPIKey():Promise<string|undefined> {
    try {
        const docSnapshot = await getDoc(doc(db, "meal-macros-library", "ignore-USDA-API"));
        if (!docSnapshot.exists())
            return undefined; // No data on record

        return (docSnapshot.data() as apiDoc).key;
    } catch (error) {
        console.error("Error reading user macro targets:", error);
        return undefined;
    }
}

function parseFoodData(usdaJsonResp:any, query:string):detailedFoodData[] {
    const foodData:detailedFoodData[] = (usdaJsonResp.foods || []).map((food: any) => ({
        fdcId: food.fdcId,
        description: food.description,
        foodNutrients: (food.foodNutrients || [])
            .filter((nutrient: any) =>
                NUTRIENT_ID_WHITELIST.includes(nutrient.nutrientId)
            )
            .map((nutrient: any) => ({
                nutrientId: nutrient.nutrientId,
                nutrientName: nutrient.nutrientName,
                value: nutrient.value,
            })
        ),
    }));

    return foodData.filter(
        food =>
            food.foodNutrients.length > 0 &&
            sanitiseString(food.description).startsWith(sanitiseString(query))
    );
}

function parseMacronutrients(nutrients: nutrientData[]): MacronutrientProfile {
    const profile: MacronutrientProfile = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fats: 0,
    };

    for (const nutrient of nutrients) {
        switch (nutrient.nutrientId) {
            case 1003:
                profile.protein = nutrient.value;
                break;
            case 1004:
                profile.fats = nutrient.value;
                break;
            case 1005:
                profile.carbohydrates = nutrient.value;
                break;
            case 1008:
                profile.calories = nutrient.value;
                break;
            default:
                break;
        }
    }

    return profile;
}

async function getFoods(query:string):Promise<detailedFoodData[]|undefined> {
    if (query.length < 2 || query.length > 20)
        return undefined;

    const apiKey = await getAPIKey();
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${query}&dataType=Survey%20%28FNDDS%29&pageSize=10&pageNumber=1&sortBy=dataType.keyword&sortOrder=asc&requireAllWords=true`

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return parseFoodData(await response.json(), query);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

export async function getNewMeals(food:string):Promise<MealData[]> {
    const foods = await getFoods(food);
    if (foods == undefined || foods.length < 1)
        return [];

    var meals:MealData[] = []
    for (const food of foods) {
        meals.push({
            name: food.description,
            macros: parseMacronutrients(food.foodNutrients)
        });
    }

    return meals;
}

export async function getNewFoodMacros(food:string):Promise<MacronutrientProfile|null> {
    const foods = await getFoods(food);
    if (foods == undefined || foods.length < 1)
        return null;

    return parseMacronutrients(foods[0].foodNutrients);
}

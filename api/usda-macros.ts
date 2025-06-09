import {doc, getDoc} from "firebase/firestore";
import {db} from "../config/firebase";
import {MacronutrientProfile, sanitiseString} from "./meal-macros-library";


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

async function getFoods(query:string):Promise<detailedFoodData[]|undefined> {
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

export async function getNewFoodMacros(food:string):Promise<MacronutrientProfile> {

}

export async function test() {
    await getFoods("milk");
}

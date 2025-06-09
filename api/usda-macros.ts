import {doc, getDoc} from "firebase/firestore";
import {db} from "../config/firebase";
import {MacronutrientProfile} from "./meal-macros-library";
import {getUserID} from "./user-macro-goals";


type apiDoc = {
  key:string
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


async function getFoods(query:string) {
    const apiKey = await getAPIKey();
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${query}&dataType=Survey%20%28FNDDS%29&pageSize=5&pageNumber=1&sortBy=dataType.keyword&sortOrder=asc&requireAllWords=true`

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // TODO: Filter names
        // TODO: Process data (Remove irrelevant data)
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}


export async function test() {
    console.log(await getAPIKey());
}

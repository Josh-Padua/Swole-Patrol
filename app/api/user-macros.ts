import {auth, db} from '../../config/firebase';
import {collection, doc, getDoc, setDoc} from 'firebase/firestore';
import {MacronutrientProfile} from "./meal-macros-library";
import {User} from "firebase/auth";


const COLLECTION: string = "user-macros";


function getUserID():string|undefined {
    const currentUser: User | null = auth.currentUser;
    if (currentUser)
        return currentUser.uid;

    return undefined;
}


export async function getMacros():Promise<MacronutrientProfile | null | undefined> {
    try {
        const USER_ID = getUserID();
        if (!USER_ID)
            return undefined;

        const docSnapshot = await getDoc(doc(db, COLLECTION, USER_ID));
        if (!docSnapshot.exists())
            return null; // No data on record

        return docSnapshot.data() as MacronutrientProfile;
    } catch (error) {
        console.error("Error reading user macro data:", error);
        return undefined;
    }
}

export async function setMacros(macros: MacronutrientProfile):Promise<boolean> {
    try {
        const USER_ID = getUserID();
        if (!USER_ID)
            return false;

        const collectionRef = collection(db, COLLECTION);
        const setDocRef = doc(collectionRef, USER_ID);

        // Update user macros data
        await setDoc(setDocRef, macros);
        return true;
    } catch (error) {
        console.error("Error updating user macro data:", error);
        return false;
    }
}
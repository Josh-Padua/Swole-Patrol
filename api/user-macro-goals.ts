import {auth, db} from '../config/firebase';
import {collection, doc, getDoc, setDoc} from 'firebase/firestore';
import {MacronutrientProfile} from "./meal-macros-library";
import {User} from "firebase/auth";


const COLLECTION: string = "user-macro-goals";


function getUserID():string|undefined {
    const currentUser: User | null = auth.currentUser;
    if (currentUser)
        return currentUser.uid;

    return undefined;
}


/**
 * Retrieves the current user's macro goals.
 */
export async function getGoals():Promise<MacronutrientProfile | null | undefined> {
    try {
        const USER_ID = getUserID();
        if (!USER_ID)
            return undefined;

        const docSnapshot = await getDoc(doc(db, COLLECTION, USER_ID));
        if (!docSnapshot.exists())
            return null; // No data on record

        // Retrieve user macro targets
        return docSnapshot.data() as MacronutrientProfile;
    } catch (error) {
        console.error("Error reading user macro targets:", error);
        return undefined;
    }
}

/**
 * Updates the current user's macro goals.
 */
export async function setGoals(targets: MacronutrientProfile):Promise<boolean> {
    try {
        const USER_ID = getUserID();
        if (!USER_ID)
            return false;

        const collectionRef = collection(db, COLLECTION);
        const setDocRef = doc(collectionRef, USER_ID);

        // Update user macros data
        await setDoc(setDocRef, targets);
        return true;
    } catch (error) {
        console.error("Error updating user macro targets:", error);
        return false;
    }
}
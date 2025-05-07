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


export async function set(macros: MacronutrientProfile):Promise<boolean> {
    try {
        const USER_ID = getUserID();

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
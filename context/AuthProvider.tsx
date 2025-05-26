import React, {createContext, useContext, useEffect, useState} from 'react';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth';
import {auth, db} from '../config/firebase';
import {ActivityIndicator, View} from 'react-native';
import {router} from "expo-router";
// import {doc, setDoc} from "@firebase/firestore";
import {doc, getDoc, setDoc} from "firebase/firestore";

//useAuth hook to access the auth context
//example usage: const {user, loading, signIn, signUp, signOut} = useAuth();

type AuthContextType = {
    user: User | null;
    userData: any | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any | null>(null);

    useEffect(() => {
        return onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const fetchUserData = async () => {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    } else {
                        console.error('No user data found in the database');
                    }
                };

                fetchUserData();
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/');
            } else {
                router.replace('/(auth)/login');
            }
        }
    }, [user, loading]);

    const signIn = async (email: string, password: string) => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
        } catch (error: any) {
            console.log(error);
            alert('Sign in failed: ' + error.message);
        }
    };

    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, 'users', response.user.uid), {
                firstName,
                lastName,
                email,
                createdAt: new Date().toISOString(),
                userId: response.user.uid
            });

            console.log(response);
        } catch (error: any) {
            console.log(error);
            alert('Sign in failed: ' + error.message);
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator size="large" color="lightblue" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut: handleSignOut, userData}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

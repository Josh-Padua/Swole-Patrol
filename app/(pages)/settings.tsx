import {Text, SafeAreaView, ScrollView, TextInput, Alert, TouchableOpacity} from 'react-native'
import React, {useState} from 'react'
import { useRouter } from "expo-router";
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'

const Settings = () => {
    const [firstName, setFirstName] = useState('') // Add consts for setting text fields under here

    const router = useRouter();

    // Firebase Auth + Firestore
    const auth = getAuth();
    const firestore = getFirestore();
    const user =auth.currentUser;

    // function to handle updates after the Update button is pushed
    const handleUpdate = async () => {
        if (!user) {
            Alert.alert('Error', 'No user logged in.');
            return;
        }

            try {
                const userDoc = doc(firestore, 'users', user.uid);
                await updateDoc(userDoc, {
                    firstName,
                })

                Alert.alert('Success', 'Profile details updated successfully.');
            } catch (error) {
                Alert.alert('Error', error.message);
            }
    }

    const handleBack = () => {
        router.push('/(tabs)/profile');
    }

    return (
        <SafeAreaView className="bg-primary-background h-full">
            <ScrollView className="flex-col items-center">
                <Text className="text-center text-accent-orange font-lato-bold text-2xl mb-1.5">Update Details</Text>
                {/*Text fields to enter what User wants to update*/}
                <TextInput
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    className="text-white font-lato-light bg-primary mb-2"
                />

                 {/*Update Firebase Details*/}
                <TouchableOpacity onPress={handleUpdate}
                className="bg-accent-orange py-3 px-6 rounded-lg items-center mb-2">
                    <Text className="text-white font-lato-bold">Update Details</Text>
                </TouchableOpacity>

                {/*Return back to Profile page*/}
                <TouchableOpacity onPress={handleBack}
                                  className="bg-accent-orange py-2 px-6 rounded-lg items-center">
                    <Text className="text-white font-lato-bold">Back</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}
export default Settings

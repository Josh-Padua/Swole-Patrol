import {Text, SafeAreaView, ScrollView, TextInput, Alert, TouchableOpacity, View} from 'react-native'
import React, {useState} from 'react'
import { useRouter } from "expo-router";
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'

const Settings = () => {
    const [firstName, setFirstName] = useState('') // Add consts for setting text fields under here
    const [lastName, setLastName] = useState('')

    const router = useRouter();

    // Firebase Auth + Firestore
    const auth = getAuth();
    const firestore = getFirestore();
    const user = auth.currentUser;

    // function to handle updates after the Update button is pushed
    const handleUpdate = async () => {
        if (!user) {
            console.error('No user logged in.');
            return;
        }

            try {
                const userDoc = doc(firestore, 'users', user.uid);
                const updates: { firstName?: string; lastName?: string } = {};

                // code refactored to make it easier to add more fields in the future that may need to be changed
                if (firstName) updates.firstName = firstName;
                if (lastName) updates.lastName = lastName;

                if (Object.keys(updates).length === 0) {
                    console.log('No fields to update.');
                    return;
                }

                await updateDoc(userDoc, updates);
                setFirstName('');
                setLastName('');
                console.log('Profile details updated successfully.');
            } catch (error) {
                console.log('Error');
            }
    }

    return (
        <SafeAreaView className="bg-primary-background h-full">
            <ScrollView className="flex-col" contentContainerStyle={{alignItems: 'center', paddingTop: 50}}>
                <Text className="text-center text-accent-orange font-lato-bold text-2xl mb-1.5">Update Details</Text>
                <View className="flex-row items-center gap-4">
                    {/*Text fields to enter what User wants to update*/}
                    <TextInput
                        placeholder="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        className="border border-gray-300 rounded-lg mb-2 text-base text-gray-300"
                    />
                </View>
                <View className="flex-row items-center gap-4">
                    {/*Text fields to enter what User wants to update*/}
                    <TextInput
                        placeholder="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                        className="border border-gray-300 rounded-lg mb-2 text-base text-gray-300"
                    />
                </View>
                {/*Update Firebase Details*/}
                <TouchableOpacity onPress={handleUpdate}
                                  className="bg-accent-orange py-2 px-6 rounded-lg items-center mb-2 mt-1">
                    <Text className="text-white font-lato-bold">Update Details</Text>
                </TouchableOpacity>

                {/*Return back to Profile page*/}
                <TouchableOpacity onPress={() => router.back()}
                                  className="bg-accent-orange py-2 px-6 rounded-lg items-center mt-3">
                    <Text className="text-white font-lato-bold">Back</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}
export default Settings

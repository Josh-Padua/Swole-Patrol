import {View, Text, TextInput, TouchableOpacity, SafeAreaView} from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router'
import { auth, db } from '@/config/firebase'
import { doc, updateDoc } from 'firebase/firestore'

const Onboarding = () => {
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [username, setUsername] = useState('')

    const calculateBMI = (height: string, weight: string) => {
        const heightInMeters = parseFloat(height) / 100
        const weightInKg = parseFloat(weight)
        return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1)
    }

    const handleSubmit = async () => {
        try {
            const userId = auth.currentUser?.uid
            if (!userId) {
                console.error('No user ID found')
                return
            }

            if(!username.trim()) {
                alert('Please enter a username')
                return
            }

            const bmi = calculateBMI(height, weight)
            const userRef = doc(db, 'users', userId)

            await updateDoc(userRef, {
                username: username.trim(),
                height: parseFloat(height),
                weight: parseFloat(weight),
                bmi: parseFloat(bmi),
                onboardingFinished: true,
                updatedAt: new Date().toISOString()
            })
            router.replace('/(tabs)')
        } catch (error) {
            console.error('Error saving user data:', error)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-primary-background p-4">
            <Text className="text-white text-2xl font-lato-bold text-center">
                Let's get to know you better!
            </Text>

            <View className="mt-4">
                    <View>
                        <Text className="text-white mb-2">Username</Text>
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            keyboardType="numeric"
                            className="bg-primary text-white p-3 rounded-lg"
                            placeholderTextColor="#666"
                            autoCapitalize="none"
                        />
                    </View>

                <View className="mt-5">
                    <Text className="text-white mb-2">Height (cm)</Text>
                    <TextInput
                        value={height}
                        onChangeText={setHeight}
                        keyboardType="numeric"
                        className="bg-primary text-white p-3 rounded-lg"
                        placeholderTextColor="#666"
                    />
                </View>

                <View className="mt-5">
                    <Text className="text-white mb-2">Weight (kg)</Text>
                    <TextInput
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                        className="bg-primary text-white p-3 rounded-lg"
                        placeholderTextColor="#666"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-6"
                >
                    <Text className="text-white font-lato-bold">Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Onboarding
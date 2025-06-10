import {View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView} from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router'
import { auth, db } from '@/config/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { Picker } from '@react-native-picker/picker'

// jest

const Onboarding = () => {
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [username, setUsername] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')

    const heightOptions = Array.from({ length: 150 }, (_, i) => (140 + i).toString());
    const weightOptions = Array.from({ length: 150 }, (_, i) => (40 + i).toString());

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

            if(!username.trim() || !height || !weight || !age || !gender) {
                alert('Please fill in all fields.')
                return
            }

            const ageNumber = parseInt(age)
            if (isNaN(ageNumber) || ageNumber <= 0 || ageNumber > 100) {
                alert('Please enter a valid age between 1 and 100.')
                return

            }
            const heightNumber = parseFloat(height)
            const weightNumber = parseFloat(weight)
            if (isNaN(heightNumber) || isNaN(weightNumber)) {
                alert('Height and weight must be valid numbers.')
                return
            }

            if (username.length > 20) {
                alert('Username must be 20 characters or less.');
                return;
            }

            const bmi = calculateBMI(height, weight)
            const userDocRef = doc(db, 'users', userId)

            await updateDoc(userDocRef, {
                username: username.trim(),
                height: heightNumber,
                weight: weightNumber,
                age: ageNumber,
                gender: gender,
                bmi: parseFloat(bmi),
                basicOnboarding: true,
                updatedAt: new Date().toISOString()
            })
            router.push('/(pages)/(onboarding)/gymProgress')
        } catch (error) {
            console.error('Error saving user data:', error)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-primary-background p-4">
            <ScrollView>
            <Text className="text-accent-orange text-2xl font-lato-bold text-center">
                Let's get to know you better!
            </Text>

            <View className="mt-4">
                <View>
                    <Text className="text-white mb-2">What username would you like others to call you by?</Text>
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        keyboardType="default"
                        className="bg-primary text-white p-3 rounded-lg"
                        placeholderTextColor="#666"
                        autoCapitalize="none"
                        maxLength={20}
                    />
                </View>

                <View className="mt-5">
                    <Text className="text-white mb-2">How old are you?</Text>
                    <TextInput
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        className="bg-primary text-white p-3 rounded-lg"
                        placeholderTextColor="#666"
                        maxLength={3}
                    />
                </View>

                <View className="mt-5">
                    <Text className="text-white mb-2">What's your gender?</Text>
                    <View className="bg-primary rounded-lg flex-1 overflow-hidden">
                        <Picker
                            selectedValue={gender}
                            onValueChange={(itemValue) => setGender(itemValue)}
                            style={{color: 'white'}}
                            dropdownIconColor="white"
                        >
                            <Picker.Item label="Select gender" value="" />
                            <Picker.Item label="Male" value="male" />
                            <Picker.Item label="Female" value="female" />
                            <Picker.Item label="Non-binary" value="non-binary" />
                            <Picker.Item label="Prefer not to say" value="not-specified" />
                        </Picker>
                    </View>
                </View>

                <View className="mt-5">
                    <Text className="text-white mb-2">What's your Height?</Text>
                    <View className="bg-primary rounded-lg">
                        <Picker
                        selectedValue={height}
                        onValueChange={(itemValue) =>
                            setHeight(itemValue)}
                            style={{color: 'white'}}
                            dropdownIconColor="white">
                                <Picker.Item label="Select height" value=""/>
                            {heightOptions.map((h) => (
                                <Picker.Item key={h} label={`${h} cm`} value={h} />
                                ))}
                            </Picker>
                    </View>
                </View>

                <View className="mt-5">
                    <Text className="text-white mb-2">What's your current weight in kilograms?</Text>
                    <View className="bg-primary rounded-lg">
                        <Picker
                            selectedValue={weight}
                            onValueChange={(itemValue) =>
                                setWeight(itemValue)}
                            style={{color: 'white'}}
                            dropdownIconColor="white">
                            <Picker.Item label="Select weight" value=""/>
                            {weightOptions.map((w) => (
                                <Picker.Item key={w} label={`${w} Kgs`} value={w} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-6"
                >
                    <Text className="text-white font-lato-bold">Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push('/(pages)/(onboarding)/gymProgress')}
                    className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-6"
                >
                    <Text className="text-white font-lato-bold">onboarding2</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Onboarding
import {View, Text, SafeAreaView, ScrollView, TouchableOpacity} from 'react-native'
import React, {useState} from 'react'
import {Picker} from "@react-native-picker/picker";
import {auth, db} from "@/config/firebase";
import {doc, updateDoc} from "firebase/firestore";
import {router} from "expo-router";

const GymProgress = () => {
    const [fitnessGoal, setFitnessGoal] = useState('');
    const [gymLevel, setGymLevel] = useState('');
    const [workoutFrequency, setWorkoutFrequency] = useState('');

    const handleSubmit = async () => {
        try {
            const userId = auth.currentUser?.uid
            if (!userId) {
                console.error('No user ID found')
                return
            }

            if (!fitnessGoal || !gymLevel || !workoutFrequency) {
                alert('Please fill in all fields.')
                return
            }

            const userDocRef = doc(db, 'users', userId)
            await updateDoc(userDocRef, {
                fitnessGoal,
                gymLevel,
                workoutFrequency,
                gymOnboarding: true,
                updatedAt: new Date().toISOString()
            })

            router.replace('/(tabs)')
        } catch (error) {
            console.error('Error saving user data:', error)
        }
    }

        return (
            <SafeAreaView className="flex-1 bg-primary-background p-4">
                <ScrollView>
                    <Text className="text-accent-orange text-2xl font-lato-bold text-center">
                        Now that we know you better, let's talk about your fitness goals!
                    </Text>
                    <View className="mt-4">
                        <View>
                            <Text className="text-white mb-2">What is your fitness goal?</Text>
                            <View className="bg-primary rounded-lg">
                                <Picker
                                    selectedValue={fitnessGoal}
                                    onValueChange={(itemValue) => setFitnessGoal(itemValue)}
                                    style={{color: 'white'}}
                                    dropdownIconColor="white">
                                    <Picker.Item label="Fitness goal" value=""/>
                                    <Picker.Item label="Lose Weight / Fat loss" value="Lose Weight / Fat loss"/>
                                    <Picker.Item label="Build Muscle" value="Build Muscle"/>
                                    <Picker.Item label="Gain Weight (Healthy Mass Gain)"
                                                 value="Gain Weight (Healthy Mass Gain)"/>
                                    <Picker.Item label="Increase Strength" value="Increase Strength"/>
                                    <Picker.Item label="Recover from Injury" value="Recover from Injury"/>
                                    <Picker.Item label="Increase Endurance" value="Increase Endurance"/>
                                    <Picker.Item label="Feel Healthier Overall" value="Feel Healthier Overall"/>
                                    <Picker.Item label="Prepare for a fitness event"
                                                 value="Prepare for a fitness event"/>
                                </Picker>
                            </View>
                        </View>

                        <View className="mt-5">
                            <Text className="text-white mb-2">What level would your gym experience be?</Text>
                            <View className="bg-primary rounded-lg">
                                <Picker
                                    selectedValue={gymLevel}
                                    onValueChange={(itemValue) => setGymLevel(itemValue)}
                                    style={{color: 'white'}}
                                    dropdownIconColor="white">
                                    <Picker.Item label="Gym level" value=""/>
                                    <Picker.Item label="Novice" value="Novice"/>
                                    <Picker.Item label="Beginner" value="Beginner"/>
                                    <Picker.Item label="Intermediate" value="Intermediate"/>
                                    <Picker.Item label="Advanced" value="Advanced"/>
                                    <Picker.Item label="Athlete" value="Athlete"/>
                                </Picker>
                            </View>
                        </View>

                        <View className="mt-5">
                            <Text className="text-white mb-2">How often would you say you workout?</Text>
                            <View className="bg-primary rounded-lg">
                                <Picker
                                    selectedValue={workoutFrequency}
                                    onValueChange={(itemValue) => setWorkoutFrequency(itemValue)}
                                    style={{color: 'white'}}
                                    dropdownIconColor="white">
                                    <Picker.Item label="Workout Frequency" value=""/>
                                    <Picker.Item label="Occasional: 0-1 time per week" value="Occasional"/>
                                    <Picker.Item label="Light: 1-2 times per week" value="Light"/>
                                    <Picker.Item label="Moderate: 3-4 times per week" value="Moderate"/>
                                    <Picker.Item label="Frequent: 5-6 times per week" value="Frequent"/>
                                    <Picker.Item label="Daily: 7+ times per week" value="Daily"/>
                                </Picker>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-6"
                        >
                            <Text className="text-white font-lato-bold">Continue</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }

export default GymProgress

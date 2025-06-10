import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { db } from '@/config/firebase'; // Ensure this path is correct for your Firebase instance
import { doc, updateDoc, increment } from 'firebase/firestore'; // Import necessary Firestore functions
import { getAuth } from 'firebase/auth'; // Import auth to get current user UID
import Ionicons from '@expo/vector-icons/Ionicons'; // Import Ionicons for the save icon

export default function JournalMain() {
    const router = useRouter();
    const auth = getAuth(); // Initialize Firebase Auth instance

    // Stopwatch states and logic
    const [isRunning, setIsRunning] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [millisecondsElapsed, setMillisecondsElapsed] = useState(0); // Represents centiseconds (1/100 of a second)
    const [laps, setLaps] = useState<string[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isSaving, setIsSaving] = useState(false); // New state for saving indicator

    const start = () => {
        if (!isRunning) {
            setIsRunning(true);
            // Calculate start time to resume accurately from current elapsed time
            const startTime = Date.now() - (secondsElapsed * 1000 + millisecondsElapsed * 10);
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const totalElapsedTime = now - startTime; // Total elapsed time in milliseconds

                setSecondsElapsed(Math.floor(totalElapsedTime / 1000));
                // Convert remaining milliseconds (after full seconds) into centiseconds (0-99)
                setMillisecondsElapsed(Math.floor((totalElapsedTime % 1000) / 10));
            }, 10); // Interval remains 10ms for smooth updates
        }
    };

    const stop = () => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const reset = () => {
        stop();
        setSecondsElapsed(0);
        setMillisecondsElapsed(0);
        setLaps([]);
    };

    const lap = () => {
        const currentTime = formatTime(secondsElapsed, millisecondsElapsed);
        setLaps((prevLaps) => [...prevLaps, currentTime]);
    };

    const formatTime = (seconds: number, milliseconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        // millisecondsElapsed now represents centiseconds (00-99), which is what we want for XX:XX:XX
        const ms = milliseconds.toString().padStart(2, '0');
        return `${mins}:${secs}:${ms}`;
    };

    // New function to save time to Firebase
    const saveTimeInGym = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Authentication Required", "Please log in to save your gym time.");
            return;
        }

        if (secondsElapsed === 0) {
            Alert.alert("No Time Recorded", "Stopwatch time is zero, nothing to save.");
            return;
        }

        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                // Use increment to add the current session's seconds to the existing total
                timeInGym: increment(secondsElapsed)
            });
            Alert.alert("Success", `Gym time saved! Added ${formatTime(secondsElapsed, 0)} to your total.`);
            reset(); // Optionally reset stopwatch after saving
        } catch (error: any) {
            console.error("Failed to save gym time:", error);
            Alert.alert("Error", `Failed to save gym time: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="h-full bg-primary-background">
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

                {/* Journal Header */}
                <Text className="text-3xl text-white font-lato-bold mb-5 text-center">Journal</Text>

                {/* Buttons Row */}
                <View className="flex-row justify-center mb-8">
                    <TouchableOpacity onPress={() => router.push('/(pages)/(journal)/addEntry')}
                                      className="h-10 w-40 bg-accent-orange rounded-lg items-center justify-center mx-2">
                        <Text className="font-lato-medium text-white">Add Entry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/(pages)/(journal)/viewEntry')}
                                      className="h-10 w-40 bg-accent-orange rounded-lg items-center justify-center mx-2">
                        <Text className="font-lato-medium text-white">View Entry</Text>
                    </TouchableOpacity>
                </View>

                {/* Stopwatch Section */}
                <View className="justify-center items-center">
                    <Text className="text-5xl mb-6 text-white font-lato-bold">
                        {formatTime(secondsElapsed, millisecondsElapsed)}
                    </Text>

                    <View className="flex-row gap-2.5 mb-5">
                        <TouchableOpacity
                            onPress={isRunning ? stop : start}
                            className={`py-2 px-4 rounded-lg ${isRunning ? 'bg-accent-red' : 'bg-accent-green'}`}>
                            <Text className="text-white font-lato-semibold">{isRunning ? 'Pause' : 'Start'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={lap}
                            disabled={!isRunning}
                            className={`py-2 px-4 rounded-lg ${isRunning ? 'bg-white' : 'bg-primary'}`}>
                            <Text className={`font-lato-semibold ${isRunning ? 'text-black' : 'text-white'}`}>LAP</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={reset}
                            className="bg-accent-orange py-2 px-4 rounded-lg">
                            <Text className="text-white font-lato-semibold">Reset</Text>
                        </TouchableOpacity>

                        {/* Save Button - visible when not running and time is elapsed */}
                        {!isRunning && secondsElapsed > 0 && (
                            <TouchableOpacity
                                onPress={saveTimeInGym}
                                disabled={isSaving}
                                className={`py-2 px-4 rounded-lg ${isSaving ? 'bg-gray-500' : 'bg-blue-500'}`}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="save-outline" size={24} color="white" />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Laps List */}
                    {laps.length > 0 && (
                        <View className="mt-2.5 w-4/5">
                            <Text className="text-xl font-lato-bold mb-2.5 text-white">Laps:</Text>
                            <FlatList
                                data={laps}
                                renderItem={({ item, index }) => (
                                    <Text className="font-lato text-2xl text-white">{index + 1}. {item}</Text>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                                className="max-h-52"
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
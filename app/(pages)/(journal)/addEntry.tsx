import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

interface Set {
    reps: number;
    weight: number;
}

interface Exercise {
    name: string;
    sets: Set[];
}

interface WorkoutDoc {
    workoutTitle?: string;
    workoutDetails?: string;
    workoutRating?: number;
    sleepHours?: number;
    waterIntake?: number;
    date?: Timestamp | Date | any;
    exercises?: Exercise[];
    uid?: string;
}

function getDate(date: any): Date {
    if (date?.toDate && typeof date.toDate === 'function') {
        return date.toDate();
    } else if (date instanceof Date) {
        return date;
    } else {
        return new Date(date);
    }
}

export default function AddEntry() {
    const [workoutTitle, setWorkoutTitle] = useState('');
    const [workoutDetails, setWorkoutDetails] = useState('');
    const [workoutRating, setWorkoutRating] = useState('5');
    const [sleepHours, setSleepHours] = useState('7');
    const [waterIntake, setWaterIntake] = useState('2');
    const [loadedFromLatest, setLoadedFromLatest] = useState(false);
    const router = useRouter();

    const workoutRatingOptions = Array.from({ length: 10 }, (_, i) => String(i + 1));
    const sleepHoursOptions = Array.from({ length: 15 }, (_, i) => String(i + 1));
    const waterIntakeOptions = Array.from({ length: 10 }, (_, i) => String(i + 1));

    const handleSave = async () => {
        if (!workoutTitle || !workoutDetails) {
            Alert.alert('Error', 'Please fill in workout title and details.');
            return;
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                Alert.alert('Error', 'User not logged in.');
                return;
            }

            await addDoc(collection(db, 'workoutLogs'), {
                workoutTitle,
                workoutDetails,
                workoutRating: parseInt(workoutRating),
                sleepHours: parseFloat(sleepHours),
                waterIntake: parseFloat(waterIntake),
                date: new Date(),
                uid: user.uid,
            });

            Alert.alert('Success', 'Workout Log saved!');
            setWorkoutTitle('');
            setWorkoutDetails('');
            setWorkoutRating('5');
            setSleepHours('7');
            setWaterIntake('2');
            setLoadedFromLatest(false);
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not save workout log.');
        }
    };

    const loadLatestWorkout = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'User not logged in.');
                return;
            }

            const workoutsRef = collection(db, `users/${user.uid}/workouts`);
            const snapshot = await getDocs(workoutsRef);

            const workouts: WorkoutDoc[] = snapshot.docs.map((doc) => doc.data() as WorkoutDoc);

            const sortedWorkouts = workouts.sort((a, b) => {
                const dateA = getDate(a.date);
                const dateB = getDate(b.date);
                return dateB.getTime() - dateA.getTime();
            });

            if (sortedWorkouts.length === 0) {
                Alert.alert('No workouts found.');
                return;
            }

            // Find latest workout with at least one exercise with reps > 0
            const latestWorkout =
                sortedWorkouts.find((w) =>
                    w.exercises?.some((ex) => ex.sets?.some((s) => s.reps > 0))
                ) ?? sortedWorkouts[0];

            if (latestWorkout.exercises && latestWorkout.exercises.length > 0) {
                const filteredExercises = latestWorkout.exercises.filter(
                    (ex) => ex.sets && ex.sets.some((s) => s.reps > 0)
                );

                if (filteredExercises.length === 0) {
                    Alert.alert('No exercises with reps in the latest workout.');
                    return;
                }

                const formattedDetails = filteredExercises
                    .map((ex, i) => {
                        const sets = ex.sets
                            .filter((s) => s.reps > 0)
                            .map((s, j) => `  Set ${j + 1}: ${s.reps} reps @ ${s.weight}kg`)
                            .join('\n');
                        return `Exercise ${i + 1}: ${ex.name}\n${sets}`;
                    })
                    .join('\n\n');

                setWorkoutDetails(formattedDetails);
                setLoadedFromLatest(true);
            } else if (latestWorkout.workoutDetails) {
                setWorkoutDetails(latestWorkout.workoutDetails);
                setLoadedFromLatest(true);
            } else {
                Alert.alert('No details found in latest workout.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not load latest workout.');
        }
    };

    const pickerContainerStyle = 'border border-gray-300 rounded-lg mb-4 bg-neutral-800 px-3 h-24 justify-center';

    return (
        <SafeAreaView className="bg-primary-background h-full p-4">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        <Text className="font-lato-bold text-accent-orange text-center text-2xl mb-5">Log Your Workout</Text>

                        <TextInput
                            placeholder="Workout Title (e.g., Leg Day, Full Body)"
                            value={workoutTitle}
                            onChangeText={setWorkoutTitle}
                            className="border border-gray-300 rounded-lg mb-4 p-3 text-base text-gray-300"
                            placeholderTextColor="#A0A0A0"
                        />

                        {loadedFromLatest ? (
                            <View className="border border-gray-300 rounded-lg mb-4 p-3 bg-neutral-800 max-h-80">
                                <ScrollView nestedScrollEnabled={true}>
                                    <Text className="text-base text-gray-300 whitespace-pre-line">{workoutDetails}</Text>
                                </ScrollView>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity onPress={loadLatestWorkout} className="bg-gray-700 py-2 px-4 rounded-lg mb-3">
                                    <Text className="text-white text-center">Load Latest Workout</Text>
                                </TouchableOpacity>
                                <TextInput
                                    placeholder="Workout Details (e.g., Sets, Reps, Weights, Exercises)"
                                    value={workoutDetails}
                                    onChangeText={setWorkoutDetails}
                                    multiline
                                    numberOfLines={6}
                                    className="border border-gray-300 rounded-lg mb-4 p-3 text-base text-gray-300 h-32"
                                    placeholderTextColor="#A0A0A0"
                                    textAlignVertical="top"
                                />
                            </>
                        )}

                        {/* Workout Rating */}
                        <Text className="font-lato text-gray-300 text-base mb-2">Rate your workout (1-10):</Text>
                        <View className={pickerContainerStyle}>
                            <Picker
                                selectedValue={workoutRating}
                                onValueChange={setWorkoutRating}
                                style={{ color: 'white', fontSize: 18, height: 60 }}
                                itemStyle={{ color: 'white', fontSize: 18, height: 60 }}
                                mode="dropdown"
                                dropdownIconColor="white"
                            >
                                {workoutRatingOptions.map((value) => (
                                    <Picker.Item key={value} label={value} value={value} />
                                ))}
                            </Picker>
                        </View>

                        {/* Sleep Hours */}
                        <Text className="font-lato text-gray-300 text-base mb-2">Hours of sleep last night:</Text>
                        <View className={pickerContainerStyle}>
                            <Picker
                                selectedValue={sleepHours}
                                onValueChange={setSleepHours}
                                style={{ color: 'white', fontSize: 18, height: 60 }}
                                itemStyle={{ color: 'white', fontSize: 18, height: 60 }}
                                mode="dropdown"
                                dropdownIconColor="white"
                            >
                                {sleepHoursOptions.map((value) => (
                                    <Picker.Item key={value} label={`${value} hours`} value={value} />
                                ))}
                            </Picker>
                        </View>

                        {/* Water Intake */}
                        <Text className="font-lato text-gray-300 text-base mb-2">Water consumed today (Liters):</Text>
                        <View className={pickerContainerStyle}>
                            <Picker
                                selectedValue={waterIntake}
                                onValueChange={setWaterIntake}
                                style={{ color: 'white', fontSize: 18, height: 60 }}
                                itemStyle={{ color: 'white', fontSize: 18, height: 60 }}
                                mode="dropdown"
                                dropdownIconColor="white"
                            >
                                {waterIntakeOptions.map((value) => (
                                    <Picker.Item key={value} label={`${value} Liters`} value={value} />
                                ))}
                            </Picker>
                        </View>

                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-4"
                        >
                            <Text className="font-lato text-white text-base">Save Workout Log</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-5"
                        >
                            <Text className="font-lato text-white text-base">Return</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

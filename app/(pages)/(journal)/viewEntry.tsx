import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, LayoutAnimation, UIManager, Platform, TextInput, SafeAreaView } from 'react-native';
import { collection, getDocs, deleteDoc, updateDoc, doc, onSnapshot, query, where, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { router } from "expo-router";

// Enable LayoutAnimation for Android for smooth transitions
if (Platform.OS === 'android') {
    // @ts-ignore - UIManager.setLayoutAnimationEnabledExperimental is specific to Android
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Define the TypeScript interface for a Workout Log Entry
interface WorkoutLogEntry {
    id: string;
    workoutTitle: string;
    workoutDetails: string;
    workoutRating: number | string; // Can be number or 'N/A'
    sleepHours: number | string;   // Can be number or 'N/A'
    waterIntake: number | string;  // Can be number or 'N/A'
    date: Date | null;             // Can be a Date object or null
    uid: string;
}

// Helper function to format date
const formatDate = (date: Date | null): string => { // Type the input parameter
    if (!date) { // Check if date is null or undefined first
        return 'No Date';
    }
    if (!(date instanceof Date) || isNaN(date.getTime())) { // Then check if it's a valid Date object
        return 'Invalid Date'; // Or 'No Date', depending on desired behavior for invalid Date objects
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

export default function ViewEntries() {
    // Apply the interface to the state type
    const [entries, setEntries] = useState<WorkoutLogEntry[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null); // Type expandedId as string or null
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);   // Type editingId as string or null
    const [editWorkoutDetails, setEditWorkoutDetails] = useState<string>(''); // Type editWorkoutDetails as string

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'workoutLogs'), where('uid', '==', currentUser.uid));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const userEntries: WorkoutLogEntry[] = snapshot.docs // Explicitly type the mapped array
                    .map((doc) => {
                        const data = doc.data();
                        const firebaseTimestamp = data.date as Timestamp | undefined; // Cast to Timestamp
                        const dateObject = firebaseTimestamp instanceof Timestamp ? firebaseTimestamp.toDate() : null;

                        return {
                            id: doc.id,
                            workoutTitle: (data.workoutTitle as string) ?? 'No Title',
                            workoutDetails: (data.workoutDetails as string) ?? 'No Details',
                            workoutRating: (data.workoutRating as number) ?? 'N/A', // Ensure consistent type or handle conversion
                            sleepHours: (data.sleepHours as number) ?? 'N/A',
                            waterIntake: (data.waterIntake as number) ?? 'N/A',
                            date: dateObject,
                            uid: (data.uid as string),
                        };
                    })
                    .sort((a, b) => {
                        const dateA = a.date ? a.date.getTime() : 0;
                        const dateB = b.date ? b.date.getTime() : 0;
                        return dateB - dateA;
                    });

                setEntries(userEntries);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching entries:', error);
                setLoading(false);
                Alert.alert('Error', 'Could not load workout logs. Please try again.');
            }
        );

        return () => unsubscribe();
    }, []);

    const toggleExpand = (id: string) => { // Type id parameter
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId((prev) => (prev === id ? null : id));
        setEditingId(null);
    };

    const handleSaveEdit = async (id: string) => { // Type id parameter
        try {
            await updateDoc(doc(db, 'workoutLogs', id), { workoutDetails: editWorkoutDetails });

            setEntries((prev) =>
                prev.map((entry) => (entry.id === id ? { ...entry, workoutDetails: editWorkoutDetails } : entry))
            );
            setEditingId(null);
            Alert.alert('Success', 'Workout details updated!');
        } catch (error) {
            console.error('Error saving workout details:', error);
            Alert.alert('Error', 'Could not save workout details. Please try again.');
        }
    };

    const handleDelete = async (id: string) => { // Type id parameter
        Alert.alert(
            "Delete Workout Log",
            "Are you sure you want to delete this workout log entry? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'workoutLogs', id));
                            Alert.alert('Success', 'Workout log deleted!');
                        } catch (error) {
                            console.error('Error deleting workout log:', error);
                            Alert.alert('Error', 'Could not delete workout log. Please try again.');
                        }
                    },
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="h-full bg-primary-background justify-center items-center">
                <ActivityIndicator size="large" color="#FF6347" />
                <Text className="text-white mt-4 font-lato">Loading workout logs...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-primary-background">
            <ScrollView className="p-4">
                <Text className="font-lato-bold text-accent-orange text-center text-2xl mb-5">Your Workout Logs</Text>

                {entries.length === 0 ? (
                    <Text className="text-white text-center text-lg mt-10 font-lato">
                        No workout logs found. Start by adding one from the home screen!
                    </Text>
                ) : (
                    entries.map((entry: WorkoutLogEntry) => {
                        const isExpanded = entry.id === expandedId;
                        const isEditing = entry.id === editingId;

                        return (
                            <View
                                key={entry.id}
                                className="mb-3.5 border border-gray-700 rounded-lg p-3 bg-gray-800"
                            >
                                <TouchableOpacity
                                    onPress={() => toggleExpand(entry.id)}
                                    className="flex-row justify-between items-center"
                                >
                                    <View>
                                        <Text className="font-lato-bold text-xl text-accent-orange">{entry.workoutTitle}</Text>
                                        <Text className="text-gray-400 text-sm font-lato">
                                            {formatDate(entry.date)}
                                        </Text>
                                    </View>
                                    <AntDesign name={isExpanded ? 'up' : 'down'} size={20} color="#FF6347" />
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View className="mt-2.5">
                                        <Text className="text-white font-lato mb-1">
                                            <Text className="font-lato-bold">Rating:</Text> {entry.workoutRating}/10
                                        </Text>
                                        <Text className="text-white font-lato mb-1">
                                            <Text className="font-lato-bold">Sleep:</Text> {entry.sleepHours} hours
                                        </Text>
                                        <Text className="text-white font-lato mb-2">
                                            <Text className="font-lato-bold">Water:</Text> {entry.waterIntake} Liters
                                        </Text>

                                        {isEditing ? (
                                            <>
                                                <TextInput
                                                    multiline
                                                    value={editWorkoutDetails}
                                                    onChangeText={setEditWorkoutDetails}
                                                    className="border border-gray-600 rounded-md p-2.5 min-h-20 bg-gray-700 text-white mb-2.5"
                                                    placeholderTextColor="#A0A0A0"
                                                    textAlignVertical="top"
                                                />
                                                <View className="flex-row gap-4 justify-end">
                                                    <TouchableOpacity onPress={() => handleSaveEdit(entry.id)} className="bg-accent-green py-2 px-4 rounded-md">
                                                        <Text className="text-white font-lato text-base">Save</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => setEditingId(null)} className="bg-red-500 py-2 px-4 rounded-md">
                                                        <Text className="text-white font-lato text-base">Cancel</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        ) : (
                                            <>
                                                <Text className="text-white font-lato mb-2">{entry.workoutDetails}</Text>
                                                <View className="flex-row gap-4 mt-2.5 justify-end">
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setEditingId(entry.id);
                                                            setEditWorkoutDetails(entry.workoutDetails);
                                                        }}
                                                    >
                                                        <Ionicons name="create-outline" size={24} color="#63ca53" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => handleDelete(entry.id)}>
                                                        <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
                <TouchableOpacity onPress={() => router.back()}
                                  className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-5 mb-10">
                    <Text className="font-lato text-white text-base">Return</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
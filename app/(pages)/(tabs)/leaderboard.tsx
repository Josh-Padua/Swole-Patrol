import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore'; // Removed 'where' as it's no longer needed for exercise fetching
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';

interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    age?: number;
    bmi?: number;
    createdAt?: string;
    email?: string;
    fitnessGoal?: string;
    gymLevel?: string;
    height?: number;
    weight?: number;
    workoutFrequency?: string;
    timeInGym?: number;
    exerciseMax?: number; // New: to store the max for the selected exercise
}

type FilterCategory = 'timeInGym' | 'age' | 'bmi' | 'height' | 'weight' | 'gymLevel' | 'workoutFrequency' | 'exerciseMax';

// --- DIRECTLY DEFINED EXERCISES WITH PROVIDED IDs ---
const STATIC_EXERCISES = [
    { id: 'sFtHfYh6UyXjd6Il8oma', name: 'Bench Press' },
    { id: 'FwK5QNG5iyK71JvPSBFM', name: 'Deadlift' },
    { id: 'EkK4I2z15k0QcAn9M4Bg', name: 'Squat' },
];

const Leaderboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('timeInGym');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Using the static exercises directly
    const [availableExercises] = useState(STATIC_EXERCISES); // No need for useState as it's static
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(STATIC_EXERCISES[0]?.id || null);
    const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(STATIC_EXERCISES[0]?.name || null);

    // Removed the useEffect that previously fetched exercise names dynamically

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const usersCollectionRef = collection(db, 'users');
            const usersSnapshot = await getDocs(query(usersCollectionRef));
            let userList: User[] = [];

            for (const userDoc of usersSnapshot.docs) {
                const data = userDoc.data();
                const user: User = {
                    id: userDoc.id,
                    username: data.username || 'Unknown',
                    firstName: data.firstName || 'First',
                    lastName: data.lastName || 'Last',
                    age: data.age ?? undefined,
                    bmi: data.bmi ?? undefined,
                    createdAt: data.createdAt ?? undefined,
                    email: data.email ?? undefined,
                    fitnessGoal: data.fitnessGoal ?? undefined,
                    gymLevel: data.gymLevel ?? undefined,
                    height: data.height ?? undefined,
                    weight: data.weight ?? undefined,
                    workoutFrequency: data.workoutFrequency ?? undefined,
                    timeInGym: data.timeInGym ?? 0,
                    exerciseMax: undefined,
                };

                if (activeFilter === 'exerciseMax' && selectedExerciseId) {
                    try {
                        const exactPath = `users/${user.id}/exerciseMaxes/${selectedExerciseId}/timePeriods/336`;
                        // console.log(`Attempting to fetch from path: ${exactPath}`); // Debug log

                        const exerciseMaxDocRef = doc(
                            db,
                            'users',
                            user.id,
                            'exerciseMaxes',
                            selectedExerciseId,
                            'timePeriods', // Confirmed: NO SPACE from your screenshot
                            '336' // The fixed '336' document
                        );
                        const exerciseMaxDoc = await getDoc(exerciseMaxDocRef);

                        // console.log(`For user ${user.username} (${user.id}), exercise ${selectedExerciseName} (${selectedExerciseId}):`); // Debug log
                        // console.log(`  Document exists: ${exerciseMaxDoc.exists()}`); // Debug log
                        // if (exerciseMaxDoc.exists()) { // Debug log
                        //     console.log(`  Document data:`, exerciseMaxDoc.data()); // Debug log
                        //     console.log(`  estimatedMax1RM value:`, exerciseMaxDoc.data()?.estimatedMax1RM); // Debug log
                        // } else { // Debug log
                        //     console.log(`  Document NOT found at path: ${exactPath}`); // Debug log
                        // } // Debug log

                        if (exerciseMaxDoc.exists()) {
                            user.exerciseMax = exerciseMaxDoc.data()?.estimatedMax1RM ?? 0;
                        } else {
                            user.exerciseMax = 0; // No data found for this exercise/period
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch exercise max for user ${user.id} and exercise ${selectedExerciseId}:`, error);
                        user.exerciseMax = 0; // Default to 0 on error
                    }
                }
                userList.push(user);
            }
            setUsers(userList);
        } catch (error) {
            console.error('Failed to fetch users or exercise maxes:', error);
        } finally {
            setLoading(false);
        }
    }, [activeFilter, selectedExerciseId, selectedExerciseName]);

    useEffect(() => {
        // We can now fetch users immediately because availableExercises are static
        fetchUsers();
        const authInstance = getAuth();
        const currentUser = authInstance.currentUser;
        if (currentUser) {
            setCurrentUserId(currentUser.uid);
        }
    }, [fetchUsers]); // Dependencies remain correct for fetchUsers

    const sortUsers = useCallback((usersToSort: User[]) => {
        return [...usersToSort].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (activeFilter === 'exerciseMax') {
                aValue = a.exerciseMax ?? 0;
                bValue = b.exerciseMax ?? 0;
            } else {
                aValue = a[activeFilter];
                bValue = b[activeFilter];

                if (typeof aValue === 'number' || activeFilter === 'timeInGym' || activeFilter === 'age' || activeFilter === 'bmi' || activeFilter === 'height' || activeFilter === 'weight') {
                    aValue = aValue ?? 0;
                    bValue = bValue ?? 0;
                } else if (typeof aValue === 'string') {
                    aValue = aValue ?? '';
                    bValue = bValue ?? '';
                }
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });
    }, [activeFilter, sortOrder]);

    const sortedUsers = sortUsers(users);

    const handleFilterPress = (filter: FilterCategory) => {
        if (activeFilter === filter) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setActiveFilter(filter);
            setSortOrder(
                filter === 'timeInGym' || filter === 'age' || filter === 'bmi' || filter === 'height' || filter === 'weight' || filter === 'exerciseMax'
                    ? 'desc'
                    : 'asc'
            );
        }
        // If switching to 'exerciseMax' and no exercise is selected yet, default to the first available one
        if (filter === 'exerciseMax' && !selectedExerciseId && availableExercises.length > 0) {
            setSelectedExerciseId(availableExercises[0].id);
            setSelectedExerciseName(availableExercises[0].name);
        }
    };

    const handleExerciseFilterPress = (exerciseId: string, exerciseName: string) => {
        setActiveFilter('exerciseMax');
        setSelectedExerciseId(exerciseId);
        setSelectedExerciseName(exerciseName);
        setSortOrder('desc'); // Maxes should generally sort descending
    };


    const getColumnHeader = (filter: FilterCategory) => {
        let header = '';
        switch (filter) {
            case 'timeInGym':
                header = 'Time in Gym (HH:MM:SS)';
                break;
            case 'age':
                header = 'Age';
                break;
            case 'bmi':
                header = 'BMI';
                break;
            case 'height':
                header = 'Height (cm)';
                break;
            case 'weight':
                header = 'Weight (kg)';
                break;
            case 'gymLevel':
                header = 'Gym Level';
                break;
            case 'workoutFrequency':
                header = 'Workout Freq.';
                break;
            case 'exerciseMax':
                header = `${selectedExerciseName || 'Exercise'} Max (kg)`;
                break;
            default:
                header = 'Stat';
        }
        return (
            <Text className="font-lato-bold text-gray-300 w-4/12 text-center">
                {header} {activeFilter === filter ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </Text>
        );
    };

    const formatTotalSecondsToHMS = (totalSeconds: number | undefined) => {
        if (totalSeconds === undefined || totalSeconds === null) {
            return 'N/A';
        }
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <SafeAreaView className="bg-primary-background h-full justify-center items-center">
                <ActivityIndicator size="large" color="#FFA500" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="bg-primary-background h-full p-4">
            <Text className="font-lato-bold text-accent-orange text-center text-2xl mb-6">🏆 Leaderboard</Text>

            {/* Main Filter Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row justify-center items-center">
                    <FilterButton title="Time in Gym" isActive={activeFilter === 'timeInGym'} onPress={() => handleFilterPress('timeInGym')} />
                    <FilterButton title="Age" isActive={activeFilter === 'age'} onPress={() => handleFilterPress('age')} />
                    <FilterButton title="BMI" isActive={activeFilter === 'bmi'} onPress={() => handleFilterPress('bmi')} />
                    <FilterButton title="Height" isActive={activeFilter === 'height'} onPress={() => handleFilterPress('height')} />
                    <FilterButton title="Weight" isActive={activeFilter === 'weight'} onPress={() => handleFilterPress('weight')} />
                    <FilterButton title="Gym Level" isActive={activeFilter === 'gymLevel'} onPress={() => handleFilterPress('gymLevel')} />
                    <FilterButton title="Workout Freq." isActive={activeFilter === 'workoutFrequency'} onPress={() => handleFilterPress('workoutFrequency')} />
                    {/* New filter button for Exercise Maxes */}
                    <FilterButton title="Exercise Max" isActive={activeFilter === 'exerciseMax'} onPress={() => handleFilterPress('exerciseMax')} />
                </View>
            </ScrollView>

            {/* Exercise Selection Buttons (conditionally rendered when 'exerciseMax' filter is active) */}
            {activeFilter === 'exerciseMax' && availableExercises.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 mt-2">
                    <View className="flex-row justify-center items-center">
                        {availableExercises.map((exercise) => (
                            <FilterButton
                                key={exercise.id}
                                title={exercise.name}
                                isActive={selectedExerciseId === exercise.id}
                                onPress={() => handleExerciseFilterPress(exercise.id, exercise.name)}
                            />
                        ))}
                    </View>
                </ScrollView>
            )}

            <View className="flex-row justify-between px-4 py-2 border-b border-gray-600">
                <Text className="font-lato-bold text-gray-300 w-1/12 text-center">#</Text>
                <Text className="font-lato-bold text-gray-300 w-4/12">Username</Text>
                {getColumnHeader(activeFilter)}
            </View>

            <FlatList
                data={sortedUsers}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => {
                    const isCurrentUser = item.id === currentUserId;
                    return (
                        <View
                            className={`flex-row justify-between px-4 py-2 border-b border-gray-800 ${
                                isCurrentUser ? 'bg-accent-orange' : ''
                            }`}
                        >
                            <Text className={`w-1/12 text-center ${isCurrentUser ? 'text-white font-lato-bold' : 'text-gray-300'}`}>
                                {index + 1}
                            </Text>
                            <Text className={`w-4/12 ${isCurrentUser ? 'text-white font-lato-bold' : 'text-gray-300'}`}>
                                {item.username}
                            </Text>
                            <Text className={`w-4/12 text-center ${isCurrentUser ? 'text-white font-lato-bold' : 'text-gray-300'}`}>
                                {activeFilter === 'timeInGym'
                                    ? formatTotalSecondsToHMS(item.timeInGym)
                                    : activeFilter === 'exerciseMax'
                                        ? (item.exerciseMax !== undefined ? item.exerciseMax?.toString() : 'N/A')
                                        : item[activeFilter] !== undefined
                                            ? item[activeFilter]?.toString()
                                            : 'N/A'}
                            </Text>
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
};

interface FilterButtonProps {
    title: string;
    isActive: boolean;
    onPress: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ title, isActive, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`px-4 py-2 rounded-full mx-1 ${isActive ? 'bg-accent-orange' : 'bg-gray-700'}`}
    >
        <Text className={`font-lato-regular ${isActive ? 'text-white' : 'text-gray-300'}`}>{title}</Text>
    </TouchableOpacity>
);

export default Leaderboard;
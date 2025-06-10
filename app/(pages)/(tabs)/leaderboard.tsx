import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { collection, getDocs, query, doc, getDoc } from 'firebase/firestore';
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
    height?: number;
    weight?: number;
    timeInGym?: number;
    // We'll store all relevant exerciseMaxes in a map for each user
    exerciseMaxes?: Record<string, number>; // exerciseId -> max value
}

type FilterCategory = 'timeInGym' | 'age' | 'bmi' | 'height' | 'weight' | 'exerciseMax';

const STATIC_EXERCISES = [
    { id: 'sFtHfYh6UyXjd6Il8oma', name: 'Bench Press' },
    { id: 'FwK5QNG5iyK71JvPSBFM', name: 'Deadlift' },
    { id: 'EkK4I2z15k0QcAn9M4Bg', name: 'Squat' },
];

const Leaderboard = () => {
    const [users, setUsers] = useState<User[]>([]); // This will hold the *unfiltered* and *unsorted* raw user data
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('timeInGym');
    const [sortOrders, setSortOrders] = useState<Record<FilterCategory, 'asc' | 'desc'>>({
        timeInGym: 'desc',
        age: 'desc',
        bmi: 'desc',
        height: 'desc',
        weight: 'desc',
        exerciseMax: 'desc',
    });
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const [availableExercises] = useState(STATIC_EXERCISES);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(STATIC_EXERCISES[0]?.id || null);
    const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(STATIC_EXERCISES[0]?.name || null);

    // Modified: Fetch all users AND all their exercise maxes for STATIC_EXERCISES once
    const fetchAllUsersAndExerciseMaxes = useCallback(async () => {
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
                    height: data.height ?? undefined,
                    weight: data.weight ?? undefined,
                    timeInGym: data.timeInGym ?? 0,
                    exerciseMaxes: {}, // Initialize the map for exercise maxes
                };

                // Fetch exercise maxes for all STATIC_EXERCISES for this user
                for (const exercise of STATIC_EXERCISES) {
                    try {
                        const exerciseMaxDocRef = doc(
                            db,
                            'users',
                            user.id,
                            'exerciseMaxes',
                            exercise.id,
                            'timePeriods',
                            '336'
                        );
                        const exerciseMaxDoc = await getDoc(exerciseMaxDocRef);

                        if (exerciseMaxDoc.exists()) {
                            user.exerciseMaxes![exercise.id] = exerciseMaxDoc.data()?.estimatedMax1RM ?? 0;
                        } else {
                            user.exerciseMaxes![exercise.id] = 0;
                        }
                    } catch (error) {
                        console.warn(`Failed to fetch exercise max for user ${user.id} and exercise ${exercise.id}:`, error);
                        user.exerciseMaxes![exercise.id] = 0;
                    }
                }
                userList.push(user);
            }
            setUsers(userList); // Set the raw, comprehensive user data
        } catch (error) {
            console.error('Failed to fetch users or exercise maxes:', error);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means this runs only once on mount

    useEffect(() => {
        fetchAllUsersAndExerciseMaxes(); // Call the comprehensive fetch
        const authInstance = getAuth();
        const currentUser = authInstance.currentUser;
        if (currentUser) {
            setCurrentUserId(currentUser.uid);
        }
    }, [fetchAllUsersAndExerciseMaxes]);

    // Modified: sortUsers now operates on the 'users' state directly
    const sortUsers = useCallback(() => {
        const currentSortOrder = sortOrders[activeFilter];
        return [...users].sort((a, b) => { // Sort a copy of the 'users' state
            let aValue: any;
            let bValue: any;

            if (activeFilter === 'exerciseMax') {
                // Access the specific exercise max from the 'exerciseMaxes' map
                aValue = a.exerciseMaxes?.[selectedExerciseId || ''] ?? 0;
                bValue = b.exerciseMaxes?.[selectedExerciseId || ''] ?? 0;
            } else {
                aValue = a[activeFilter];
                bValue = b[activeFilter];

                if (typeof aValue === 'number') {
                    aValue = aValue ?? 0;
                    bValue = bValue ?? 0;
                } else if (typeof aValue === 'string') {
                    aValue = aValue ?? '';
                    bValue = bValue ?? '';
                }
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return currentSortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                return currentSortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });
    }, [activeFilter, sortOrders, users, selectedExerciseId]); // Dependencies changed

    const sortedUsers = sortUsers(); // Call sortUsers to get the currently filtered/sorted list

    const handleSortPress = (filter: FilterCategory) => {
        if (activeFilter === filter) {
            setSortOrders(prev => ({
                ...prev,
                [filter]: prev[filter] === 'asc' ? 'desc' : 'asc'
            }));
        }
    };

    const handleFilterPress = (filter: FilterCategory) => {
        setActiveFilter(filter);
        if (filter === 'exerciseMax' && !selectedExerciseId && availableExercises.length > 0) {
            setSelectedExerciseId(availableExercises[0].id);
            setSelectedExerciseName(availableExercises[0].name);
        }
    };

    const handleExerciseFilterPress = (exerciseId: string, exerciseName: string) => {
        setSelectedExerciseId(exerciseId);
        setSelectedExerciseName(exerciseName);
        // Only set activeFilter if it's not already 'exerciseMax' to prevent unnecessary re-renders
        if (activeFilter !== 'exerciseMax') {
            setActiveFilter('exerciseMax');
        }
        setSortOrders(prev => ({
            ...prev,
            exerciseMax: 'desc'
        }));
    };

    const getColumnHeader = (filter: FilterCategory) => {
        let header = '';
        switch (filter) {
            case 'timeInGym':
                header = 'Time in Gym';
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
            case 'exerciseMax':
                header = `${selectedExerciseName || 'Exercise'} Max (kg)`;
                break;
            default:
                header = 'Stat';
        }

        const currentSortOrder = sortOrders[filter];
        const isCurrentActiveFilter = activeFilter === filter;

        return (
            <TouchableOpacity
                onPress={() => handleSortPress(filter)}
                className="w-4/12 flex-row justify-center items-center"
            >
                <Text className="font-lato-bold text-gray-300 text-center">
                    {header}
                </Text>
                {isCurrentActiveFilter && (
                    <Text className="font-lato-bold text-gray-300 ml-1">
                        {currentSortOrder === 'asc' ? '▲' : '▼'}
                    </Text>
                )}
            </TouchableOpacity>
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
            <SafeAreaView className="bg-primary-background flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#FFA500" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="bg-primary-background flex-1">
            <View style={styles.headerContainer}>
                <Text className="font-lato-bold text-accent-orange text-center text-2xl">🏆 Leaderboard</Text>
            </View>

            {/* Filter Buttons Section - At the top */}
            <View style={styles.filtersSection}>
                {/* Main Filter Buttons */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollViewContent}>
                    <FilterButton title="Time in Gym" isActive={activeFilter === 'timeInGym'} onPress={() => handleFilterPress('timeInGym')} />
                    <FilterButton title="Age" isActive={activeFilter === 'age'} onPress={() => handleFilterPress('age')} />
                    <FilterButton title="BMI" isActive={activeFilter === 'bmi'} onPress={() => handleFilterPress('bmi')} />
                    <FilterButton title="Height" isActive={activeFilter === 'height'} onPress={() => handleFilterPress('height')} />
                    <FilterButton title="Weight" isActive={activeFilter === 'weight'} onPress={() => handleFilterPress('weight')} />
                    <FilterButton title="Exercise Max" isActive={activeFilter === 'exerciseMax'} onPress={() => handleFilterPress('exerciseMax')} />
                </ScrollView>

                {/* Exercise Selection Buttons (conditionally rendered below main filters) */}
                {activeFilter === 'exerciseMax' && availableExercises.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exerciseFilterScrollViewContent}>
                        {availableExercises.map((exercise) => (
                            <FilterButton
                                key={exercise.id}
                                title={exercise.name}
                                isActive={selectedExerciseId === exercise.id}
                                onPress={() => handleExerciseFilterPress(exercise.id, exercise.name)}
                            />
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Leaderboard Info and Table Headers */}
            <View style={styles.leaderboardInfoContainer}>
                <Text className="font-lato-regular text-gray-400 text-center text-sm">
                    {activeFilter === 'exerciseMax' ? `Leaderboard for ${selectedExerciseName || 'Exercise'} Max` : `Leaderboard sorted by ${activeFilter}`}
                </Text>
            </View>

            <View className="flex-row justify-between px-4 py-2 border-b border-gray-600">
                <Text className="font-lato-bold text-gray-300 w-1/12 text-center">#</Text>
                <Text className="font-lato-bold text-gray-300 w-4/12">Username</Text>
                {getColumnHeader(activeFilter)}
            </View>

            <FlatList
                data={sortedUsers} // This will now be the locally sorted/filtered data
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
                                        // Access the value from the new exerciseMaxes map
                                        ? (item.exerciseMaxes?.[selectedExerciseId || ''] !== undefined ? item.exerciseMaxes[selectedExerciseId || '']?.toString() : 'N/A')
                                        : item[activeFilter] !== undefined
                                            ? item[activeFilter]?.toString()
                                            : 'N/A'}
                            </Text>
                        </View>
                    );
                }}
                ListEmptyComponent={() => (
                    <View className="flex-1 justify-center items-center mt-8">
                        <Text className="text-gray-500 font-lato-regular text-lg">No users found for this filter.</Text>
                    </View>
                )}
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

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#1E1E1E',
    },
    headerContainer: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    filtersSection: {
        marginBottom: 8,
    },
    filterScrollViewContent: {
        paddingHorizontal: 16,
        paddingBottom: 4,
        justifyContent: 'center',
    },
    exerciseFilterScrollViewContent: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 8,
        justifyContent: 'center',
    },
    leaderboardInfoContainer: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 8,
    }
});

export default Leaderboard;
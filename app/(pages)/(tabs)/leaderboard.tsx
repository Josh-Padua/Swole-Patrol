import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/config/firebase'; // adjust path if needed

// Define the User interface with all possible fields
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
    timeInGym: number; // Added for hardcoded time spent in gym (in minutes for example)
}

// Define filter categories
type FilterCategory = 'timeInGym' | 'age' | 'bmi' | 'height' | 'weight' | 'gymLevel' | 'workoutFrequency'; // Removed 'username'

const Leaderboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('timeInGym'); // Default to timeInGym
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Default to descending for time (higher is better)

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'));
            const snapshot = await getDocs(q);
            const userList: User[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                // Hardcode timeInGym for demonstration. In a real app, this would come from data.
                const hardcodedTimeInGym = Math.floor(Math.random() * 1000) + 100; // Random time between 100 and 1100 minutes

                return {
                    id: doc.id,
                    username: data.username || 'Unknown',
                    firstName: data.firstName || 'First',
                    lastName: data.lastName || 'Last',
                    age: data.age || undefined,
                    bmi: data.bmi || undefined,
                    createdAt: data.createdAt || undefined,
                    email: data.email || undefined,
                    fitnessGoal: data.fitnessGoal || undefined,
                    gymLevel: data.gymLevel || undefined,
                    height: data.height || undefined,
                    weight: data.weight || undefined,
                    workoutFrequency: data.workoutFrequency || undefined,
                    timeInGym: hardcodedTimeInGym, // Hardcoded value
                };
            });
            setUsers(userList);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Function to sort users based on activeFilter and sortOrder
    const sortUsers = useCallback((usersToSort: User[]) => {
        return [...usersToSort].sort((a, b) => {
            const aValue = a[activeFilter];
            const bValue = b[activeFilter];

            // Handle cases where values might be undefined or different types
            if (aValue === undefined && bValue === undefined) return 0;
            if (aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
            if (bValue === undefined) return sortOrder === 'asc' ? -1 : 1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                // For 'timeInGym' and other numerical stats, sort in descending order by default
                // This logic is simplified as `sortOrder` already handles asc/desc
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }
            // Fallback for other types or mixed types - might need more specific handling
            return 0;
        });
    }, [activeFilter, sortOrder]);

    const sortedUsers = sortUsers(users);

    const handleFilterPress = (filter: FilterCategory) => {
        if (activeFilter === filter) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order if same filter is pressed
        } else {
            setActiveFilter(filter);
            // Default sort order for numerical values like time/age/bmi/height/weight should often be descending (higher is better)
            // For string values like gymLevel/workoutFrequency, ascending is usually fine.
            setSortOrder(filter === 'timeInGym' || filter === 'age' || filter === 'bmi' || filter === 'height' || filter === 'weight' ? 'desc' : 'asc');
        }
    };

    const getColumnHeader = (filter: FilterCategory) => {
        let header = '';
        switch (filter) {
            case 'timeInGym':
                header = 'Time in Gym (min)';
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
            default:
                header = 'Stat';
        }
        return (
            <Text className={`font-lato-bold text-gray-300 w-4/12 text-center`}>
                {header} {activeFilter === filter ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </Text>
        );
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

            {/* Filter Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row justify-center items-center">
                    <FilterButton
                        title="Time in Gym"
                        isActive={activeFilter === 'timeInGym'}
                        onPress={() => handleFilterPress('timeInGym')}
                    />
                    <FilterButton
                        title="Age"
                        isActive={activeFilter === 'age'}
                        onPress={() => handleFilterPress('age')}
                    />
                    <FilterButton
                        title="BMI"
                        isActive={activeFilter === 'bmi'}
                        onPress={() => handleFilterPress('bmi')}
                    />
                    <FilterButton
                        title="Height"
                        isActive={activeFilter === 'height'}
                        onPress={() => handleFilterPress('height')}
                    />
                    <FilterButton
                        title="Weight"
                        isActive={activeFilter === 'weight'}
                        onPress={() => handleFilterPress('weight')}
                    />
                    <FilterButton
                        title="Gym Level"
                        isActive={activeFilter === 'gymLevel'}
                        onPress={() => handleFilterPress('gymLevel')}
                    />
                    <FilterButton
                        title="Workout Freq."
                        isActive={activeFilter === 'workoutFrequency'}
                        onPress={() => handleFilterPress('workoutFrequency')}
                    />
                </View>
            </ScrollView>

            {/* Table Header */}
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-600">
                <Text className="font-lato-bold text-gray-300 w-1/12 text-center">#</Text>
                <Text className="font-lato-bold text-gray-300 w-4/12">Username</Text>
                {getColumnHeader(activeFilter)}
            </View>

            {/* User List */}
            <FlatList
                data={sortedUsers}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View className="flex-row justify-between px-4 py-2 border-b border-gray-800">
                        <Text className="text-gray-300 w-1/12 text-center">{index + 1}</Text>
                        <Text className="text-gray-300 w-4/12">{item.username}</Text>
                        <Text className="text-gray-300 w-4/12 text-center">
                            {item[activeFilter] !== undefined ? item[activeFilter]?.toString() : 'N/A'}
                        </Text>
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
        <Text className={`font-lato-regular ${isActive ? 'text-white' : 'text-gray-300'}`}>
            {title}
        </Text>
    </TouchableOpacity>
);


export default Leaderboard;
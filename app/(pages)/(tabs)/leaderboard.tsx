import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/config/firebase'; // adjust path if needed

interface User {
    id: string;
    firstName: string;
    lastName: string;
}

const Leaderboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, 'users'));
                const snapshot = await getDocs(q);
                const userList: User[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    firstName: doc.data().firstName || 'First',
                    lastName: doc.data().lastName || 'Last',
                }));

                // Sort alphabetically by last name
                userList.sort((a, b) => a.lastName.localeCompare(b.lastName));

                setUsers(userList);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

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

            {/* Table Header */}
            <View className="flex-row justify-between px-4 py-2 border-b border-gray-600">
                <Text className="font-lato-bold text-gray-300 w-1/12 text-center">#</Text>
                <Text className="font-lato-bold text-gray-300 w-5/12">First Name</Text>
                <Text className="font-lato-bold text-gray-300 w-5/12">Last Name</Text>
            </View>

            {/* User List */}
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View className="flex-row justify-between px-4 py-2 border-b border-gray-800">
                        <Text className="text-gray-300 w-1/12 text-center">{index + 1}</Text>
                        <Text className="text-gray-300 w-5/12">{item.firstName}</Text>
                        <Text className="text-gray-300 w-5/12">{item.lastName}</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default Leaderboard;

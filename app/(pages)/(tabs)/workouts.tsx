import {View, Text, SafeAreaView, Button} from 'react-native'
import React from 'react'
import {useAuth} from "@/app/(auth)/AuthProvider";


const Workouts = () => {
    const { user, signOut, userData} = useAuth();
    const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return (
        <SafeAreaView className="bg-primasry-background h-full">
            <Text>{day}</Text>
        </SafeAreaView>
    )
}
export default Workouts

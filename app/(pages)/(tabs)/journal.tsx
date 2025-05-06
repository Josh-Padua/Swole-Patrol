import {View, Text, Button, SafeAreaView, TouchableOpacity} from 'react-native';
import { useRouter } from 'expo-router';
import React from "react";

export default function JournalMain() {
    const router = useRouter();

    return (
        <SafeAreaView className="h-full bg-primary-background items-center">
            <Text className="text-3xl text-white font-lato-bold mb-5">Journal</Text>
            <View className="flex-row">
                <TouchableOpacity onPress={() => router.push('/(pages)/(journal)/addEntry')}
                                  className="h-10 w-64 bg-accent-orange rounded-lg items-center justify-center ml-5">
                    <Text className="font-lato-medium text-white">Add Entry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(pages)/(journal)/viewEntry')}
                                  className="h-10 w-64 bg-accent-orange rounded-lg items-center justify-center ml-5">
                    <Text className="font-lato-medium text-white">View Entry</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
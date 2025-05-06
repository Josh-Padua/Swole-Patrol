import React, { useEffect, useState } from 'react';
import {View, Text, SafeAreaView, Image, Button, TouchableOpacity, Dimensions, ScrollView} from 'react-native';
import { Link } from 'expo-router';
import { auth, db } from '../../../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import images from "@/constants/images";
import { BarChart} from "react-native-chart-kit";
import {useAuth} from "@/app/(auth)/AuthProvider";

const Profile = () => {
    const { signOut, userData } = useAuth();

    return (
        <SafeAreaView className="items-center bg-primary-background h-full">
            <ScrollView>
            { userData && (
                <View className="items-center">
                    <Image source={images.avatar} className="w-10 h-10 rounded-full mt-10 mb-2.5"/>
                    <Text className="font-bold text-white text-3xl">{userData.firstName} {userData.lastName}</Text>
                    <Text className="text-xl text-accent-orange">@username</Text>

                    <View className="flex-row justify-center items-center w-3/4 mt-4">
                        <View className="items-center mx-4">
                            <Text className="font-bold text-lg text-white">Height</Text>
                            <Text className="text-white">180 cm</Text>
                        </View>
                        <View className="items-center mx-4">
                            <Text className="font-bold text-lg text-white">Weight</Text>
                            <Text className="text-white">75 kg</Text>
                        </View>
                        <View className="items-center mx-4">
                            <Text className="font-bold text-lg text-white">BMI</Text>
                            <Text className="text-white">23.1</Text>
                        </View>
                    </View>

                    <View className="bg-primary rounded-lg p-6 mt-6 mb-6 w-full items-center">
                        <Text className="font-lato-semibold text-xl text-white mb-4">Statistics</Text>
                        <View className="self-start">
                            <Text className="font-lato-medium mt-2 text-white">Dead lift: 300 kg</Text>
                            <Text className="font-lato-medium mt-1.5 text-white">Squat: 265 kg</Text>
                            <Text className="font-lato-medium mt-1.5 text-white">Bench: 150 kg</Text>
                            <Text className="font-lato-medium mt-1.5 text-white">Hip Thrust: 200 kg</Text>
                        </View>
                    </View>

                    <Link href="/(pages)/settings" className="font-lato-bold text-white mb-2">Settings</Link>
                    <TouchableOpacity onPress={signOut}
                    className="bg-accent-orange py-3 px-6 rounded-lg items-center">
                        <Text className="text-white font-lato-bold">Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;
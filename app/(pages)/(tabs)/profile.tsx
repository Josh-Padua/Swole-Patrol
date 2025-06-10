import React, { useEffect, useState, useCallback } from 'react';
import {View, Text, SafeAreaView, Image, Button, TouchableOpacity, Dimensions, ScrollView} from 'react-native';
import {Link, router} from 'expo-router';
import images from "@/constants/images";
import { BarChart} from "react-native-chart-kit";
import {useAuth} from "@/context/AuthProvider";
import {useFocusEffect} from "@react-navigation/native";
import {getDoc, doc, collection, getDocs} from "firebase/firestore";
import { db } from '@/config/firebase';

const Profile = () => {
    const { signOut, user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [userStreak, setUserStreak] = useState(0);


    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                if (user) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    const streakDoc = await getDoc(doc(db, 'users', user.uid, 'streak', 'current'));

                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                    if (streakDoc.exists()) {
                        setUserStreak(streakDoc.data().currentStreak || 0);
                    }
                }
            };

            fetchUserData();
        }, [user])
    );

    if (!userData) {
        return null;
    }

    if (userData.premiumMember) {
        return (
            <SafeAreaView className="items-center bg-primary-background h-full pb-10 max-w-screen">
                <ScrollView className="pb-5" showsVerticalScrollIndicator={false}>
                    { userData && (
                        <View className="items-center">
                            <Image source={images.avatar} className="w-20 h-20 rounded-full mt-20 mb-2.5"/>
                            <View className="flex-row items-center">
                                <Text className="font-bold text-white text-2xl">{userData.firstName} {userData.lastName}</Text>
                                <Image source={images.verified} className="w-5 h-5 rounded-full ml-2"/>

                            </View>
                            <Text className="text-xl text-accent-orange">@{userData.username}</Text>

                            <View className="flex-row justify-center items-center w-3/4 mt-4">
                                <View className="items-center mx-4">
                                    <Text className="font-bold text-lg text-white">Height</Text>
                                    <Text className="text-white">{userData.height}</Text>
                                </View>
                                <View className="items-center mx-4">
                                    <Text className="font-bold text-lg text-white">Weight</Text>
                                    <Text className="text-white">{userData.weight} kg</Text>
                                </View>
                                <View className="items-center mx-4">
                                    <Text className="font-bold text-lg text-white">BMI</Text>
                                    <Text className="text-white">{userData.bmi}</Text>
                                </View>
                            </View>
                            <View className="mt-2 flex-row">
                                <Text className="font-lato text-white text-lg">Current workout streak: </Text>
                                <Text className="font-lato text-accent-orange text-lg">{userStreak} Days!</Text>
                            </View>

                            <View className="bg-primary rounded-lg p-6 mt-4 mb-4 w-full items-center max-w-64">
                                <Text className="font-lato-semibold text-xl text-white mb-4">Statistics</Text>
                                <View className="self-start">
                                    <Text className="font-lato-medium mt-2 text-white">Dead lift: 300 kg</Text>
                                    <Text className="font-lato-medium mt-1.5 text-white">Squat: 265 kg</Text>
                                    <Text className="font-lato-medium mt-1.5 text-white">Bench: 150 kg</Text>
                                    <Text className="font-lato-medium mt-1.5 text-white">Hip Thrust: 200 kg</Text>
                                </View>
                            </View>

                            <Link href="/(pages)/settings" className="font-lato-bold text-white mb-2">Settings</Link>

                            <TouchableOpacity onPress={signOut} className="bg-accent-orange py-3 px-6 rounded-lg items-center">
                                <Text className="text-white font-lato-bold">Logout</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="items-center bg-primary-background h-full pb-10 max-w-screen">
            <ScrollView className="pb-5" showsVerticalScrollIndicator={false}>
            { userData && (
                <View className="items-center">
                    <Image source={images.avatar} className="w-20 h-20 rounded-full mt-20 mb-2.5"/>
                    <View className="flex-row items-center">
                        <Text className="font-bold text-white text-2xl">{userData.firstName} {userData.lastName}</Text>
                    </View>
                    <Text className="text-xl text-accent-orange">@{userData.username}</Text>

                    <View className="flex-row justify-center items-center w-3/4 mt-4">
                        <View className="items-center mx-4">
                            <Text className="font-bold text-lg text-white">Height</Text>
                            <Text className="text-white">{userData.height}</Text>
                        </View>
                        <View className="items-center mx-4">
                            <Text className="font-bold text-lg text-white">Weight</Text>
                            <Text className="text-white">{userData.weight} kg</Text>
                        </View>
                        <View className="items-center mx-4">
                            <Text className="font-bold text-lg text-white">BMI</Text>
                            <Text className="text-white">{userData.bmi}</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => router.push("/(pages)/premium")} className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-4">
                        <Text className="text-white font-lato-bold">Upgrade to Premium</Text>
                    </TouchableOpacity>

                    <View className="bg-primary rounded-lg p-6 mt-4 mb-4 w-full items-center max-w-64">
                        <Text className="font-lato-semibold text-xl text-white mb-4">Statistics</Text>
                        <View className="self-start">
                            <Text className="font-lato-medium mt-2 text-white">Dead lift: 300 kg</Text>
                            <Text className="font-lato-medium mt-1.5 text-white">Squat: 265 kg</Text>
                            <Text className="font-lato-medium mt-1.5 text-white">Bench: 150 kg</Text>
                            <Text className="font-lato-medium mt-1.5 text-white">Hip Thrust: 200 kg</Text>
                        </View>
                    </View>

                    <Link href="/(pages)/settings" className="font-lato-bold text-white mb-2">Settings</Link>

                    <TouchableOpacity onPress={signOut} className="bg-accent-orange py-3 px-6 rounded-lg items-center">
                        <Text className="text-white font-lato-bold">Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;
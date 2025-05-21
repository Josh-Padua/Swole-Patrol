import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {BarChart, LineChart} from "react-native-chart-kit";
import React, {useEffect, useState, useCallback} from "react";
import {addDoc, collection, getDocs, onSnapshot, orderBy, query, where} from "firebase/firestore";
import {db} from "@/config/firebase";
import {getAuth} from "firebase/auth";
import {getMacros, setMacros} from "../../../api/user-macros";
import {router} from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import {DocumentData} from "@firebase/firestore";

type weightEntry = {
    date: Date;
    weight: number;
    // type to store weights from firebase
}

async function getWeightEntries():Promise<weightEntry[]> {
    const user = getAuth().currentUser; // weights for each user
    if (!user) return [];

    const q = query(
        collection(db, 'userStats'),
        where('uid', '==', user.uid)
    );

    const snapshot = await getDocs(q);

    const entries: weightEntry[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            date: data.date.toDate?.() || new Date(data.date),
            weight: data.weight,
        }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log(entries);
    return entries;

}

export default function Index() {
    const screenWidth = Dimensions.get('window').width;
    const [weight, setWeight] = useState(0);

    const [kCal, setKCal] = useState(0);
    const [protein, setProtein] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [fats, setFats] = useState(0);

    const [entries, setEntries] = useState<weightEntry[]>([]);

    const chartData = {
        labels: entries.map(entry => entry.date.toLocaleDateString()),
        datasets : [
            {
                data: entries.map(entry => entry.weight),
            }
        ]
    }


    const handleGoalUpdate = async () => {
        if (weight === 0) {
            console.log('Error', 'Please enter a valid weight.');
            return;
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                console.log('Error', 'User not logged in.');
                return;
            }

            await addDoc(collection(db, 'userStats'), {
                weight: weight,
                date: new Date(),
                uid: user.uid,
                // adding data as a new entry to firebase
            });

            const updatedEntries = await getWeightEntries();
            setEntries(updatedEntries);

            console.log('Success', 'Weight Updated.');
            setWeight(0); // reset the input field
        } catch (error) {
            console.error(error);
            console.log('Error', 'Could not update weight.');
        }
    }

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {

                const macros = await getMacros();
                if (macros) {
                    setKCal(macros.calories);
                    setProtein(macros.protein);
                    setCarbs(macros.carbohydrates);
                    setFats(macros.fats);
                }

                const weightData = await getWeightEntries();
                setEntries(weightData);
            };
            loadData();
        }, [])
    )

    return (
        <SafeAreaView className="items-center bg-primary-background h-full pb-10 max-w-screen">
            <ScrollView className="pb-5" showsVerticalScrollIndicator={false}>
            <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-white font-lato-bold mb-5">Home</Text>
                <View className="w-full px-4 bg-primary rounded-lg items-center">
                    <Text className="text-white text-lg font-lato-bold mb-4 mt-2">Daily Progress</Text>
                    <BarChart
                        data={{
                            labels: ['KCal', 'Protein', 'Carbs', 'Fats'],
                            datasets: [
                                {
                                    data: [kCal, protein, carbs, fats], // Uses API to take data from Firebase to display
                                },
                            ],
                        }}
                        width={screenWidth - 100}
                        height={300}
                        fromZero
                        chartConfig={{
                            backgroundColor: '#2D2E31',
                            backgroundGradientFrom: '#2D2E31',
                            backgroundGradientTo: '#2D2E31',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(255, 84, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        }}
                        verticalLabelRotation={0}
                        showBarTops={false}
                        withHorizontalLabels
                    />
                </View>
                <View className="w-full px-4 bg-primary rounded-lg items-center mt-5">
                    <Text className="text-white text-lg font-lato-bold mb-4 mt-2">Weight-Over-Time</Text>
                    <LineChart
                        data={chartData}
                        width={screenWidth - 40}
                        height={300}
                        yAxisSuffix=" kg"
                        fromZero
                        chartConfig={{
                            backgroundColor: '#2D2E31',
                            backgroundGradientFrom: '#2D2E31',
                            backgroundGradientTo: '#2D2E31',
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(255, 84, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        }}
                        bezier
                    />
                </View>

                <View className="w-full px-4 bg-primary rounded-lg items-center mt-5">
                    <Text className="text-white text-2xl font-lato-bold mb-10">Update Weight</Text>
                    <TextInput
                        placeholder="Enter your weight in Kgs"
                        placeholderTextColor="#6b7280"
                        value={weight === 0 ? '' : weight.toString()}
                        onChangeText={(text) => {
                            if (!isNaN(parseFloat(text)) && parseFloat(text) > 0) {
                                setWeight(parseFloat(text));
                            } else if (text === '') {
                                setWeight(0); // Reset to 0 if the input is cleared
                            }
                        }}
                        keyboardType="numeric"
                        className="p-3 border border-gray-300 rounded-lg mb-4 text-base text-gray-300"
                    />
                    <TouchableOpacity onPress={handleGoalUpdate}
                        className="bg-accent-orange py-3 px-6 rounded-lg items-center mb-2">
                        <Text className="text-white font-lato-bold">Update Weight</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/(pages)/weightsPage')}
                                      className="bg-accent-orange py-3 px-6 rounded-lg items-center mb-2">
                        <Text className="text-white font-lato-bold">View Weights Log</Text>
                    </TouchableOpacity>
                </View>

            </View>
            </ScrollView>
        </SafeAreaView>
    )
}
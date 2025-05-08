import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {BarChart, LineChart} from "react-native-chart-kit";
import React, {useEffect, useState} from "react";
import {addDoc, collection} from "firebase/firestore";
import {db} from "@/config/firebase";
import {getAuth} from "firebase/auth";
import {getMacros} from "@/app/api/user-macros";
import firebase from "firebase/compat";

export default function Index() {
    const screenWidth = Dimensions.get('window').width;
    const [weight, setWeight] = useState(0);

    const [kCal, setKCal] = useState(0);
    const [protein, setProtein] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [fats, setFats] = useState(0);

    const handleGoalUpdate = async () => {
        if (weight === 0) {
            Alert.alert('Error', 'Please enter a valid weight.');
            return;
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                Alert.alert('Error', 'User not logged in.');
                return;
            }

            await addDoc(collection(db, 'userStats'), {
                weight: weight,
                date: new Date(), // Save as real Date object (Timestamp in Firestore)
                uid: user.uid,
            });

            Alert.alert('Success', 'Weight Updated.');
            setWeight(0);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not update weight.');
        }
    }

    useEffect(() => {

        const loadData = async () => {
            const macros = await getMacros();
            if (macros) {
                setKCal(macros.calories);
                setProtein(macros.protein);
                setCarbs(macros.carbohydrates);
                setFats(macros.fats);
            }
        };

        loadData();
        // Learn how to prompt rereading after user updates what they eat.
    })

    return (
        <SafeAreaView className="items-center bg-primary-background h-full pb-10">
            <ScrollView className="pb-5">
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
                        width={screenWidth - 40}
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
                        data={{
                            labels: [],
                            datasets: [
                                {
                                    data: [70, 80, 90, 100],
                                }
                            ]
                        }}
                        width={screenWidth - 40}
                        height={300}
                        yAxisSuffix=" kg"
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
                        placeholder="Enter your weight"
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
                </View>

            </View>
            </ScrollView>
        </SafeAreaView>
    )
}
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    Touchable,
    TouchableOpacity,
    View
} from "react-native";
import {BarChart, LineChart} from "react-native-chart-kit";
import React, {useState} from "react";
import {addDoc, collection} from "firebase/firestore";
import {db} from "@/config/firebase";

export default function Index() {

    const screenWidth = Dimensions.get('window').width;

    const [weight, setWeight] = useState(0);

    const handleGoalUpdate = async () => {
        if (weight === 0) {
            Alert.alert('Error', 'Please enter a valid weight.');
            return;
        }

        try {
            await addDoc(collection(db, 'userStats'), {
                weight: weight,
                date: new Date(), // Save as real Date object (Timestamp in Firestore)
            });
            Alert.alert('Success', 'Weight Updated.');
            setWeight(0);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not update weight.');
        }
    }

    return (
        <SafeAreaView className="items-center bg-primary-background h-full">
            <ScrollView>
            <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-white font-lato-bold mb-5">Home</Text>
                <View className="w-full px-4 bg-primary rounded-lg items-center">
                    <Text className="text-white text-lg font-lato-bold mb-4 mt-2">Daily Progress</Text>
                    <BarChart
                        data={{
                            labels: ['KCal', 'Protein', 'Carbs', 'Fats'],
                            datasets: [
                                {
                                    data: [75, 175, 220, 70], // Hardcoded data
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
                            // labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                            datasets: [
                                {
                                    data: [75, 76.2, 80.22, 81.3, 80.88],
                                },
                            ],
                        }}
                        width={screenWidth - 40}
                        height={300}
                        yAxisSuffix="kg"
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
                        value={weight.toString()}
                        onChangeText={(text) => setWeight(parseFloat(text))}
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
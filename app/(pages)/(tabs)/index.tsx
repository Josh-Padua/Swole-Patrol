import {Dimensions, SafeAreaView, ScrollView, Text, View} from "react-native";
import {BarChart} from "react-native-chart-kit";
import React from "react";

export default function Index() {

    const screenWidth = Dimensions.get('window').width;

    return (
        <SafeAreaView className="items-center bg-primary-background h-full">
            <ScrollView>
            <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-white font-lato-bold mb-5">Swole Patrol</Text>
                <View className="w-full px-4 bg-primary rounded-lg items-center">
                    <Text className="text-white text-lg font-lato-bold mb-4 mt-2">Progress</Text>
                    <BarChart
                        data={{
                            labels: ['Weight', 'Protein', 'Carbs', 'Fats'],
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
                        horicontalLabelRotation={-90}
                        verticalLabelRotation={0}
                        showBarTops={false}
                        withHorizontalLabels
                    />
                </View>
            </View>
            </ScrollView>
        </SafeAreaView>
    )
}
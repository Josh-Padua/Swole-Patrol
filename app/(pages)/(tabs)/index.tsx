import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {BarChart, LineChart} from "react-native-gifted-charts";
import React, {useState, useCallback} from "react";
import {addDoc, collection, getDocs, query, where} from "firebase/firestore";
import {db} from "@/config/firebase";
import {getAuth} from "firebase/auth";
import {getMacros} from "@/api/user-macros";
import {router} from "expo-router";
import { useFocusEffect } from '@react-navigation/native';

type barEntry = {
    value: number;
    label: string;
    barColor: string;
}

// type to store weights from firebase
type weightEntry = {
    weight: number;
    date: Date;
    label: string;
}

async function getWeightEntries():Promise<weightEntry[]> {
    const user = getAuth().currentUser; // weights for each user
    if (!user) {
        console.error('No user found!');
        return [];
    }

    const q = query(
        collection(db, 'userStats'),
        where('uid', '==', user.uid)
    );

    const snapshot = await getDocs(q);

    const entries: weightEntry[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const date:Date = data.date.toDate?.() || new Date(data.date);
        return {
            weight: data.weight,
            date: date,
            label: date.toLocaleDateString('en-GB'),
        }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

    // console.log(entries); // TODO: Remove
    return entries;

}

export default function Index() {
    const screenWidth = Dimensions.get('window').width;
    const [weight, setWeight] = useState(0);

    const [macrosBarData, setMacrosBarData] = useState<barEntry[]>([]);
    const [macrosMaxValueYAxis, setMacrosMaxValueYAxis] = useState(1);

    const [entries, setEntries] = useState<weightEntry[]>([]);
    const [minWeight, setMinWeight] = useState(0);  // In kgs
    const [maxWeight, setMaxWeight] = useState(90); // In kgs

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
                // Macros data.
                const macros = await getMacros();
                const MacroData = [
                    { value: (macros?.calories || 0), label: 'KCal', barColor: '#fae125', frontColor: '#fae125' }, // Direct color for bars
                    { value: (macros?.protein || 0), label: 'Protein', barColor: '#ff0f27', frontColor: '#ff0f27' },
                    { value: (macros?.carbohydrates || 0), label: 'Carbs', barColor: '#1443ff', frontColor: '#1443ff' },
                    { value: (macros?.fats || 0), label: 'Fats', barColor: '#19fc30', frontColor: '#19fc30' },
                ]
                setMacrosBarData(MacroData);
                setMacrosMaxValueYAxis(Math.max(...macrosBarData.map(item => item.value)));

                // Weight data.
                const weightData = await getWeightEntries();
                setEntries(weightData);
                console.log(`${entries.length} weight entries\n${entries.map(entry => entry.label).join(', ')}`); // TODO: Remove, for debugging
            };
            loadData();
        }, [])
    )

    return (
        <SafeAreaView className="items-center bg-primary-background h-full">
            <ScrollView className="pb-24 flex-col w-full" showsVerticalScrollIndicator={false} horizontal={false} contentContainerStyle={{paddingBottom :60}}>
            <View className="flex-1 items-center">
                <Text className="text-3xl font-bold text-white font-lato-bold mb-5">Home</Text>
                <View className="w-full px-4 bg-primary rounded-lg items-center">
                    <Text className="text-white text-lg font-lato-bold mb-4 mt-2">Daily Progress</Text>
                    <BarChart
                        data={macrosBarData}
                        width={screenWidth - 100} // Same width as before
                        height={300} // Same height as before
                        // // `fromZero` equivalent is implicitly handled or use minValue={0}
                        // minValue={0} // Ensure chart starts from zero

                        // Background colors - equivalent to backgroundGradientFrom/To in chart-kit
                        // You apply background to the container view, not the chart itself usually
                        // Chart background is transparent by default, allowing container background to show
                        // If you want an inner background for the chart grid area:
                        backgroundColor="#2D2E31" // This colors the chart's plotting area
                        // Use a separate View for outer background if needed

                        // Y-axis configuration
                        noOfSections={5} // Roughly equivalent to decimalPlaces: 0 for integer labels
                        maxValue={macrosMaxValueYAxis} // Set max value for Y-axis dynamically
                        yAxisLabelSuffix={''} // No suffix needed as per your original config
                        // yAxisTextStyle={styles.labelStyle} // Text color for Y-axis labels
                        showYAxisIndices={false} // Hides small ticks on Y-axis

                        // // X-axis configuration
                        // // xAxisLabelTextStyle={styles.labelStyle} // Text color for X-axis labels
                        // showXAxisLabels={true} // `withHorizontalLabels` equivalent
                        // // verticalLabelRotation: 0 is default in gifted-charts, no prop needed

                        // Bar specific styling
                        barWidth={40} // Adjust bar width as desired
                        barBorderRadius={4} // Adds slight curve to bars
                        // `showBarTops={false}` is tricky. By default, gifted-charts shows bars without top labels.
                        // If you want to explicitly hide any top labels, don't use `renderTooltip` or `topLabelComponent`

                        // Grid lines and rules
                        showReferenceLine1={false} // Hides default reference line at 0
                        hideRules={false} // Shows horizontal grid lines
                        rulesColor="#404040" // Slightly lighter than background for visibility
                        rulesLength={screenWidth - 100 - 20} // Adjust grid line length to match chart width - padding
                        xAxisColor="#a0a0a0" // X-axis line color
                        yAxisColor="#a0a0a0" // Y-axis line color
                    />
                </View>
                <View className="w-full px-4 bg-primary rounded-lg items-center mt-5">
                    <Text className="text-white text-lg font-lato-bold mb-4 mt-2">Weight-Over-Time</Text>
                    <LineChart
                        data={entries}
                        width={screenWidth - 40} // Same width as before
                        height={300} // Same height as before
                        // `yAxisSuffix` equivalent
                        yAxisLabelSuffix=" kg"
                        // // `fromZero` equivalent
                        // minValue={minWeight > 0 ? minWeight - 1 : 0} // Start slightly below min or from 0
                        // maxValue={maxWeight + 1} // End slightly above max

                        // Background colors - similar to BarChart, apply to container or chart area
                        backgroundColor="#2D2E31" // Colors the chart's plotting area
                        // Use a separate View for outer background if needed

                        // Line styling
                        color="#FF5400" // `color` from chartConfig, applied directly
                        thickness={3} // Adjust line thickness
                        hideDataPoints={false} // Show data point circles
                        dataPointsRadius={4}
                        dataPointsColor="#FF5400"
                        dataPointsWidth={2}

                        // Grid and Axis Styling
                        // `decimalPlaces: 2` in chartConfig -> use noOfSections for `gifted-charts`
                        // You might need to manually format labels for precise decimal places if `decimalPlaces` is not enough
                        // However, gifted-charts often handles floating point values automatically.
                        noOfSections={5} // Or more, depending on desired Y-axis granularity
                        rulesColor="#404040" // Grid line color
                        xAxisColor="#a0a0a0" // X-axis line color
                        yAxisColor="#a0a0a0" // Y-axis line color
                        // xAxisLabelTextStyle={styles.labelStyle}
                        // yAxisLabelTextStyle={styles.labelStyle}
                        showVerticalLines={true} // Show vertical grid lines (optional)
                        verticalLinesColor="#404040"

                        // // Curve (`bezier` equivalent)
                        // curve // Makes the line smooth

                        // Spacing - crucial for horizontal distribution of points
                        initialSpacing={0} // Start data point at Y-axis
                        spacing={(screenWidth - 40) / (entries.length - 1)} // Distribute evenly
                        // If you have many points and need scrolling, use `scrollEnabled` prop
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
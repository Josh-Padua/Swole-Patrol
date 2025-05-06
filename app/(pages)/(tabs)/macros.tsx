import React, {useState} from 'react'
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native'
import {Link} from "expo-router";

const macroDataSet:{ [key: string]: { calories: number; protein: number; carbs: number; fat: number } }  = {
    "Breakfast Burrito": {
        calories: 350,
        protein: 20,
        carbs: 35,
        fat: 15
    },
    "Beef Stir-fry": {
        calories: 450,
        protein: 30,
        carbs: 40,
        fat: 20
    },
    "Chicken Salad Sandwich": {
        calories: 400,
        protein: 25,
        carbs: 30,
        fat: 20
    },
    "Chicken Curry": {
        calories: 500,
        protein: 35,
        carbs: 45,
        fat: 25
    },
    "Pasta Primavera": {
        calories: 420,
        protein: 15,
        carbs: 60,
        fat: 15
    }
};

function sanitiseText(text:string) {
    return text.toLowerCase()      // Lower case, for comparison
        .replace(/[^\w\s_]/g, ""); // Remove symbols
}

const Macros = () => {
    const [mealText, setMealText] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [consumedCalories, setConsumedCalories] = useState(0);
    const [consumedProtein, setConsumedProtein] = useState(0);
    const [consumedCarbs, setConsumedCarbs] = useState(0);
    const [consumedFat, setConsumedFat] = useState(0);

    const handleInputChange = (text:string) => {
        setMealText(text);
        if (text.length > 0) {
            const filtered = Object.keys(macroDataSet).filter(item =>
                sanitiseText(item).startsWith(sanitiseText(text))
            );
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionPress = (item:string) => {
        setMealText(item);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSubmit = () => {
        let data:string = `${mealText}\n(Macros not found!)`;
        const sanitisedMealText:string = sanitiseText(mealText);

        // Find matching meal in dataset
        for (const mealKey of Object.keys(macroDataSet)) {
            if (sanitiseText(mealKey) === sanitisedMealText) {
                let mealMacros = macroDataSet[mealKey];
                data = `${mealKey}\nCalories: ${mealMacros.calories} cal;\nProtein: ${mealMacros.protein}g;\nCarbs: ${mealMacros.carbs}g;\nFat: ${mealMacros.fat}g`;

                // Update totals
                setConsumedCalories(consumedCalories + mealMacros.calories);
                setConsumedProtein(consumedProtein + mealMacros.protein);
                setConsumedCarbs(consumedCarbs + mealMacros.carbs);
                setConsumedFat(consumedFat + mealMacros.fat);

                break;
            }
        }

        console.log('Submitted:', data);
        Alert.alert('Meal added! ', data); // Not working
    };

    const renderItem = ({ item }: { item: string }) => (
        <TouchableOpacity onPress={() => handleSuggestionPress(item)}>
            <Text className={'text-white text-lg m-4'}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <View className={'flex-1 bg-[#19181B] items-center pt-5'}>
            <Text className={'text-white text-3xl m-10'}>Macros</Text>

            <View className={'bg-[#2D2E31] p-5 rounded-lg w-80 max-w-md mb-5'}>
                <TextInput
                    className={'text-lg m-2 p-2 border border-[#FFEEE5] rounded w-full text-white'}
                    onChangeText={handleInputChange}
                    placeholder="I ate..."
                    value={mealText}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="done"
                    placeholderTextColor="#FFEEE5"
                />
                {showSuggestions && (
                    <View className={'mt-0 w-full max-h-36 overflow-hidden z-10'}>
                        <FlatList
                            data={filteredSuggestions}
                            renderItem={renderItem}
                            keyExtractor={(item) => item}
                            className={'bg-[#2D2E31] border border-[#FFEEE5] rounded'}
                        />
                    </View>
                )}

                <Button title="Submit" onPress={handleSubmit} />
            </View>

            <View className={'items-start w-80 max-w-md'}>
                <Text className={'text-white text-2xl m-5'}>Consumed:</Text>
                <Text className={'text-white text-base'}>Calories: {consumedCalories}</Text>
                <Text className={'text-white text-base'}>Protein: {consumedProtein} g</Text>
                <Text className={'text-white text-base'}>Carbohydrate: {consumedCarbs} g</Text>
                <Text className={'text-white text-base'}>Fats: {consumedFat} g</Text>
            </View>
        </View>
    )
}

export default Macros

import React, {useState} from 'react'
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native'
import {queryMeals, getPossibleMatches, getMeal, MealData, addNewMeal} from "../../api/meal-macros-library";
import {Link} from "expo-router";


let mealSet:MealData[] = [];


const Macros = () => {
    const [mealText, setMealText] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [consumedCalories, setConsumedCalories] = useState(0);
    const [consumedProtein, setConsumedProtein] = useState(0);
    const [consumedCarbs, setConsumedCarbs] = useState(0);
    const [consumedFat, setConsumedFat] = useState(0);

    const handleInputChange = async (text:string) => {
        setMealText(text);

        if (text.length > 0) {
            // Retrieve new meal set
            if (mealSet.length == 0)
                mealSet = await queryMeals(text)

            // Filter meals, to provide suggestions
            const filteredMeals:string[] = await getPossibleMatches(text, mealSet);
            setFilteredSuggestions(filteredMeals);
            setShowSuggestions(true);
        } else {
            mealSet = []; // Reset meal set

            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionPress = (item:string) => {
        setMealText(item);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSubmit = async () => {
        const mealData = await getMeal(mealText, mealSet);
        const data:string = (mealData != null) ?
                                `${mealData.name}\nCalories: ${mealData.macros.calories} kcal;\nProtein: ${mealData.macros.protein}g;\nCarbs: ${mealData.macros.carbohydrates}g;\nFat: ${mealData.macros.fats}g` :
                                `${mealText}\n(Macros not found!)`;

        // Update totals
        if (mealData != null) {
            setConsumedCalories(consumedCalories + mealData.macros.calories);
            setConsumedProtein(consumedProtein + mealData.macros.protein);
            setConsumedCarbs(consumedCarbs + mealData.macros.carbohydrates);
            setConsumedFat(consumedFat + mealData.macros.fats);
        }

        console.log('Submitted:', data);
        Alert.alert('Meal added! ', data); // Not working


        // TODO: Remove, for testing
        await addNewMeal({
            name: mealText,
            macros: {
                calories: 550,
                protein: 30,
                carbohydrates: 60,
                fats: 25,
            }
        });
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

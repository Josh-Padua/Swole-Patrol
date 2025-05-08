import React, {useEffect, useState} from 'react'
import {View, Text, TextInput, Button, FlatList, TouchableOpacity, SafeAreaView} from 'react-native'
import {queryMeals, getPossibleMatches, getMeal, addNewMeal, MealData, MacronutrientProfile} from "../../api/meal-macros-library";
import {getMacros, setMacros} from "../../api/user-macros";


let mealSet:MealData[] = [];


const Macros = () => {
    const [mealText, setMealText] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [consumedCalories, setConsumedCalories] = useState(0);
    const [consumedProtein, setConsumedProtein] = useState(0);
    const [consumedCarbs, setConsumedCarbs] = useState(0);
    const [consumedFat, setConsumedFat] = useState(0);


    /**
     * On page load.
     */
    useEffect( () => {
        // Allows for data persistence
        const loadData = async () => {
            // Restore macros from db
            const macros = await getMacros();
            if (macros) {
                setConsumedCalories(macros.calories);
                setConsumedProtein(macros.protein);
                setConsumedCarbs(macros.carbohydrates);
                setConsumedFat(macros.fats);
            }
        };

        loadData();
    }, []);


    async function updateMacros(macros:MacronutrientProfile):Promise<void> {
        setConsumedCalories(macros.calories);
        setConsumedProtein(macros.protein);
        setConsumedCarbs(macros.carbohydrates);
        setConsumedFat(macros.fats);

        await setMacros(macros);
    }

    /**
     * Manages real-time meal suggestions based on user input.
     */
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

    /**
     * Selects a meal suggestion, updating the input text and hiding the suggestion list.
     */
    const handleSuggestionPress = (item:string) => {
        setMealText(item);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
    };

    /**
     * Processes the submitted meal text, retrieve meal details, trigger macro update, and resets the input.
     */
    const handleSubmit = async () => {
        const mealData = await getMeal(mealText, mealSet);
        const data:string = (mealData != null) ?
                                `${mealData.name}\nCalories: ${mealData.macros.calories} kcal;\nProtein: ${mealData.macros.protein}g;\nCarbs: ${mealData.macros.carbohydrates}g;\nFat: ${mealData.macros.fats}g` :
                                `${mealText}\n(Macros not found!)`;

        // Update totals
        if (mealData != null) {
            await updateMacros({
                calories: consumedCalories + mealData.macros.calories,
                protein: consumedProtein + mealData.macros.protein,
                carbohydrates: consumedCarbs + mealData.macros.carbohydrates,
                fats: consumedFat + mealData.macros.fats
            });
        }

        console.log('Submitted:', data);

        setMealText(""); // Reset input
    };

    const resetTotals = async () => {
        await updateMacros({
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fats: 0
        });
    }

    /**
     * Used by the FlatList.
     */
    const renderItem = ({ item }: { item: string }) => (
        <TouchableOpacity onPress={() => handleSuggestionPress(item)}>
            <Text className={'text-white text-lg m-4'}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className='flex-1 bg-primary-background items-center pt-5 justify-center'>
            <Text className={'text-accent-orange text-3xl m-5 font-lato-bold'}>Macros</Text>

            <View className='bg-primary p-5 rounded-lg w-80 max-w-md items-center'>
                <TextInput
                    className='text-lg m-2 p-2 border border-white rounded w-full text-white font-lato'
                    onChangeText={handleInputChange}
                    placeholder="I ate..."
                    value={mealText}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="done"
                    placeholderTextColor="#FFEEE5"
                />
                {showSuggestions && (
                    <View className='mt-0 w-full max-h-36 overflow-hidden z-10'>
                        <FlatList
                            data={filteredSuggestions}
                            renderItem={renderItem}
                            keyExtractor={(item) => item}
                            className={'bg-[#2D2E31] border border-[#FFEEE5] rounded'}
                        />
                    </View>
                )}
                <TouchableOpacity onPress={handleSubmit}
                className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-2">
                    <Text className="font-lato-semibold text-white">Submit</Text>
                </TouchableOpacity>
            </View>

            <View className='w-80 max-w-md items-center'>
                <Text className={'text-white text-2xl m-5'}>Consumed:</Text>
                <Text className={'text-white text-base'}>Calories: {consumedCalories}</Text>
                <Text className={'text-white text-base'}>Protein: {consumedProtein} g</Text>
                <Text className={'text-white text-base'}>Carbohydrate: {consumedCarbs} g</Text>
                <Text className={'text-white text-base'}>Fats: {consumedFat} g</Text>
                <TouchableOpacity onPress={resetTotals}
                                  className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-2">
                    <Text className="font-lato-semibold text-white">Reset</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Macros

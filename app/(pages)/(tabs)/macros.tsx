import React, {useEffect, useState} from 'react'
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native'
import {
    queryMeals,
    getPossibleMatches,
    getMeal,
    addNewMeal,
    MealData,
    MacronutrientProfile,
    sanitiseString
} from "@/api/meal-macros-library";
import {getMacros, setMacros} from "@/api/user-macros";
import StatusBar from "@/components/statusBar";
import {setGoals} from "@/api/user-macro-goals";
import {getNewMeals} from "../../../api/usda-macros";


let mealSet:MealData[] = [];
let knownMeals:boolean = true;

const BUTTON_COLOR = '#ff5400'
const STATUS_BAR_HEIGHT:number = 20;


const Macros = () => {
    const [mealText, setMealText] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [consumedCalories, setConsumedCalories] = useState(0);
    const [consumedProtein, setConsumedProtein] = useState(0);
    const [consumedCarbs, setConsumedCarbs] = useState(0);
    const [consumedFat, setConsumedFat] = useState(0);
    const [calorieTarget, setCalorieTarget] = useState(2200);
    const [proteinTarget, setProteinTarget] = useState(80);
    const [carbTarget, setCarbTarget] = useState(300);
    const [fatTarget, setFatTarget] = useState(85);


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

    /**
     * Update macro targets.
     * On target update.
     */
    useEffect( () => {
        // Allows for data persistence
        const updateTargets = async () => {
            await setGoals({
                calories: calorieTarget,
                protein: proteinTarget,
                carbohydrates: carbTarget,
                fats: fatTarget
            });
        };

        updateTargets();
    }, [calorieTarget, proteinTarget, carbTarget, fatTarget]);


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
        const cleanText = sanitiseString(text)

        if (cleanText.length > 0) {
            // Retrieve new meal set
            if (mealSet.length == 0) {
                mealSet = await queryMeals(cleanText)
                knownMeals = true;
            }

            // Filter meals, to provide suggestions
            var filteredMeals:string[] = await getPossibleMatches(cleanText, mealSet);
            if (filteredMeals.length == 0) {
                // Add new meals
                for (const newMeal of await getNewMeals(cleanText)) {
                    if (!((mealSet.map(meal => sanitiseString(meal.name))).includes(sanitiseString(newMeal.name))))
                        mealSet.push(newMeal);
                }
                knownMeals = false;

                filteredMeals = await getPossibleMatches(cleanText, mealSet);
            } // Find new meals

            setFilteredSuggestions(filteredMeals);
            setShowSuggestions(true);
        } else {
            mealSet = []; // Reset meal set
            knownMeals = true;

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

        if (mealData != null) {
            // Update totals
            await updateMacros({
                calories: consumedCalories + mealData.macros.calories,
                protein: consumedProtein + mealData.macros.protein,
                carbohydrates: consumedCarbs + mealData.macros.carbohydrates,
                fats: consumedFat + mealData.macros.fats
            });

            // Update db
            if (!knownMeals){
                await addNewMeal(mealData);
            }
        }

        console.log(`Submitted: ${mealData?.name}${!knownMeals? " (a new meal)" : ""}`);

        knownMeals = true;
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

                <Button
                    color={BUTTON_COLOR}
                    title="Submit"
                    onPress={handleSubmit}
                />

                {!knownMeals && (
                    <View className={'items-center'}>
                        <Text className={'text-l'} style={{color: '#6261FF'}}>New meal - Imported from USDA</Text>
                    </View>
                )}
            </View>

            <View className={'bg-[#2D2E31] p-5 rounded-lg w-80 max-w-md mb-5'}>
                <Text className={'text-white font-bold text-2xl my-5'}>Today's Intake</Text>
                <StatusBar
                    title='Calories'
                    current={consumedCalories}
                    target={calorieTarget}
                    targetUpdateAction={setCalorieTarget}
                    config={{
                        height: STATUS_BAR_HEIGHT,
                        foregroundColor: '#fae125',
                        backgroundColor: '#bdb262'
                    }}
                />
                <StatusBar
                    title='Protein'
                    current={consumedProtein}
                    target={proteinTarget}
                    targetUpdateAction={setProteinTarget}
                    config={{
                        height: STATUS_BAR_HEIGHT,
                        foregroundColor: '#ff0f27',
                        backgroundColor: '#c9404e'
                    }}
                />
                <StatusBar
                    title='Carbohydrates'
                    current={consumedCarbs}
                    target={carbTarget}
                    targetUpdateAction={setCarbTarget}
                    config={{
                        height: STATUS_BAR_HEIGHT,
                        foregroundColor: '#1443ff',
                        backgroundColor: '#364685'
                    }}
                />
                <StatusBar
                    title='Fats'
                    current={consumedFat}
                    target={fatTarget}
                    targetUpdateAction={setFatTarget}
                    config={{
                        height: STATUS_BAR_HEIGHT,
                        foregroundColor: '#19fc30',
                        backgroundColor: '#3dba4a'
                    }}
                />

                <View className={'mt-10'}>
                    <Button
                        color={BUTTON_COLOR}
                        title="Reset"
                        onPress={resetTotals}
                    />
                </View>
            </View>
        </View>
    )
}

export default Macros

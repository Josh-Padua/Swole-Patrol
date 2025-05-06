import React, {useState} from 'react'
import { View, Text, StyleSheet, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native'
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

                break;
            }
        }

        console.log('Submitted:', data);
        Alert.alert('Meal added! ', data); // Not working
    };

    const renderItem = ({ item }:{ item:string }) => (
        <TouchableOpacity onPress={() => handleSuggestionPress(item)}>
            <Text style={styles.text}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.background}>
            <View style={[styles.container, { height: 80, width: '100%' }]}>
                <Link href="/(pages)/(tabs)/dashboard" style={styles.text}>{'<'}- (Back)</Link>
            </View>
            <Text style={[styles.text, { margin: 50, fontSize: 30 }]}>Macros</Text>

            <View style={styles.container}>
                <TextInput
                    style={[styles.container, styles.text]}
                    onChangeText={handleInputChange}
                    placeholder="I ate..."
                    value={mealText}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="done"
                />
                {showSuggestions && (
                    <FlatList
                        data={filteredSuggestions}
                        renderItem={renderItem}
                        keyExtractor={(item) => item}
                    />
                )}

                <Button title="Submit" onPress={handleSubmit} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#19181B',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#2D2E31',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    text: {
        color: '#FFEEE5',
        fontSize: 20,
        margin: 20,
    },
});

export default Macros

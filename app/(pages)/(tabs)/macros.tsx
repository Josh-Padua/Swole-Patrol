import React, {useState} from 'react'
import { View, Text, StyleSheet, TextInput, Button, Alert, FlatList, TouchableOpacity } from 'react-native'
import {Link} from "expo-router";

const suggestions:string[] = ['Apple Pie', 'Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig']
                             .sort();

const Macros = () => {
    const [mealText, setMealText] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (text:string) => {
        setMealText(text);
        if (text.length > 0) {
            const filtered = suggestions.filter(item =>
                item.toLowerCase().startsWith(text.toLowerCase())
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
        console.log('Submitted:', mealText);
        Alert.alert('Meal added! ', mealText); // Not working
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

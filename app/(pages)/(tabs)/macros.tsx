import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {Link} from "expo-router";

const Macros = () => {
    return (
        <View style={styles.background}>
            <View style={[styles.container, { height: 80, width: '100%' }]}>
                <Link href="/(pages)/(tabs)/dashboard" style={styles.text}>{'<'}- (Back)</Link>
            </View>
            <Text style={[styles.text, { margin: 50, fontSize: 30 }]}>Macros</Text>
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

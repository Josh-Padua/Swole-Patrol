import {View, Text} from 'react-native'
import React, {useState} from 'react'

const GymProgress = () => {
    const [fitnessGoal, setFitnessGoal] = useState('');
    const [gymLevel, setGymLevel] = useState('');
    const [workoutFrequency, setWorkoutFrequency] = useState('');

    return (
        <View>
            <Text>GymProgress</Text>
        </View>
    )
}
export default GymProgress

import {View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator} from 'react-native'
import React, {useEffect} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {Exercise} from "@/types/workout";
import {collection, getDocs} from 'firebase/firestore';
import {db} from '@/config/firebase';
import {AntDesign} from "@expo/vector-icons";

const TemplateManager = () => {
    const [title, setTitle] = React.useState<string>('')
    const [exercises, setExercises] = React.useState<Exercise[]>([])
    const [loading, setLoading] = React.useState<boolean>(true);
    const [filter, setFilter] = React.useState<string>('');
    const filteredExercises = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(filter.toLowerCase())
    );
    const [selectedExercises, setSelectedExercises] = React.useState<Exercise[]>([]);

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const exercisesCollection = collection(db, 'exercises');
            const exerciseDocs = await getDocs(exercisesCollection);
            const fetchedExercises: Exercise[] = exerciseDocs.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as Omit<Exercise, 'id'>
            }));
            fetchedExercises.sort((a, b) => a.name.localeCompare(b.name));
            setExercises(fetchedExercises);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching exercises: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (exercises.length === 0) {
            fetchExercises();
        }
    }, []);

    return (
        <SafeAreaView className="bg-primary-background h-full">
            <View className='flex-row items-center justify-center mt-4 bg-primary m-2 rounded-lg p-2'>
                <TextInput
                    placeholder="Workout Title"
                    className="font-bold text-xl text-white h-8 pt-0 pb-0"
                    value={title}
                    onChangeText={setTitle}/>
            </View>
            <View className='flex-row items-center justify-center mt-4 bg-primary m-2 rounded-lg p-2'>
                <TextInput
                    placeholder="Search Exercises"
                    className="font-bold text-xl text-white h-8 pt-0 pb-0"
                    value={filter}
                    onChangeText={setFilter}/>
            </View>
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="white"/>
                </View>
            ) : (
                <View className='flex-row items-center justify-center mt-4 bg-primary m-2 rounded-lg p-2'>
                    <FlatList
                        data={filteredExercises}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                className="bg-gray-800 p-4 rounded-lg mb-3 border border-gray-700"
                            >
                                <Text className="text-white text-lg font-bold">{item.name}</Text>
                                <AntDesign name="pluscircle" size={24} color="green" style={{position: 'absolute', right: 10, top: 14}} />
                            </TouchableOpacity>
                        )}
                    />
                </View>)}
        </SafeAreaView>
    )
}
export default TemplateManager

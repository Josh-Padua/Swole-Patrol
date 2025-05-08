import {
    View,
    Text,
    SafeAreaView,
    Pressable,
    FlatList,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator
} from 'react-native'
import React, {useEffect, useState} from 'react'
import {useAuth} from "@/app/(auth)/AuthProvider";
import {AntDesign} from "@expo/vector-icons";
import {doc, setDoc} from 'firebase/firestore';
import {db} from '@/config/firebase';

const Workouts = () => {
    const {userData} = useAuth();
    const day = new Date().toLocaleDateString('en-US', {weekday: 'long'});
    const [currentWorkout, setCurrentWorkout] = useState('Push');
    const [isVisible, setIsVisible] = useState(false);
    const [exercises, setExercises] = useState<{
        id: number;
        name: string;
        sets: { weight: number; reps: number }[]
    }[]>([]);
    const [saving, setSaving] = useState(false);

    //test data
    const data = [
        {label: 'Pull', value: '1'},
        {label: 'Legs', value: '2'},
        {label: 'Upper', value: '3'},
        {label: 'Lower', value: '4'},
        {label: 'Arms', value: '5'},
        {label: 'Back', value: '6'},
        {label: 'Shoulders', value: '7'},
        {label: 'Chest', value: '8'},
        {label: 'Core', value: '9'},
        {label: 'Cardio', value: '10'},
        {label: 'Full Body', value: '11'},
        {label: 'HIIT', value: '12'},
        {label: 'Yoga', value: '13'},
        {label: 'Pilates', value: '14'},
        {label: 'CrossFit', value: '15'},
        {label: 'Zumba', value: '16'},
    ];

    const addSet = (exerciseId: number) => {
        setExercises((prev) => {
            return prev.map((exercise) => {
                if (exercise.id === exerciseId) {
                    return {
                        ...exercise,
                        sets: [...exercise.sets, {weight: 0, reps: 0}]
                    };
                }
                return exercise;
            });
        });
    };

    const removeSet = (exerciseId: number) => {
        setExercises((prev) => {
            return prev.map((exercise) => {
                if (exercise.id === exerciseId && exercise.sets.length > 0) {
                    const updatedSets = [...exercise.sets];
                    updatedSets.pop();
                    return {
                        ...exercise,
                        sets: updatedSets
                    };
                }
                return exercise;
            });
        });
    };

    const updateSet = (exerciseId: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
        setExercises((prev) => {
            const updatedExercises = prev.map((exercise) =>
                exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.map((set, index) =>
                            index === setIndex ? {...set, [field]: value} : set
                        ),
                    }
                    : exercise
            );
            console.log(`Updated exercise ID: ${exerciseId}, Field: ${field}, Value: ${value}`);
            return updatedExercises;
        });
    };

    const saveWorkoutToFirebase = async (userId: string, workoutName: string, exercises: any[]) => {
        setSaving(true);
        try {
            const workoutData = {
                workoutName,
                exercises,
                date: new Date().toISOString(),
            };

            const workoutDocRef = doc(db, `users/${userId}/workouts`, workoutName);
            await setDoc(workoutDocRef, workoutData);

            console.log("Workout saved successfully:", workoutData);
        } catch (error) {
            console.error("Error saving workout:", error);
        }
        setSaving(false);
    };

    const addExercise = (exerciseId: number, name: string) => {
        setExercises((prev) => {
            if (prev.some((exercise) => exercise.id === exerciseId)) {
                return prev;
            }
            return [...prev, {id: exerciseId, name, sets: []}];
        });
    };

    useEffect(() => {
        addExercise(1, "Exercise 1");
        addExercise(2, "Exercise 2");
        addExercise(3, "Exercise 3");
    }, []);

    return (
        <SafeAreaView className="bg-primary-background h-full" style={{paddingBottom: 162}}>
            <View className='flex-row items-center justify-center mt-4 bg-primary m-2 rounded-lg'>
                <Pressable
                    className="w-10 h-10 justify-center items-center"
                >
                    <AntDesign name="arrowleft" size={24} color="white"/>
                </Pressable>
                <Text className='text-orange-600 text-2xl ml-5 mr-5'>{day}</Text>
                <Pressable
                    className="w-10 h-10 justify-center items-center"
                >
                    <AntDesign name="arrowright" size={24} color="white"/>
                </Pressable>
            </View>
            <View className='flex-row justify-center items-center bg-primary m-2 rounded-lg'>
                <View className="flex-row justify-center items-center">
                    <Text className="text-white text-xl mr-2 font-bold">Current workout: </Text>
                    <Text className="text-blue-500 font-bold text-xl">{currentWorkout}</Text>
                    <TouchableOpacity
                        className="rounded-lg p-3 "
                        onPress={() => setIsVisible(true)}
                    >
                        <AntDesign name="edit" size={20} color="white"/>
                    </TouchableOpacity>
                </View>
                <Modal visible={isVisible} transparent animationType="slide">
                    <TouchableOpacity
                        className="flex-1 bg-black/85"
                        onPress={() => setIsVisible(false)}
                    />
                    <View className="flex-1 p-4 bg-black/85">
                        <FlatList className="mb-14"
                                  data={data}
                                  keyExtractor={(item) => item.value}
                                  renderItem={({item}) => (
                                      <TouchableOpacity
                                          className="p-3 border-gray-300"
                                          onPress={() => {
                                              setCurrentWorkout(item.label);
                                              setIsVisible(false);
                                          }}
                                      >
                                          <Text className="text-white">{item.label}</Text>
                                      </TouchableOpacity>
                                  )}
                        />
                    </View>
                </Modal>
            </View>
            <View>
                <FlatList
                    data={exercises}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                        <View className="bg-primary m-2 rounded-lg p-2">
                            <Text className="text-white text-xl font-bold ml-2">Exercise {item.id}</Text>
                            {item.sets.map((set, index) => (
                                <View className="flex-row justify-between" key={index}>
                                    <View className="flex-1 justify-start items-start m-2 px-2 mt-12">
                                        <Text className="text-gray-400 text-sm font-semibold">Set {index + 1}</Text>
                                    </View>
                                    <View className="flex-1 justify-start items-start m-1 px-2">
                                        <Text className="text-white text-lg mb-2 font-bold ">Weight</Text>
                                        <TextInput
                                            placeholder="Enter weight"
                                            placeholderTextColor="#6b7280"
                                            keyboardType="numeric"
                                            value={set.weight > 0 ? set.weight.toString() : ''}
                                            className="bg-gray-700 text-white p-2 rounded-lg w-full h-10"
                                            onChangeText={(text) => updateSet(item.id, index, 'weight', parseFloat(text) || 0)}/>
                                    </View>
                                    <View className="flex-1 justify-start items-start m-1 px-2">
                                        <Text className="text-white text-lg mb-2 font-bold ">Reps</Text>
                                        <TextInput
                                            placeholder="Enter reps"
                                            placeholderTextColor="#6b7280"
                                            keyboardType="numeric"
                                            value={set.reps > 0 ? set.reps.toString() : ''}
                                            className="bg-gray-700 text-white p-2 rounded-lg w-full h-10"
                                            onChangeText={(text) => updateSet(item.id, index, 'reps', parseFloat(text) || 0)}/>
                                    </View>
                                </View>
                            ))}
                            <View className="items-center flex-row justify-between mt-2">
                                <TouchableOpacity
                                    onPress={() => removeSet(item.id)}
                                    className="flex-row items-center mt-2"
                                >
                                    <AntDesign name="minus" size={24} color="white"/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => addSet(item.id)}
                                    className="flex-row items-center mt-2"
                                >
                                    <AntDesign name="plus" size={24} color="white"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
                <Pressable
                    onPress={() => {
                        console.log("Saving exercises:", exercises);
                        if (userData && userData.userId) {
                            saveWorkoutToFirebase(userData.userId, currentWorkout, exercises);
                        } else {
                            console.error("User data not available");
                        }
                    }}
                    className="w-full bg-orange-600 p-3 rounded-lg items-center"
                >
                    {saving ? (
                        <ActivityIndicator color="#fff"/>
                    ) : (
                        <Text className="text-white text-base font-semibold">Save</Text>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

export default Workouts
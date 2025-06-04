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
import {useAuth} from "@/context/AuthProvider";
import {AntDesign} from "@expo/vector-icons";
import {collection, doc, getDoc, getDocs, setDoc} from 'firebase/firestore';
import {db} from '@/config/firebase';
import {WorkoutExercise} from "@/types/workout";
import {router} from "expo-router";

const Workouts = () => {
    const {userData} = useAuth();
    const [date, setDate] = useState(new Date());
    const [dayString, setDayString] = useState(new Date().toLocaleDateString('en-US', {weekday: 'long'}));
    const [dateString, setDateString] = useState(new Date().toLocaleDateString('en-GB').replace(/\//g, '-'));
    const [currentWorkout, setCurrentWorkout] = useState('Push');
    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false)

    const updateDateStrings = (newDate: any) => {
        const day = newDate.toLocaleDateString('en-US', {weekday: 'long'});
        const formattedDate = newDate.toLocaleDateString('en-GB').replace(/\//g, '-');

        setDayString(day);
        setDateString(formattedDate);

        return formattedDate;
    };

    const incrementDate = () => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1);
        setDate(newDate);
        updateDateStrings(newDate);
    };

    const decrementDate = () => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() - 1);
        setDate(newDate);
        updateDateStrings(newDate);
    };

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

            const workoutDocRef = doc(db, `users/${userId}/workouts`, dateString);
            await setDoc(workoutDocRef, workoutData);

            console.log("Workout saved successfully:", workoutData);
        } catch (error) {
            console.error("Error saving workout:", error);
        }
        setSaving(false);
    };

    const fetchWorkoutTemplates = async () => {
        if (!userData || !userData.userId) return;

        setLoading(true);
        try {
            const templatesRef = collection(db, `users/${userData.userId}/workoutTemplates/`);
            const snapshot = await getDocs(templatesRef);
            const templateData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            console.log("Fetched templates:", templateData);
            setTemplates(templateData);

        } catch (error) {
            console.error("Error fetching workout templates:", error);
        }
        setLoading(false);
    };

    const loadWorkoutTemplate = (template: any) => {
        setCurrentWorkout(template.name);

        const initializedExercises = template.exercises.map((ex: any, index: number) => {
            const sets = Array(ex.sets || 0).fill({weight: 0, reps: 0});
            return {
                id: ex.id || index + 1,
                name: ex.id || `Exercise ${index + 1}`,
                sets: sets
            };
        });

        setExercises(initializedExercises);
        setShowTemplates(false);
    };

    const fetchWorkout = async () => {
        if (!userData || !userData.userId) return;

        setLoading(true);
        try {
            setCurrentWorkout('');
            setExercises([]);

            const workoutDocRef = doc(db, `users/${userData.userId}/workouts`, dateString);
            const workoutDoc = await getDoc(workoutDocRef);

            if (workoutDoc.exists()) {
                const workoutData = {
                    id: workoutDoc.id,
                    ...workoutDoc.data()
                };
                console.log("Fetched workout for date:", dateString, workoutData);
                loadWorkout(workoutData);
            } else {
                setCurrentWorkout('');
                setExercises([]);
                console.log("No workout found for date:", dateString);
            }
        } catch (error) {
            console.error("Error fetching workout:", error);
            setCurrentWorkout('');
            setExercises([]);
        }
        setLoading(false);
    };

    const loadWorkout = (workout: any) => {
        if (!workout || !workout.workoutName || !workout.exercises) {
            console.log("Invalid workout data:", workout);
            setCurrentWorkout('');
            setExercises([]);
            return;
        }

        setCurrentWorkout(workout.workoutName);

        const initializedExercises = workout.exercises.map((ex: any, index: number) => {
            return {
                id: ex.id || index + 1,
                name: ex.name || `Exercise ${index + 1}`,
                sets: Array.isArray(ex.sets) ? ex.sets : [],
            };
        });
        setExercises(initializedExercises);
        setShowTemplates(false);
    };

    useEffect(() => {
        if (dateString) {
            fetchWorkout();
        }
    }, [dateString]);

    return (
        <SafeAreaView className="bg-primary-background h-full">
            <View className="flex-1">
                <View className='flex-row items-center justify-center mt-4 bg-primary m-2 rounded-lg'>
                    <Pressable
                        className="w-10 h-10 justify-center items-center"
                        onPress={() => {
                            decrementDate();
                        }
                        }
                    >
                        <AntDesign name="arrowleft" size={24} color="white"/>
                    </Pressable>
                    <Text className='text-orange-600 text-2xl ml-5 mr-5'>{dayString} {dateString}</Text>
                    <Pressable
                        className="w-10 h-10 justify-center items-center"
                        onPress={() => {
                            incrementDate();
                        }
                        }
                    >
                        <AntDesign name="arrowright" size={24} color="white"/>
                    </Pressable>
                </View>

                <View className='flex-row justify-center items-center bg-primary m-2 rounded-lg'>
                    <View className="flex-row justify-center items-center">
                        <Text className="text-white text-xl mr-2 font-bold">Current workout: </Text>
                        <Text className="text-blue-500 font-bold text-xl">{currentWorkout}</Text>
                        <TouchableOpacity
                            className="rounded-lg p-3"
                            onPress={() => {
                                fetchWorkoutTemplates();
                                setShowTemplates(true);
                            }}
                        >
                            <AntDesign name="edit" size={20} color="white"/>
                        </TouchableOpacity>
                    </View>
                    <Modal visible={showTemplates} transparent animationType="slide">
                        <TouchableOpacity
                            className="flex-1 bg-black/85"
                            onPress={() => setShowTemplates(false)}
                        />
                        <View className="flex-1 p-4 bg-black/85">
                            <View className="flex-row">
                                <Text className="m-4 text-white text-xl font-bold">Workout Templates</Text>
                                <Pressable className="flex-row m-4 absolute right-0" onPress={() =>
                                {
                                    setShowTemplates(false);
                                    router.push('/(pages)/(Workouts)/templateManager')}
                                }>
                                    <Text className="text-blue-500 text-xl font-bold mr-2">Add</Text>
                                    <AntDesign name="pluscircle" size={24} color="#3b82f6"/>
                                </Pressable>
                            </View>

                            {loading ? (
                                <View className="h-1/2 w-1/2 justify-center items-center">
                                    <ActivityIndicator size="large" color="white"/>
                                </View>
                            ) : templates.length > 0 ? (
                                <FlatList
                                    data={templates}
                                    keyExtractor={(item, index) => item.id || index.toString()}
                                    renderItem={({item}) => (
                                        <TouchableOpacity
                                            className="bg-gray-800 p-4 rounded-lg mb-3 border border-gray-700"
                                            onPress={() => loadWorkoutTemplate(item)}
                                        >
                                            <Text className="text-white text-lg font-bold">{item.name}</Text>
                                            <Text className="text-gray-400 mt-1">
                                                {item.exercises ? `${item.exercises.length} exercises` : 'No exercises'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            ) : (
                                <View className="flex-1 justify-center items-center">
                                    <Text className="text-white text-lg">No templates found</Text>
                                    <TouchableOpacity
                                        className="bg-orange-600 px-4 py-2 rounded-lg mt-4"
                                    >
                                        <Text className="text-white">Create Default Templates</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </Modal>
                </View>

                <View className="flex-1">
                    {loading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="white"/>
                        </View>
                    ) : (
                        <FlatList
                            data={exercises}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({item}) => (
                                <View className="bg-primary m-2 rounded-lg p-2">
                                    <Text className="text-white text-xl font-bold ml-2">{item.name}</Text>
                                    {item.sets.map((set, index) => (
                                        <View className="flex-row justify-between" key={index}>
                                            <View className="flex-1 justify-start items-start m-2 px-2 mt-12">
                                                <Text
                                                    className="text-gray-400 text-sm font-semibold">Set {index + 1}</Text>
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
                    )}
                </View>
                <View className="pb-16 px-2">
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
            </View>
        </SafeAreaView>
    )
}

export default Workouts
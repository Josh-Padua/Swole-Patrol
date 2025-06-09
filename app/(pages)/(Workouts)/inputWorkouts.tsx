import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import React, {useEffect, useState} from 'react'
import {useAuth} from "@/context/AuthProvider";
import {AntDesign} from "@expo/vector-icons";
import {collection, doc, getDoc, getDocs, setDoc} from 'firebase/firestore';
import {db} from '@/config/firebase';
import {Exercise, WorkoutExercise, Set} from "@/types/workout";
import {router} from "expo-router";

const Workouts = () => {
    const formatDateYYYYMMDD = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const {userData} = useAuth();
    const [date, setDate] = useState(new Date());
    const [dayString, setDayString] = useState(new Date().toLocaleDateString('en-US', {weekday: 'long'}));
    const [dateString, setDateString] = useState(formatDateYYYYMMDD(new Date()));
    const [currentWorkout, setCurrentWorkout] = useState('Push');
    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
    const [saving, setSaving] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false)

    const updateDateStrings = (newDate: any) => {
        const day = newDate.toLocaleDateString('en-US', {weekday: 'long'});
        const formattedDate = formatDateYYYYMMDD(newDate);

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

    const calcOneRepMax = (weight: number, reps: number) => {
        if (!weight || !reps || reps < 1) return 0;
        if (reps === 1) return weight;
        if (reps > 10 && reps <= 16) return Math.round(weight * (reps/(reps*1.175)) * (36 / (37 - reps)));
        if (reps > 16) return 0; // Avoid unrealistic rep ranges for 1RM calculation
        return Math.round(weight * (36 / (37 - reps)));
    };

    const addSet = (exerciseId: number) => {
        setExercises((prev) =>
            prev.map((exercise) => {
                if (exercise.id === exerciseId) {
                    const newSet: Set = { weight: 0, reps: 0, Estimated1RM: 0 };
                    return { ...exercise, sets: [...exercise.sets, newSet] };
                }
                return exercise;
            })
        );
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

    const updateSet = (
        exerciseId: number,
        setIndex: number,
        field: 'weight' | 'reps',
        value: number
    ) => {
        setExercises((prev) =>
            prev.map((exercise) => {
                if (exercise.id === exerciseId) {
                    const updatedSets = exercise.sets.map((set, idx) => {
                        if (idx === setIndex) {
                            const updatedSet = { ...set, [field]: value };
                            const Estimated1RM = calcOneRepMax(
                                field === 'weight' ? value : updatedSet.weight,
                                field === 'reps' ? value : updatedSet.reps
                            );
                            return { ...updatedSet, Estimated1RM };
                        }
                        return set;
                    });
                    return { ...exercise, sets: updatedSets };
                }
                return exercise;
            })
        );
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

    const getExerciseById = async (id: string) => {
        try {
            const exerciseRef = doc(db, 'exercises', id);
            const exerciseDoc = await getDoc(exerciseRef);

            if (exerciseDoc.exists()) {
                console.log("Fetched exercise by ID:", id, exerciseDoc.data());
                return exerciseDoc.data() as Exercise;
            } else {
                console.error("No exercise found with ID:", id);
                return null;
            }
        } catch (error) {
            console.error("Error fetching exercise by ID:", error);
            return null;
        }
    };

    const loadWorkoutTemplate = async (template: any) => {
        setCurrentWorkout(template.name);

        const initializedExercises = await Promise.all(template.exercises.map(async (ex: any, index: number) => {
            const sets: Set[] = Array(ex.sets || 0).fill({ weight: 0, reps: 0, Estimated1RM: 0 });
            const exercise = await getExerciseById(ex.id);

            return {
                id: ex.id || index + 1,
                name: exercise?.name || `Exercise ${index + 1}`,
                exercise: exercise || null,
                helpShown: false,
                sets: sets
            };
        }));

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

    const loadWorkout = async (workout: any) => {
        if (!workout || !workout.workoutName || !workout.exercises) {
            console.log("Invalid workout data:", workout);
            setCurrentWorkout('');
            setExercises([]);
            return;
        }

        setCurrentWorkout(workout.workoutName);

        const initializedExercises = await Promise.all(workout.exercises.map(async (ex: any, index: number) => {
            const exercise = await getExerciseById(ex.id);
            return {
                id: ex.id || index + 1,
                name: ex.name || `Exercise ${index + 1}`,
                exercise: exercise || null,
                helpShown: false,
                sets: Array.isArray(ex.sets) ? ex.sets : [],
            };
        }));
        setExercises(initializedExercises);
        setShowTemplates(false);
    };

    const toggleHelpShown = (exerciseId: number) => {
        setExercises((prev) => {
            return prev.map((exercise) => {
                if (exercise.id === exerciseId) {
                    return {
                        ...exercise,
                        helpShown: !exercise.helpShown
                    };
                }
                return exercise;
            });
        });
    }

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
                                            <Text className="text-gray-400 mt-1">
                                                {item.description || 'No description available'}
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
                                    <Modal visible={item.helpShown} transparent animationType="fade">
                                        <View className="flex-1 justify-end">
                                            <TouchableOpacity
                                                className="absolute h-full w-full bg-black/50"
                                                onPress={() => toggleHelpShown(item.id)}
                                            />
                                            <View className="bg-gray-900 rounded-t-3xl p-6 min-h-[40%] max-h-[80%]">
                                                <View className="flex-row justify-between items-center mb-4">
                                                    <Text className="text-white text-xl font-bold">{item.name}</Text>
                                                    <Pressable onPress={() => toggleHelpShown(item.id)}>
                                                        <AntDesign name="close" size={24} color="#9ca3af"/>
                                                    </Pressable>
                                                </View>

                                                {item.exercise ? (
                                                    <ScrollView className="space-y-4">
                                                        <View className="bg-gray-800/50 p-4 rounded-xl">
                                                            <Text className="text-orange-500 font-bold text-sm mb-2">EXERCISE INFO</Text>
                                                            <View className="space-y-2">
                                                                <View className="flex-row">
                                                                    <Text className="text-gray-400 w-24">Level:</Text>
                                                                    <Text className="text-white flex-1 capitalize">{item.exercise.level}</Text>
                                                                </View>
                                                                <View className="flex-row">
                                                                    <Text className="text-gray-400 w-24">Equipment:</Text>
                                                                    <Text className="text-white flex-1 capitalize">{item.exercise.equipment}</Text>
                                                                </View>
                                                            </View>
                                                        </View>

                                                        <View className="bg-blue-900/30 p-4 rounded-xl">
                                                            <Text className="text-blue-400 font-bold text-sm mb-3">INSTRUCTIONS</Text>
                                                            {item.exercise.instructions.map((instruction, index) => (
                                                                <View key={index} className="flex-row mb-3 last:mb-0">
                                                                    <Text className="text-blue-400 font-bold mr-2">{index + 1}.</Text>
                                                                    <Text className="text-gray-300 flex-1 leading-5">{instruction}</Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    </ScrollView>
                                                ) : (
                                                    <View className="flex-1 justify-center items-center">
                                                        <Text className="text-gray-400">No instructions available</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </Modal>
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-white text-xl font-bold ml-2">{item.name}</Text>
                                        <Pressable onPress={() => toggleHelpShown(item.id)}>
                                            <AntDesign name="questioncircle" size={24} color="#4096ff"/>
                                        </Pressable>
                                    </View>

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
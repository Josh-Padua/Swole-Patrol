import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Pressable,
    ScrollView,
    Button
} from 'react-native'
import React, {useEffect} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {Exercise} from "@/types/workout";
import {addDoc, collection, getDocs} from 'firebase/firestore';
import {db} from '@/config/firebase';
import {AntDesign} from "@expo/vector-icons";
import {ExerciseTemplate, WorkoutTemplate} from "@/types/workout";
import {useAuth} from "@/context/AuthProvider"

const TemplateManager = () => {
    const {userData} = useAuth();
    const [title, setTitle] = React.useState<string>('')
    const [exercises, setExercises] = React.useState<Exercise[]>([])
    const [loading, setLoading] = React.useState<boolean>(true);
    const [filter, setFilter] = React.useState<string>('');
    const filteredExercises = filter.trim()
        ? exercises.filter(exercise =>
            exercise.name.toLowerCase().includes(filter.toLowerCase())
        )
        : [];
    const [selectedExercises, setSelectedExercises] = React.useState<Exercise[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
    const [ExerciseTemplates, setExerciseTemplates] = React.useState<ExerciseTemplate[]>([]);

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

    const toggleExercise = (exercise: Exercise) => {
        const isSelected = selectedIds.has(exercise.id);
        if (isSelected) {
            setSelectedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(exercise.id);
                return newSet;
            });
            setSelectedExercises(prev => prev.filter(e => e.id !== exercise.id));
            setExerciseTemplates(prev => prev.filter(e => e.id !== exercise.id));
        } else {
            setSelectedIds(prev => new Set(prev).add(exercise.id));
            setSelectedExercises(prev => [...prev, exercise]);
            setExerciseTemplates(prev => [...prev, { id: exercise.id, sets: 1 }]);
            setFilter("")
        }
    };

    const isExerciseSelected = (exercise: Exercise) => {
        return selectedIds.has(exercise.id);
    };

    const toggleExpanded = (exerciseId: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(exerciseId)) {
                newSet.delete(exerciseId);
            } else {
                newSet.add(exerciseId);
            }
            return newSet;
        });
    };

    const isExerciseExpanded = (exerciseId: string) => {
        return expandedIds.has(exerciseId);
    };

    const saveWorkoutTemplate = async () => {
        if (title.trim() === '') {
            alert('Please enter a title for the workout template.');
            return;
        }
        if (selectedExercises.length === 0) {
            alert('Please select at least one exercise for the workout template.');
            return;
        }

        const workoutTemplate: WorkoutTemplate = {
            name: title,
            description: '', // can be modified later
            exercises: ExerciseTemplates,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        try {
            const templatesCollection = collection(db, `users/${userData?.userId}/workoutTemplates`);
            await addDoc(templatesCollection, workoutTemplate);
            console.log("Workout template saved successfully:", workoutTemplate);
            setTitle('');
            setSelectedExercises([]);
            setSelectedIds(new Set());
        } catch (error) {
            console.error("Error saving workout template:", error);
        }
    };

    const updateSets = (exerciseId: string, sets: number) => {
        setExerciseTemplates(prev => prev.map(template =>
            template.id === exerciseId ? { ...template, sets } : template
        ));
    };

    useEffect(() => {
        var workoutExercises = [];
        for (const exercise of selectedExercises) {
            workoutExercises.push(exercise.name);
        }
        console.log("Selected Exercises: ", workoutExercises);
    }, [selectedExercises]);

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
                    className="font-bold text-xl text-white h-8 pt-0 pb-0 w-full"
                    value={title}
                    onChangeText={setTitle}/>
                {/*<Button title="Save" onPress={saveWorkoutTemplate} />*/}
                <Pressable className="absolute right-2 top-2">
                    <AntDesign name="save" size={24} color="#4096ff" onPress={saveWorkoutTemplate}/>
                </Pressable>
            </View>
            {/*<View className='flex-row items-center justify-center mt-4 bg-primary m-2 rounded-lg p-2'>*/}
            {/*    <TextInput*/}
            {/*        placeholder="Search Exercises"*/}
            {/*        className="font-bold text-xl text-white h-8 pt-0 pb-0"*/}
            {/*        value={filter}*/}
            {/*        onChangeText={setFilter}/>*/}
            {/*</View>*/}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="white"/>
                </View>
            ) : (
                <ScrollView>
                    <View>
                        <View
                            className='flex-col items-center justify-center mt-4 bg-primary m-2 rounded-lg p-2 h-fit max-h-96'>
                            <View className="flex-row items-center justify-between w-full mb-2">
                                <TextInput
                                    placeholder="Search Exercises"
                                    className="font-bold text-xl text-white h-8 pt-0 pb-0 m-2 w-11/12 bg-gray-700 rounded-lg"
                                    value={filter}
                                    onChangeText={setFilter}/>
                            <Pressable onPress={() => setFilter('')}>
                                <AntDesign name="closecircle" className='right-1 -top-1.5 absolute'/>
                            </Pressable>
                            </View>

                            <FlatList
                                data={filteredExercises}
                                keyExtractor={(item, index) => item.id || index.toString()}
                                className="w-full"
                                renderItem={({item}) => {
                                    const isSelected = isExerciseSelected(item);
                                    return (
                                        <TouchableOpacity
                                            className="bg-gray-800 p-4 rounded-lg mb-3 border border-gray-700"
                                            onPress={() => toggleExercise(item)}
                                        >
                                            <Text className="text-white text-lg font-bold">{item.name}</Text>
                                            {isSelected ? (<AntDesign name="delete" size={24} color="red" style={{
                                                    position: 'absolute',
                                                    right: 10,
                                                    top: 14
                                                }}/>) :
                                                (<AntDesign name="pluscircle" size={24} color="green"
                                                            className="absolute right-0 top-2 p-2"/>)}
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </View>
                        <View className='flex-col items-start justify-center mt-4 bg-primary m-2 rounded-lg p-2'>
                            <Text className="text-white text-xl font-bold ml-2 pb-3">Selected exercises</Text>
                            <FlatList
                                data={selectedExercises}
                                keyExtractor={(item, index) => item.id || index.toString()}
                                className="w-full"
                                renderItem={({item}) => (
                                    <View className="bg-gray-800 p-2 rounded-lg mb-3 border border-gray-700">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-white text-lg font-bold">{item.name}</Text>
                                            <Pressable onPress={() => toggleExercise(item)}>
                                                <AntDesign name="delete" size={24} color="red" className=""/>
                                            </Pressable>
                                        </View>
                                        <View className="flex-row items-center justify-between mt-2">
                                            <Text className="text-white text-lg font-bold">Number of sets</Text>
                                            <TextInput
                                                placeholder="Sets"
                                                className="text-white text-sm w-16 bg-gray-700 rounded-lg "
                                                onChangeText={(text) => {
                                                    const sets = parseInt(text) || 1;
                                                    updateSets(item.id, sets);
                                                }}
                                            />
                                        </View>

                                        {isExerciseExpanded(item.id) ? (
                                            <View>
                                                <View className="border-t border-gray-600 pt-4 mt-3">
                                                    <View className="space-y-3">
                                                        <View className="flex-row items-start">
                                                            <Text
                                                                className="text-orange-500 font-bold w-24 text-sm">LEVEL:</Text>
                                                            <Text
                                                                className="text-gray-200 flex-1 font-medium capitalize">{item.level}</Text>
                                                        </View>

                                                        <View className="flex-row items-start">
                                                            <Text
                                                                className="text-orange-500 font-bold w-24 text-sm">FORCE:</Text>
                                                            <Text
                                                                className="text-gray-200 flex-1 font-medium capitalize">{item.force}</Text>
                                                        </View>
                                                        <View className="flex-row items-start">
                                                            <Text
                                                                className="text-orange-500 font-bold w-24 text-sm">TYPE:</Text>
                                                            <Text
                                                                className="text-gray-200 flex-1 font-medium capitalize">{item.mechanic}</Text>
                                                        </View>
                                                        <View className="flex-row items-start">
                                                            <Text
                                                                className="text-orange-500 font-bold w-24 text-sm">GEAR:</Text>
                                                            <Text
                                                                className="text-gray-200 flex-1 font-medium capitalize">{item.equipment}</Text>
                                                        </View>
                                                        <View className="bg-gray-700/50 p-3 rounded-lg mt-3">
                                                            <Text className="text-orange-500 font-bold text-sm mb-2">TARGET
                                                                MUSCLES</Text>
                                                            <View className="flex-row items-start mb-2">
                                                                <Text
                                                                    className="text-gray-300 font-semibold w-20 text-xs">Primary:</Text>
                                                                <Text
                                                                    className="text-gray-100 flex-1 font-medium">{item.primaryMuscles.join(', ')}</Text>
                                                            </View>
                                                            <View className="flex-row items-start">
                                                                <Text
                                                                    className="text-gray-300 font-semibold w-20 text-xs">Secondary:</Text>
                                                                <Text
                                                                    className="text-gray-100 flex-1">{item.secondaryMuscles.join(', ')}</Text>
                                                            </View>
                                                        </View>
                                                        <View className="bg-blue-900/30 p-3 rounded-lg mt-3">
                                                            <Text className="text-blue-400 font-bold text-sm mb-3">HOW
                                                                TO
                                                                PERFORM</Text>
                                                            <View className="space-y-2">
                                                                {item.instructions.map((instruction, index) => (
                                                                    <View key={index} className="flex-row items-start">
                                                                        <Text
                                                                            className="text-blue-300 font-bold text-xs w-6 mt-0.5">{index + 1}.</Text>
                                                                        <Text
                                                                            className="text-gray-200 flex-1 leading-5">{instruction}</Text>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                                <Pressable className="items-center"
                                                           onPress={() => toggleExpanded(item.id)}>
                                                    <AntDesign name="up" color="#ea580c" size={24}/>
                                                </Pressable>
                                            </View>
                                        ) : (
                                            <Pressable className="items-center" onPress={() => toggleExpanded(item.id)}>
                                                <AntDesign name="down" color="#ea580c" size={24}/>
                                            </Pressable>
                                        )}

                                    </View>
                                )}
                            />
                        </View>
                    </View>
                </ScrollView>)}
        </SafeAreaView>
    )
}
export default TemplateManager

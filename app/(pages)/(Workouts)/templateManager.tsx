import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Pressable,
    KeyboardAvoidingView
} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {Exercise} from "@/types/workout";
import {addDoc, collection, getDocs} from 'firebase/firestore';
import {db} from '@/config/firebase';
import {AntDesign} from "@expo/vector-icons";
import {ExerciseTemplate, WorkoutTemplate} from "@/types/workout";
import {useAuth} from "@/context/AuthProvider"
import {Picker} from '@react-native-picker/picker';

const TemplateManager = () => {
    const {userData} = useAuth();
    const [title, setTitle] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<string>('');
    const [selectedMuscle, setSelectedMuscle] = useState<string>('');
    const [selectedEquipment, setSelectedEquipment] = useState<string>('');
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [ExerciseTemplates, setExerciseTemplates] = useState<ExerciseTemplate[]>([]);

    const allMuscles = Array.from(
        new Set(
            exercises.flatMap(e => (e.primaryMuscles || []).filter((m): m is string => !!m))
        )
    ).sort((a, b) => a.localeCompare(b));

    const allEquipment = Array.from(
        new Set(
            exercises.map(e => e.equipment).filter((eq): eq is string => !!eq)
        )
    ).sort((a, b) => a.localeCompare(b));

    const filteredExercises = exercises.filter(exercise => {
        const matchesName = filter.trim()
            ? exercise.name.toLowerCase().includes(filter.toLowerCase())
            : true;
        const matchesMuscle = selectedMuscle
            ? (exercise.primaryMuscles || []).includes(selectedMuscle)
            : true;
        const matchesEquipment = selectedEquipment
            ? exercise.equipment === selectedEquipment
            : true;
        return matchesName && matchesMuscle && matchesEquipment;
    });

    const fetchExercises = async () => {
        setLoading(true);
        try {
            const exercisesCollection = collection(db, 'exercises');
            const exerciseDocs = await getDocs(exercisesCollection);
            // @ts-ignore
            const fetchedExercises: Exercise[] = exerciseDocs.docs.map(doc => {
                const { id: fieldId, ...exerciseData } = doc.data();
                return {
                    id: doc.id,
                    fieldId,
                    ...exerciseData
                };
            });
            fetchedExercises.sort((a, b) => a.name.localeCompare(b.name));
            setExercises(fetchedExercises);
            setLoading(false);
        } catch (error) {
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
            description: description,
            exercises: ExerciseTemplates,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        try {
            const templatesCollection = collection(db, `users/${userData?.userId}/workoutTemplates`);
            await addDoc(templatesCollection, workoutTemplate);
            setTitle('');
            setSelectedExercises([]);
            setSelectedIds(new Set());
            setDescription('');
        } catch (error) {
        }
    };

    const updateSets = (exerciseId: string, sets: number) => {
        setExerciseTemplates(prev => prev.map(template =>
            template.id === exerciseId ? { ...template, sets } : template
        ));
    };

    useEffect(() => {
        let workoutExercises = [];
        for (const exercise of selectedExercises) {
            workoutExercises.push(exercise.name);
        }
    }, [selectedExercises]);

    useEffect(() => {
        if (exercises.length === 0) {
            fetchExercises();
        }
    }, []);

    return (
        <SafeAreaView className="bg-primary-background h-full flex-1">
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <View className='flex-row items-center justify-center mt-4 bg-primary m-2 rounded-lg p-2'>
                    <TextInput
                        placeholder="Workout Title"
                        className="font-bold text-xl text-white h-8 pt-0 pb-0 w-full"
                        value={title}
                        onChangeText={setTitle}/>
                    <Pressable className="absolute right-2 top-2">
                        <AntDesign name="save" size={24} color="#4096ff" onPress={saveWorkoutTemplate}/>
                    </Pressable>
                </View>
                <View className="flex-row items-center justify-center mt-4 bg-primary m-2 rounded-lg p-2">
                    <TextInput
                        className='font-bold text-xl text-white h-fit pt-0 pb-0 w-full'
                        placeholder="Description"
                        value={description}
                        multiline={true}
                        numberOfLines={2}
                        onChangeText={setDescription}
                    />
                </View>
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="white"/>
                    </View>
                ) : (
                    <View style={{ flex: 1 }}>
                        <View className='flex-col items-center justify-center mt-4 bg-primary m-2 rounded-lg p-2 h-fit max-h-96'>
                            <View className="flex-row w-full mb-2">
                                <View className="flex-row w-full mb-2">
                                    <View style={{ flex: 1, height: 50, backgroundColor: '#374151', borderRadius: 8, overflow: 'hidden' }}>
                                        <Picker
                                            selectedValue={selectedMuscle}
                                            style={{ flex: 1, color: 'white', height: 50 }}
                                            onValueChange={setSelectedMuscle}
                                            itemStyle={{ height: 50, fontSize: 16 }}
                                        >
                                            <Picker.Item label="All Muscles" value="" />
                                            {allMuscles.map(muscle => (
                                                <Picker.Item key={muscle} label={muscle} value={muscle} />
                                            ))}
                                        </Picker>
                                    </View>
                                    <View style={{ flex: 1, height: 50, backgroundColor: '#374151', borderRadius: 8, marginLeft: 8, overflow: 'hidden' }}>
                                        <Picker
                                            selectedValue={selectedEquipment}
                                            style={{ flex: 1, color: 'white', height: 50 }}
                                            onValueChange={setSelectedEquipment}
                                            itemStyle={{ height: 50, fontSize: 16 }}
                                        >
                                            <Picker.Item label="All Equipment" value="" />
                                            {allEquipment.map(eq => (
                                                <Picker.Item key={eq} label={eq} value={eq} />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>
                            </View>
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
                        <View className='flex-1 flex-col items-start justify-center mt-4 bg-primary m-2 rounded-lg p-2'>
                            <Text className="text-white text-xl font-bold ml-2 pb-3">Selected exercises</Text>
                            <FlatList
                                data={selectedExercises}
                                keyExtractor={(item, index) => item.id || index.toString()}
                                className="w-full flex-1"
                                contentContainerStyle={{ flexGrow: 1 }}
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
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
export default TemplateManager
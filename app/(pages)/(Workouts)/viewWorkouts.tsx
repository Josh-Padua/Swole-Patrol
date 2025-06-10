import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Modal,
    Pressable,
    TextInput,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {collection, doc, documentId, getDoc, getDocs, query, setDoc, where} from "firebase/firestore";
import {db} from "@/config/firebase";
import {useAuth} from "@/context/AuthProvider";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {AntDesign} from "@expo/vector-icons";

const dummyProgressData = [
    {date: '2024-05-01', weight: 60},
    {date: '2024-05-15', weight: 62},
    {date: '2024-06-01', weight: 65},
];

const chartData = {
    labels: dummyProgressData.map(d => d.date.slice(5)),
    datasets: [
        {
            data: dummyProgressData.map(d => d.weight),
            color: () => '#FF5400',
            strokeWidth: 2,
        },
    ],
};

const screenWidth = Dimensions.get('window').width - 32;

const ViewWorkouts = () => {
    const [gallery, setGallery] = useState<{ uri: string; date: string }[]>([]);
    const [goal, setGoal] = useState({currentMax: 0, goal: 0, achieved: false});
    const [modalVisible, setModalVisible] = useState(false);
    const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
    const [selectedPic, setSelectedPic] = useState<{ uri: string; date: string } | null>(null);
    const [testChartData, setTestChartData] = useState(chartData);
    const [days, setDays] = useState<string | number>(28);
    const {userData} = useAuth();
    const GALLERY_KEY = 'progress_gallery';
    const scopeFilter = [{key: 1, label: "3 Months", value: 28 * 3}, {
        key: 2,
        label: "6 Months",
        value: 28 * 6
    }, {key: 3, label: "1 Year", value: 28 * 12}];
    const [exercises, setExercises] = useState<{ id: string, name: string }[]>([]);
    const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredExercises, setFilteredExercises] = useState<{ id: string, name: string }[]>([]);
    const [streak, setStreak] = useState<{ currentStreak: number; lastCheckin: string }>({
        currentStreak: 0,
        lastCheckin: '',
    });

    const formatDateYYYYMMDD = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const loadGallery = async () => {
        const data = await AsyncStorage.getItem(GALLERY_KEY);
        if (data) setGallery(JSON.parse(data));
    };

    const saveGallery = async (galleryData: typeof gallery) => {
        await AsyncStorage.setItem(GALLERY_KEY, JSON.stringify(galleryData));
    };

    const getChartData = async (days: number, exerciseId: string) => {
        const chartData: { date: String; weight: number; }[] = []
        const uniqueExercises = new Map<string, string>();
        const date = formatDateYYYYMMDD(new Date())
        const toDate = new Date().setDate(new Date().getDate() - days)
        const toDateFormatted = formatDateYYYYMMDD(new Date(toDate))
        console.log("to date: " + toDate)
        console.log("current date: " + date)
        const workoutsRef = collection(db, 'users', userData.userId, 'workouts');
        const q = query(
            workoutsRef,
            where(documentId(), '<=', date),
            where(documentId(), '>=', toDateFormatted)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as { exercises?: any[] }),
        }));
        console.log(data);
        let atMax1RM: { exerciseId: string; max1RM: number }[] = [];
        data.forEach(doc => {
            let max1RM = 0;
            if (Array.isArray(doc.exercises)) {
                doc.exercises.forEach((exercise: any) => {
                    if (exercise.id && exercise.name && !uniqueExercises.has(exercise.id)) {
                        uniqueExercises.set(exercise.id, exercise.name);
                    }
                    exercise.sets.forEach((set: any) => {
                        if (exercise.id === exerciseId && set.Estimated1RM && set.Estimated1RM > max1RM) {
                            max1RM = set.Estimated1RM;
                        }
                    });
                    if (max1RM > 0) {
                        const found = atMax1RM.find(e => e.exerciseId === exercise.id);
                        if (!found) {
                            atMax1RM.push({exerciseId: exercise.id, max1RM});
                        } else if (max1RM > found.max1RM) {
                            found.max1RM = max1RM;
                        }
                    }
                });
            }
            if (max1RM !== 0) {
                const entry = {date: doc.id, weight: max1RM};
                chartData.push(entry);
            }
        });
        const exercisesArray = Array.from(uniqueExercises.entries()).map(([id, name]) => ({
            id,
            name
        }));
        setExercises(exercisesArray);
        setFilteredExercises(exercisesArray);

        for (const entry of atMax1RM) {
            const maxRef = doc(db, 'users', userData.userId, 'exerciseMaxes', entry.exerciseId, 'timePeriods', days.toString());
            const maxSnap = await getDoc(maxRef);

            let dbMax = 0;
            if (maxSnap.exists()) {
                dbMax = maxSnap.data().max1RM || 0;
            }

            if (entry.max1RM > dbMax) {
                await setDoc(maxRef, {estimatedMax1RM: entry.max1RM}, {merge: true});
            }

            if (chartData.length > 0) {
                const newChartData = {
                    labels: chartData.map(d => {
                        const dateObj = new Date(d.date.toString());
                        return `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                    }),
                    datasets: [
                        {
                            data: chartData.map(d => d.weight),
                            color: () => '#FF5400',
                            strokeWidth: 2,
                        },
                    ],
                };
                setTestChartData(newChartData);
            }
        }
    }

    const handleUploadPicture = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({mediaTypes: ImagePicker.MediaTypeOptions.Images});
        if (result.canceled) return;

        const uri = result.assets[0].uri;
        const fileName = uri.split('/').pop();
        if (!FileSystem.documentDirectory) {
            throw new Error('Document directory is not available');
        }
        const newPath = FileSystem.documentDirectory + fileName;

        await FileSystem.copyAsync({from: uri, to: newPath});

        const newGallery = [
            ...gallery,
            {uri: newPath, date: formatDateYYYYMMDD(new Date())},
        ];
        setGallery(newGallery);
        saveGallery(newGallery);
    };

    const handleDeletePic = (idx: number) => {
        Alert.alert(
            'Delete Photo',
            'Are you sure you want to delete this photo?',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const newGallery = gallery.filter((_, i) => i !== idx);
                        setGallery(newGallery);
                        saveGallery(newGallery);
                    },
                },
            ],
            {cancelable: true}
        );
    };

    const openModal = (pic: { uri: string; date: string }) => {
        setSelectedPic(pic);
        setModalVisible(true);
    };

    const handleExerciseSelect = (exerciseIndex: number) => {
        setSelectedExerciseIndex(exerciseIndex);
        setExerciseModalVisible(false);
        setSearchQuery('');
        const daysNum = typeof days === 'string' ? parseInt(days) : days;
        const selectedExercise = exercises[exerciseIndex];
        if (selectedExercise) {
            getChartData(336, selectedExercise.id);
            getChartData(daysNum, selectedExercise.id);
        }
        fetchAndUpdateGoal(selectedExercise.id);
    };

    const openExerciseModal = () => {
        setExerciseModalVisible(true);
        setSearchQuery('');
        setFilteredExercises(exercises);
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredExercises(exercises);
        } else {
            const filtered = exercises.filter(exercise =>
                exercise.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredExercises(filtered);
        }
    };

    const fetchAndUpdateGoal = async (exerciseId: string) => {
        const goalRef = doc(db, 'users', userData.userId, 'exerciseMaxes', exerciseId, 'goal', 'value');
        const maxRef = doc(db, 'users', userData.userId, 'exerciseMaxes', exerciseId, 'timePeriods', '28');
        const [goalSnap, maxSnap] = await Promise.all([getDoc(goalRef), getDoc(maxRef)]);

        const dbGoal = goalSnap.exists() ? goalSnap.data().goal || 0 : 0;
        const dbCurrentMax = maxSnap.exists() ? maxSnap.data().estimatedMax1RM || 0 : 0;

        let newGoal = dbGoal;
        let achieved = false;

        if (dbCurrentMax >= dbGoal) {
            // Increment by 2.5 or set to next 2.5 above new max
            const increment = 2.5;
            newGoal = Math.ceil((dbCurrentMax + increment) / increment) * increment;
            achieved = true;
            // Save new goal to Firestore
            await setDoc(goalRef, {goal: newGoal, currentMax: dbCurrentMax}, {merge: true});
        }

        setGoal({
            currentMax: dbCurrentMax,
            goal: newGoal,
            achieved,
        });
    };

    const getStreakFromFirebase = async () => {
        if (!userData?.userId) return;

        const streakRef = doc(db, 'users', userData.userId, 'streak', 'current');
        const streakSnap = await getDoc(streakRef);

        const today = formatDateYYYYMMDD(new Date());
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = formatDateYYYYMMDD(yesterdayDate);

        if (streakSnap.exists()) {
            const data = streakSnap.data();
            let {currentStreak, lastCheckin} = data;

            if (lastCheckin === today) {
                setStreak({currentStreak, lastCheckin});
                return;
            }

            if (lastCheckin === yesterday) {
                setStreak({currentStreak, lastCheckin});
                return;
            }

            // Streak is broken
            await setDoc(streakRef, {
                currentStreak: 0,
                lastCheckin: yesterday,
            });
            setStreak({
                currentStreak: 0,
                lastCheckin: yesterday,
            });
        } else {
            await setDoc(streakRef, {
                currentStreak: 0,
                lastCheckin: yesterday,
            });
            setStreak({
                currentStreak: 0,
                lastCheckin: yesterday,
            });
        }
    };

    const setStreakInFirebase = async (newStreak: number) => {
        if (streak.lastCheckin === formatDateYYYYMMDD(new Date())) {
            alert("You have already checked in today!");
            return;
        }
        const streakRef = doc(db, 'users', userData.userId, 'streak', 'current');
        await setDoc(streakRef, {
            currentStreak: newStreak,
            lastCheckin: formatDateYYYYMMDD(new Date())
        }, {merge: true});

        setStreak({currentStreak: newStreak, lastCheckin: formatDateYYYYMMDD(new Date())});
    }

    useEffect(() => {
        const selectedExercise = exercises[selectedExerciseIndex];
        if (selectedExercise && userData?.userId) {
            fetchAndUpdateGoal(selectedExercise.id);
        }
    }, [exercises, selectedExerciseIndex, userData]);

    useEffect(() => {
        const daysNum = typeof days === 'string' ? parseInt(days) : days;
        if (!isNaN(daysNum) && daysNum > 0) {
            getChartData(daysNum, "sFtHfYh6UyXjd6Il8oma");
        }
        loadGallery();
    }, []);

    useEffect(() => {
        if (userData?.userId) {
            getStreakFromFirebase();
        }
    }, [userData?.userId]);

    return (
        <ScrollView className="flex-1 bg-zinc-900 px-4 py-4 mb-14">
            {streak.lastCheckin == formatDateYYYYMMDD(new Date()) ? (
                <View className="bg-accent-orange rounded-xl p-4 mb-6 items-center">
                    <Text className="text-white text-lg font-bold w-full text-center">Workout Streak</Text>
                    <Text className="text-3xl text-white font-extrabold mt-1">{streak.currentStreak} days</Text>
                    <Text className="text-white text-xs mt-1">Keep it up!</Text>
                </View>) : (
                <Pressable
                    className={streak.currentStreak === 0 ? ("bg-accent-red rounded-xl p-4 mb-6 items-center") : ("bg-accent-green rounded-xl p-4 mb-6 items-center")}
                    onPress={() => setStreakInFirebase(streak.currentStreak + 1)}>
                    {streak.currentStreak === 0 && (
                        <Text className="text-white text-xl font-bold w-full text-center">Oh No, You've lost your
                            streak</Text>
                    )}
                    <Text className="text-white text-lg font-bold w-full text-center">Workout Streak</Text>
                    <Text className="text-3xl text-white font-extrabold mt-1">{streak.currentStreak} days</Text>
                    <Text className="text-white text-s mt-1">Press to checkin!</Text>
                </Pressable>
            )}
            <View className="flex-row justify-between items-center mb-0">
                <Text className="text-white text-xl font-bold">Progress Chart</Text>
                <View style={{
                    width: 100,
                    height: 40,
                    backgroundColor: '#374151',
                    borderRadius: 8,
                    overflow: 'hidden',
                    marginLeft: 12,
                    top: -8
                }}>
                    <Picker
                        selectedValue={days}
                        style={Platform.OS === 'ios' ? ({
                            width: 120,
                            color: 'white',
                            height: 50,
                            top: 2,
                            left: -10
                        }) : ({
                            width: 140,
                            color: 'white',
                            height: 50,
                            top: -8,
                            left: 2
                        })}
                        onValueChange={value => {
                            setDays(value);
                            const selectedExercise = exercises[selectedExerciseIndex];
                            if (selectedExercise) {
                                getChartData(value as number, selectedExercise.id);
                            }
                        }}
                        itemStyle={{height: 36, fontSize: 14}}
                    >
                        <Picker.Item label="28 Days" value={28}/>
                        {scopeFilter.map(filter => (
                            <Picker.Item key={filter.key} label={filter.label} value={filter.value}/>
                        ))}
                    </Picker>
                </View>
            </View>

            <View className="flex-row justify-between items-center mb-2">
                <Pressable
                    className="bg-gray-700 px-4 py-2 rounded-lg"
                    onPress={openExerciseModal}
                >
                    <Text className="text-white text-base">
                        {exercises[selectedExerciseIndex]?.name || 'Loading...'}
                    </Text>
                </Pressable>
            </View>

            <View className="bg-zinc-800 rounded-xl p-4 mb-6">
                <LineChart
                    data={testChartData}
                    width={screenWidth}
                    height={180}
                    chartConfig={{
                        backgroundGradientFrom: '#18181b',
                        backgroundGradientTo: '#18181b',
                        color: () => '#FF5400',
                        labelColor: () => '#fff',
                        propsForDots: {r: '5', strokeWidth: '2', stroke: '#FF5400'},
                        propsForBackgroundLines: {stroke: '#334155'},
                    }}
                    style={{borderRadius: 12}}
                />
            </View>
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold mb-4">Progress Gallery</Text>
                <Pressable>
                    <Text className="text-blue-400 font-bold text-l mb-4 mr-4">View</Text>
                </Pressable>
            </View>
            <ScrollView horizontal className="flex-row mb-6">
                {gallery.map((pic, idx) => (
                    <View key={idx} className="items-center mr-4">
                        <Pressable onPress={() => openModal(pic)}>
                            <Image source={{uri: pic.uri}} className="w-20 h-32 rounded-lg bg-zinc-700"/>
                            <Pressable
                                className="absolute top-0 right-0 p-2 z-0"
                                onPress={() => handleDeletePic(idx)}
                            >
                                <AntDesign name="delete" size={12} color="red"/>
                            </Pressable>
                        </Pressable>
                        <Text className="text-xs text-white mt-1">{pic.date}</Text>
                    </View>
                ))}
                <TouchableOpacity
                    className="w-20 h-32 rounded-lg bg-accent-orange items-center justify-center"
                    onPress={handleUploadPicture}
                >
                    <Text className="text-white text-2xl">+</Text>
                    <Text className="text-white text-xs mt-1">Upload</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/80 justify-center items-center p-2">
                    <View className="bg-zinc-900 rounded-xl p-3 items-center w-full h-full max-w-full max-h-full">
                        {selectedPic && (
                            <>
                                <Image
                                    source={{uri: selectedPic.uri}}
                                    className="w-full h-5/6 rounded-xl mb-3"
                                    resizeMode="contain"
                                />
                                <Text className="text-white text-base mb-2">{selectedPic.date}</Text>
                                <Pressable
                                    className="bg-accent-orange px-4 py-2 rounded-lg"
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text className="text-white font-semibold">Close</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal visible={exerciseModalVisible} transparent animationType="slide">
                <TouchableOpacity
                    className="flex-1 bg-black/85"
                    onPress={() => setExerciseModalVisible(false)}
                />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 p-4 bg-black/85"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View className="flex-row justify-between items-center">
                        <Text className="m-4 text-white text-xl font-bold">Select Exercise</Text>
                        <Pressable
                            className="flex-row m-4"
                            onPress={() => setExerciseModalVisible(false)}
                        >
                            <AntDesign name="close" size={24} color="white"/>
                        </Pressable>
                    </View>

                    <View className="mx-4 mb-4">
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg"
                            placeholder="Search exercises..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoCorrect={false}
                        />
                    </View>

                    <FlatList
                        data={filteredExercises}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        className="flex-1"
                        renderItem={({item}) => {
                            const originalIndex = exercises.findIndex(ex => ex.id === item.id);
                            const isSelected = selectedExerciseIndex === originalIndex;
                            return (
                                <TouchableOpacity
                                    className={`p-4 rounded-lg mb-3 mx-4 border ${
                                        isSelected
                                            ? 'bg-orange-600 border-orange-500'
                                            : 'bg-gray-800 border-gray-700'
                                    }`}
                                    onPress={() => {
                                        handleExerciseSelect(originalIndex);
                                        setDays(28)
                                    }}
                                >
                                    <Text className={`text-lg font-bold ${
                                        isSelected ? 'text-white' : 'text-white'
                                    }`}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                </KeyboardAvoidingView>
            </Modal>

            <Text className="text-white text-xl font-bold mb-4">Personal Lifting Goal</Text>
            <View className="bg-zinc-800 rounded-xl p-4 items-center mb-8">
                <Text className="text-white text-base mb-1">Current Max: <Text
                    className="font-bold">{goal.currentMax}kg</Text></Text>
                <Text className="text-white text-base mb-2">Goal: <Text
                    className="font-bold">{goal.goal}kg</Text></Text>
                {goal.achieved && (
                    <Text className="text-emerald-400 font-bold mt-2">Goal Achieved! New goal set.</Text>
                )}
            </View>
        </ScrollView>
    );
};

export default ViewWorkouts;
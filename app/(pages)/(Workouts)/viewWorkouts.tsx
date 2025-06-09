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
    Button,
    TextInput
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import {collection, doc, documentId, FieldPath, getDoc, getDocs, query, setDoc, where} from "firebase/firestore";
import {db} from "@/config/firebase";
import {useAuth} from "@/context/AuthProvider";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';
import {set} from "@firebase/database";

const dummyProgressData = [
    {date: '2024-05-01', weight: 60},
    {date: '2024-05-15', weight: 62},
    {date: '2024-06-01', weight: 65},
];
const dummyGallery = [
    {uri: 'https://via.placeholder.com/120x160?text=Day+1', date: '2024-05-01'},
    {uri: 'https://via.placeholder.com/120x160?text=Day+30', date: '2024-06-01'},
];
const dummyGoal = {
    currentMax: 100,
    goal: 120,
    achieved: false,
};
// Dummy streak (replace with DB logic)
const dummyStreak = 7;

const chartData = {
    labels: dummyProgressData.map(d => d.date.slice(5)),
    datasets: [
        {
            data: dummyProgressData.map(d => d.weight),
            color: () => '#22d3ee',
            strokeWidth: 2,
        },
    ],
};

const screenWidth = Dimensions.get('window').width - 32;

const ViewWorkouts = () => {
    const [gallery, setGallery] = useState(dummyGallery);
    const [goal, setGoal] = useState(dummyGoal);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPic, setSelectedPic] = useState<{ uri: string; date: string } | null>(null);
    const [testChartData, setTestChartData] = useState(chartData);
    const [days, setDays] = useState<string | number>(30);
    const {userData} = useAuth();
    const GALLERY_KEY = 'progress_gallery';
    const scopeFilter = [{key: 1, label: "3 Months", value: 28*3}, {key: 2, label: "6 Months", value: 28*6}, {key: 3, label: "1 Year", value: 28*12}];

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
        // Sort by date to ensure proper chart ordering
        // chartData.sort((a, b) => a.date.localeCompare(b.date));

        for (const entry of atMax1RM) {
            const maxRef = doc(db, 'users', userData.userId, 'exerciseMaxes', entry.exerciseId);
            const maxSnap = await getDoc(maxRef);

            let dbMax = 0;
            if (maxSnap.exists()) {
                dbMax = maxSnap.data().max1RM || 0;
            }

            if (entry.max1RM > dbMax) {
                // Update Firestore with the new max1RM
                await setDoc(maxRef, {estimatedMax1RM: entry.max1RM}, {merge: true});
            }

            if (chartData.length > 0) {
                const newChartData = {
                    labels: chartData.map(d => {
                        // Format date for display (MM-DD)
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
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
        if (result.canceled) return;

        const uri = result.assets[0].uri;
        const fileName = uri.split('/').pop();
        if (!FileSystem.documentDirectory) {
            throw new Error('Document directory is not available');
        }
        const newPath = FileSystem.documentDirectory + fileName;

        await FileSystem.copyAsync({ from: uri, to: newPath });

        const newGallery = [
            ...gallery,
            { uri: newPath, date: new Date().toISOString() },
        ];
        setGallery(newGallery);
        saveGallery(newGallery);
    };

    const handleAchieveGoal = () => {
        // TODO: Integrate with DB and logic for new max
        setGoal({
            currentMax: goal.goal,
            goal: goal.goal + 10,
            achieved: true,
        });
    };

    const openModal = (pic: { uri: string; date: string }) => {
        setSelectedPic(pic);
        setModalVisible(true);
    };

    useEffect(() => {
        const daysNum = typeof days === 'string' ? parseInt(days) : days;
        if (!isNaN(daysNum) && daysNum > 0) {
            getChartData(daysNum, "sFtHfYh6UyXjd6Il8oma");
        }
        loadGallery();
    }, []);

    return (
        <ScrollView className="flex-1 bg-zinc-900 px-4 py-4">
            {/* Workout Streak Feature */}
            <View className="bg-accent-orange rounded-xl p-4 mb-6 items-center">
                <Text className="text-white text-lg font-bold">Workout Streak</Text>
                <Text className="text-3xl text-white font-extrabold mt-1">{dummyStreak} days</Text>
                <Text className="text-white text-xs mt-1">Keep it up!</Text>
            </View>
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold mb-4">Progress Chart</Text>
                {/*<TextInput*/}
                {/*    placeholder="Timeframe (days)"*/}
                {/*    className="bg-zinc-800 text-white rounded-lg px-3 py-2 w-fit"*/}
                {/*    keyboardType="numeric"*/}
                {/*    value={String(days)}*/}
                {/*    onChangeText={(text) => {*/}
                {/*        if (text === '') {*/}
                {/*            setDays('');*/}
                {/*        } else {*/}
                {/*            const num = parseInt(text);*/}
                {/*            if (!isNaN(num) && num > 0) {*/}
                {/*                setDays(num);*/}
                {/*                getChartData(num, "sFtHfYh6UyXjd6Il8oma");*/}
                {/*            }*/}
                {/*        }*/}
                {/*    }}*/}
                {/*/>*/}
                <View style={{ flex: 1, height: 50, backgroundColor: '#374151', borderRadius: 8, overflow: 'hidden' }}>
                    <Picker
                        selectedValue={days}
                        style={{ flex: 1, color: 'white', height: 50 }}
                        onValueChange={ (value) =>{
                            setDays(value)
                            getChartData(value, "sFtHfYh6UyXjd6Il8oma");

                        }}
                        itemStyle={{ height: 50, fontSize: 16 }}
                    >
                        <Picker.Item label="28 Days" value={28} />
                        {
                            scopeFilter.map(filter => (
                            <Picker.Item key={filter.key} label={filter.label} value={filter.value} />
                        ))}
                    </Picker>
                </View>
            </View>
            <View className="bg-zinc-800 rounded-xl p-4 mb-6">
                <LineChart
                    data={testChartData}
                    width={screenWidth}
                    height={180}
                    chartConfig={{
                        backgroundGradientFrom: '#18181b',
                        backgroundGradientTo: '#18181b',
                        color: () => '#FF5400', // Line color
                        labelColor: () => '#fff',
                        propsForDots: { r: '5', strokeWidth: '2', stroke: '#FF5400' }, // Dot color
                        propsForBackgroundLines: { stroke: '#334155' },
                    }}
                    style={{ borderRadius: 12 }}
                />
            </View>

            <Text className="text-white text-xl font-bold mb-4">Progress Gallery</Text>
            <ScrollView horizontal className="flex-row mb-6">
                {gallery.map((pic, idx) => (
                    <TouchableOpacity key={idx} className="items-center mr-4" onPress={() => openModal(pic)}>
                        <Image source={{ uri: pic.uri }} className="w-20 h-32 rounded-lg bg-zinc-700" />
                        <Text className="text-xs text-white mt-1">{pic.date}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    className="w-20 h-32 rounded-lg bg-accent-orange items-center justify-center"
                    onPress={handleUploadPicture}
                >
                    <Text className="text-white text-2xl">+</Text>
                    <Text className="text-white text-xs mt-1">Upload</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal for in-depth gallery view */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/80 justify-center items-center">
                    <View className="bg-zinc-900 rounded-xl p-4 items-center">
                        {selectedPic && (
                            <>
                                <Image source={{ uri: selectedPic.uri }} className="w-48 h-72 rounded-lg mb-4" />
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

            <Text className="text-white text-xl font-bold mb-4">Personal Lifting Goal</Text>
            <View className="bg-zinc-800 rounded-xl p-4 items-center mb-8">
                <Text className="text-white text-base mb-1">Current Max: <Text className="font-bold">{goal.currentMax}kg</Text></Text>
                <Text className="text-white text-base mb-2">Goal: <Text className="font-bold">{goal.goal}kg</Text></Text>
                {goal.achieved ? (
                    <Text className="text-emerald-400 font-bold mt-2">Goal Achieved! New goal set.</Text>
                ) : (
                    <TouchableOpacity
                        className="bg-accent-orange px-4 py-2 rounded-lg mt-2"
                        onPress={handleAchieveGoal}
                    >
                        <Text className="text-white font-semibold">Mark as Achieved</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Button title="test"
            onPress={ () => getChartData(30, "sFtHfYh6UyXjd6Il8oma")}/>
        </ScrollView>
    );
};

export default ViewWorkouts;
import { View } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, TabBar } from 'react-native-tab-view';
import { useWindowDimensions } from 'react-native';
import AddWorkout from '../(Workouts)/inputWorkouts';
import ViewWorkouts from '../(Workouts)/viewWorkouts';

export default function Workouts() {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'add' },
        { key: 'view' },
    ]);

    return (
        <SafeAreaView className="flex-1 bg-primary-background">
            <View className="flex-1">
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={({ route }) => {
                        switch (route.key) {
                            case 'add':
                                return <AddWorkout />;
                            case 'view':
                                return <ViewWorkouts isActive={index === 1} />;
                            default:
                                return null;
                        }
                    }}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    renderTabBar={ (props) => (<TabBar
                        {...props}
                        indicatorStyle={{ backgroundColor: '#FF5400' }}
                        style={{ backgroundColor: '#2D2E31', height: 2 }}
                        activeColor="bg-accent-orange"
                    />)}
                    style={{ backgroundColor: '#2D2E31' }}
                />
            </View>
        </SafeAreaView>
    );
}
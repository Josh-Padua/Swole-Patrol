import React, { useState, useRef } from 'react';
import {View, Text, Button, FlatList, ScrollView, TouchableOpacity} from 'react-native';


export default function StopwatchWithLaps() {
    const [isRunning, setIsRunning] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [millisecondsElapsed, setMillisecondsElapsed] = useState(0);
    const [laps, setLaps] = useState<string[]>([]);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const start = () => {
        if (!isRunning) {
            setIsRunning(true);
            intervalRef.current = setInterval(() => {
                setMillisecondsElapsed(prev => {
                    if (prev === 99) {
                        setSecondsElapsed(prevSec => prevSec + 1);
                        return 0;
                    }
                    return prev + 1;
                });
            }, 10); // Update every 10ms
        }
    };

    const stop = () => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const reset = () => {
        stop();
        setSecondsElapsed(0);
        setMillisecondsElapsed(0);
        setLaps([]);
    };

    const lap = () => {
        const currentTime = formatTime(secondsElapsed, millisecondsElapsed);
        setLaps(prevLaps => [...prevLaps, currentTime]);
    };
    //formats the time displayed
    const formatTime = (seconds: number, milliseconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        const ms = milliseconds.toString().padStart(2, '0');
        return `${mins}:${secs}:${ms}`;
    };

    return (
        <ScrollView className="flex-1 justify-center items-center p-5 bg-primary-background">
            <View className="justify-center items-center">
                <Text className="text-5xl mb-8 text-white font-lato-bold">
                    {formatTime(secondsElapsed, millisecondsElapsed)}
                </Text>
                <View className="flex-row gap-2.5 mb-5">
                    <TouchableOpacity onPress={isRunning ? stop : start} className="bg-accent-orange py-2 px-4 rounded-lg">
                        <Text className="text-white font-lato-semibold">{isRunning ? 'Pause' : 'Start'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={lap} disabled={!isRunning}
                                      className={`py-2 px-4 rounded-lg ${isRunning ? 'bg-white' : 'bg-accent-orange'}`}>
                        <Text className={`font-lato-semibold ${isRunning ? 'text-accent-orange' : 'text-white'}`}>LAP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={reset} className="bg-accent-orange py-2 px-4 rounded-lg">
                        <Text className="text-white font-lato-semibold">Reset</Text>
                    </TouchableOpacity>
                </View>
                {laps.length > 0 && (
                    <View className="mt-2.5 w-4/5">
                        <Text className="text-xl font-lato-bold mb-2.5 text-white">Laps:</Text>
                        <FlatList
                            data={laps}
                            renderItem={({ item, index }) => (
                                <Text className="font-lato text-2xl text-white">{index + 1}. {item}</Text>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            className="max-h-52"// Add a maxHeight to the FlatList
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

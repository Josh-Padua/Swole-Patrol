import React, { useState, useRef } from 'react';
import { View, Text, Button, FlatList, ScrollView } from 'react-native';

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

    const formatTime = (seconds: number, milliseconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        const ms = milliseconds.toString().padStart(2, '0');
        return `${mins}:${secs}:${ms}`;
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 48, marginBottom: 30 }}>
                    {formatTime(secondsElapsed, millisecondsElapsed)}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                    <Button title={isRunning ? 'Pause' : 'Start'} onPress={isRunning ? stop : start} />
                    <Button title="Lap" onPress={lap} disabled={!isRunning} />
                    <Button title="Reset" onPress={reset} />
                </View>
                {laps.length > 0 && (
                    <View style={{ marginTop: 20, width: '80%',  }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Laps:</Text>
                        <FlatList
                            data={laps}
                            renderItem={({ item, index }) => (
                                <Text style={{ fontSize: 24 }}>{index + 1}. {item}</Text>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            style={{ maxHeight: 200 }} // Add a maxHeight to the FlatList
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

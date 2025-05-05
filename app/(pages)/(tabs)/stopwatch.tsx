import React, { useState, useRef } from 'react';
import { View, Text, Button } from 'react-native';

export default function Stopwatch() {
    const [isRunning, setIsRunning] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [millisecondsElapsed, setMillisecondsElapsed] = useState(0);


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
    };

    const formatTime = (seconds: number, milliseconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        const ms = milliseconds.toString().padStart(2, '0');
        return `${mins}:${secs}:${ms}`;
    };

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
            <Text style={{fontSize: 48, marginBottom: 30}}>
                {formatTime(secondsElapsed, millisecondsElapsed)}
            </Text>
            <View style={{flexDirection: 'row', gap: 10}}>
                <Button title={isRunning ? 'Pause' : 'Start'} onPress={isRunning ? stop : start}/>
                <Button title="Reset" onPress={reset}/>
            </View>
        </View>
    );
}
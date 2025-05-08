import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';


type barConfig = {
    height:number;
    foregroundColor:string;
    backgroundColor:string;
};


const StatusBar = ({title, current, target, config}:{title:string, current:number, target: number, config:barConfig}) => {
    const [_current, setCurrent] = useState(current);
    const [_target, setTarget] = useState(target);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<TextInput>(null);


    const GOAL_COLORS = {
        COMPLETE: config.foregroundColor, // or '#02c73d',
        IN_PROGRESS: '#b8b8b8'
    }


    /**
     * External bindings
     */
    useEffect(() => {
        setCurrent(current);
        setTarget(target);
    }, [current, target]);


    const handlePress = () => {
        setIsEditing(true);

        // Set focus
        if (inputRef && inputRef.current)
            inputRef.current.focus();
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const handleChangeText = (text: string) => {
        const parsedValue = parseFloat(text);

        if (!isNaN(parsedValue))
            setTarget(parsedValue);
        else
            setTarget(0);
    };


    function getPercentage():number {
        let percentage:number = (_current > 0) ? (_current / _target) : 0;
        percentage = Math.max(0, percentage);   // Lower bounds
        percentage = Math.min(percentage, 1); // Upper bounds
        return percentage * 100;                // Scale
    }

    return (
        <View className={'my-2'}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Text className={'text-white text-base'}>{title}</Text>
                {isEditing ? (
                    <TextInput
                        ref={inputRef}
                        className={'text-white text-base'}
                        value={isNaN(_target) ? '' : _target.toString()} // Value is required to be string
                        onChangeText={handleChangeText}
                        keyboardType="numeric"
                        onBlur={handleBlur}
                    />
                ) : (
                    <TouchableOpacity onPress={handlePress}>
                        <Text style={{
                            color: ((getPercentage() > 99.9) ? GOAL_COLORS.COMPLETE : GOAL_COLORS.IN_PROGRESS),
                            fontSize: 16
                        }}>{_target}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={{
                backgroundColor: config.backgroundColor,
                borderRadius: (config.height / 2),
                height: config.height,
                overflow: 'hidden',
                width: '100%'
            }}>
                <View style={{
                    backgroundColor: config.foregroundColor,
                    height: config.height,
                    width: `${getPercentage()}%`
                }}>
                </View>
            </View>
        </View>
    );
};

export default StatusBar;
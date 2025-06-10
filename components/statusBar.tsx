import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, TextInput} from 'react-native';


type barConfig = {
    height:number;
    foregroundColor:string;
    backgroundColor:string;
};


const StatusBar = ({title, current, target, targetUpdateAction, config}:{title:string, current:number, target: number, targetUpdateAction:(newTarget:number) => void, config:barConfig}) => {
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

    /**
     * Editing event hook.
     * (This solves the timing issue when trying to focus on an element that doesn't yet exist)
     */
    useEffect(() => {
        if (isEditing && inputRef) {
            inputRef.current?.focus();
        }
    }, [isEditing]);


    const handlePress = () => {
        setIsEditing(true);
    };

    /**
     * Finished updating the target value.
     * This triggers the update target action.
     */
    const handleBlur = () => {
        setIsEditing(false);

        targetUpdateAction(_target);
    };

    /**
     * Updates the target value.
     * @param text input (number).
     */
    const handleChangeText = (text: string) => {
        const parsedValue = parseFloat(text);

        if (!isNaN(parsedValue))
            setTarget(parsedValue);
        else
            setTarget(0);
    };


    /**
     * Calculate percentage based of current (progress) and target (goal).
     */
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
                <View className={'flex-row'}>
                    <Text className={'text-white text-base'} style={{fontWeight: 500}}>{`${title}: `}</Text>
                    <Text className={'text-white text-base'}>{(Math.round(_current * 1000) / 1000)}</Text>
                </View>
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
                            fontSize: 16,
                            fontWeight: 500
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
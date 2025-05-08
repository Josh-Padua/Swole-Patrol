import React, {useEffect, useRef, useState} from 'react';
import { View, Text } from 'react-native';


type barConfig = {
    height:number;
    foregroundColor:string;
    backgroundColor:string;
};


const StatusBar = ({title, current, target, config}:{title:string, current:number, target: number, config:barConfig}) => {
    const [_current, setCurrent] = useState(current);
    const [_target, setTarget] = useState(target);

    /**
     * External bindings
     */
    useEffect(() => {
        setCurrent(current);
        setTarget(target);
    }, [current, target]);


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
                <Text className={'text-white text-base'}>{_target}</Text>
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
import {Text, TextInput, View} from "react-native";
import React, {useState} from "react";


export type PlateSet = {
  p20kg: number;
  p15kg: number;
  p10kg: number;
  p5kg: number;
};

export function calculateWeight(barWeight: number, plates: PlateSet):number|null {
    if (barWeight < 0) return null;
    for (const key in plates)
        if (plates[key as keyof PlateSet] < 0) return null;

    let totalPlatesWeight =
        plates.p20kg * 20 +
        plates.p15kg * 15 +
        plates.p10kg * 10 +
        plates.p5kg * 5;

    return barWeight + totalPlatesWeight * 2;
}

export function calculatePlates(barWeight: number, targetWeight:number):PlateSet|null {
    if (barWeight < 0) return null;
    if (targetWeight < 0) return null;

    var remainingWeight = targetWeight - barWeight;
    remainingWeight /= 2;

    const p20 = Math.floor(remainingWeight / 20);
    remainingWeight -= 20 * p20;
    const p15 = Math.floor(remainingWeight / 15);
    remainingWeight -= 15 * p15;
    const p10 = Math.floor(remainingWeight / 10);
    remainingWeight -= 10 * p10;
    const p5 = Math.floor(remainingWeight / 5);

    return {p20kg: p20, p15kg: p15, p10kg: p10, p5kg: p5};
}

export default function Calculator() {
    const barWeight = 20;
    const [output, setOutput] = useState('20kg: 0\n15kg: 0\n10kg: 0\n5kg: 0\n\n(Estimated)');

    const handleOnChange = (text: string)=> {
        if (parseInt(text) < 20) return;

        const result = calculatePlates(barWeight, parseInt(text));
        if (result == null) return;

        setOutput(`20kg: ${result.p20kg}\n15kg: ${result.p15kg}\n10kg: ${result.p10kg}\n5kg: ${result.p5kg}\n\n(Estimated)`);
    }

    return (
        <View className="items-center bg-primary-background h-full max-w-screen">
            <Text className={'text-white text-3xl m-10'}>Plate Calculator</Text>


            <View className={'bg-[#2D2E31] p-5 rounded-lg w-80 max-w-md mb-5'}>
                <TextInput
                    placeholder="Expected weight"
                    placeholderTextColor={'#757575'}
                    className={'text-white text-base'}
                    onChangeText={handleOnChange}
                    keyboardType="numeric"
                />
            </View>

            <View className={'bg-[#2D2E31] p-5 rounded-lg w-80 max-w-md mb-5'}>
                <Text className={'text-white font-bold text-2xl my-5'}>Plates</Text>
                <Text className={'text-white text-xl m-10'}>
                    {output}
                </Text>
            </View>
        </View>
    );
}
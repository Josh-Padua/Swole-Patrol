import {View} from "react-native";


export type PlateSet = {
  p20kg: number;
  p15kg: number;
  p10kg: number;
  p5kg: number;
};

export function calculateWeight(barWeight: number, plates: PlateSet):number|null {
    throw new Error("Not Implemented!");
}

export function calculatePlates(barWeight: number, targetWeight:number):PlateSet|null {
    throw new Error("Not Implemented!");
}

export default function Calculator() {

    return (
        <View className="items-center bg-primary-background h-full max-w-screen">
        </View>
    );
}
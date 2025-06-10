import {View} from "react-native";


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

    return (
        <View className="items-center bg-primary-background h-full max-w-screen">
        </View>
    );
}
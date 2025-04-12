import {Text, View} from "react-native";
import {Link} from "expo-router";

export default function Dashboard() {
    return (
        <View className="flex flex-col items-center">
            <Text>Test</Text>
            <Link href="/macros">macros</Link>
            <Link href="/macros">profile</Link>
            <Link href="/macros">settings</Link>
            <Link href="/macros">workout</Link>
        </View>
    )
}
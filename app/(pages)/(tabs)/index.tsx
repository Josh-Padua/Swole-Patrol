import {Text, View} from "react-native";
import {Link} from "expo-router";

export default function Index() {
    return (
        <View>
            <Text>Test</Text>
            <Link href="/(pages)/(tabs)/dashboard">dashboard</Link>
        </View>
    )
}
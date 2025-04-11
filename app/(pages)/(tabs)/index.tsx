import { useEffect } from "react";
import { Text, View } from "react-native";
import { Link, useRouter } from "expo-router";

export default function Index() {
    const router = useRouter();

    // Automatically redirect to /macros
    useEffect(() => {
        const timeout = setTimeout(() => {
            // Only navigate after initial mount
            router.replace("/(pages)/(tabs)/macros");
        }, 0); // Slight delay allows layout to mount

        return () => clearTimeout(timeout);
    }, []);

    return (
        <View>
            <Text>Redirecting to Macros...</Text>
            {/*<Link href="/(pages)/(tabs)/dashboard">Dashboard</Link>*/}
        </View>
    );
}
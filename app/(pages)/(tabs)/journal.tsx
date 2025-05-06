import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function JournalMain() {
    const router = useRouter();

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Journal</Text>
            <Button title="Add Entry" onPress={() => router.push('/(pages)/(journal)/addEntry')} />
            <View style={{ marginVertical: 10 }} />
            <Button title="View Previous Entries" onPress={() => router.push('/(pages)/(journal)/viewEntry')} />
        </View>
    );
}
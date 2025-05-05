import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { db } from '@/config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function AddEntry() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const router = useRouter();

    const handleSave = async () => {
        if (!title || !content) {
            Alert.alert('Error', 'Title and entry cannot be empty.');
            return;
        }

        try {
            await addDoc(collection(db, 'journalEntries'), {
                title,
                content,
                date: new Date(), // Save as real Date object (Timestamp in Firestore)
            });
            Alert.alert('Success', 'Entry saved!');
            setTitle('');
            setContent('');
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not save entry.');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 10 }}>Add Journal Entry</Text>
            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
            />
            <TextInput
                placeholder="Write your thoughts..."
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                style={{ borderWidth: 1, padding: 8, height: 120, marginBottom: 10 }}
            />
            <Button title="Save Entry" onPress={handleSave} />
        </View>
    );
}

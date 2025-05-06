import React, { useState } from 'react';
import {View, Text, TextInput, Button, Alert, Image, TouchableOpacity, SafeAreaView} from 'react-native';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
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
            const auth = getAuth(); // Get current Firebase Auth instance
            const user = auth.currentUser;

            if (!user) {
                Alert.alert('Error', 'User not logged in.');
                return;
            }

            await addDoc(collection(db, 'journalEntries'), {
                title,
                content,
                date: new Date(),
                uid: user.uid,
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
        <SafeAreaView className="bg-primary-background h-full">

            <Text className="font-lato-bold text-accent-orange">Add Journal Entry</Text>
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
        </SafeAreaView>
    );
}

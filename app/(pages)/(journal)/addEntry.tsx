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

            <Text className="font-lato-bold text-accent-orange text-center text-2xl mb-5">Add Journal Entry</Text>
            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                className="border border-gray-300 rounded-lg mb-4 text-base text-gray-300"
            />
            <TextInput
                placeholder="Write your thoughts..."
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                className="border border-gray-300 rounded-lg mb-4 text-base text-gray-300"
            />
            <TouchableOpacity onPress={handleSave}
                className="bg-accent-orange py-3 px-6 rounded-lg items-center">
                <Text className="font-lato text-white">Save Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}
                              className="bg-accent-orange py-3 ml-96 mr-96 px-6 rounded-lg items-center mt-5">
                <Text className="font-lato text-white">Return</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

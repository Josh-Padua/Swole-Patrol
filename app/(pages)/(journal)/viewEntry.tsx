import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, LayoutAnimation, UIManager, Platform, TextInput, SafeAreaView} from 'react-native';
import {collection, getDocs, deleteDoc, updateDoc, doc, onSnapshot} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { query, where } from 'firebase/firestore';
import { AntDesign } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {router} from "expo-router";

const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

export default function ViewEntries() {
    const [entries, setEntries] = useState<any[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<string>('');

    useEffect(() => {
        const auth = getAuth();
        if (!auth.currentUser) return;

        const q = query(collection(db, 'journalEntries'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const userEntries = snapshot.docs
                    .map((doc) => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            title: data.title ?? 'No Title',
                            content: data.content ?? 'No Content',
                            date: data.date?.toDate?.(),
                            uid: data.uid,
                        };
                    })
                    .filter((entry) => entry.uid === auth.currentUser?.uid)
                    .sort((a, b) => b.date - a.date); // Optional: sort by date

                setEntries(userEntries);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching entries:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId((prev) => (prev === id ? null : id));
        setEditingId(null);
    };

    const handleSaveEdit = async (id: string) => {
        try {
            await updateDoc(doc(db, 'journalEntries', id), { content: editContent });
            setEntries((prev) =>
                prev.map((e) => (e.id === id ? { ...e, content: editContent } : e))
            );
            setEditingId(null);
        } catch (error) {
            console.error('Error saving entry:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'journalEntries', id));
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    }

    return (
        <SafeAreaView className="h-full bg-primary-background">
        <ScrollView className="p-10">
            <Text className="text-2xl mb-5 text-white text-center">Previous Entries</Text>
            {entries.map((entry) => {
                const isExpanded = entry.id === expandedId;
                const isEditing = entry.id === editingId;

                return (
                    <View
                        key={entry.id}
                        className="mb-3.5 border-b border-b-white pb-1.5"
                    >
                        <TouchableOpacity
                            onPress={() => toggleExpand(entry.id)}
                            className="flex-row justify-between items-center"
                        >
                            <View>
                                <Text className="font-lato-bold text-xl text-accent-orange">{entry.title}</Text>
                                <Text className="text-white">
                                    {entry.date ? formatDate(entry.date) : 'No Date'}
                                </Text>
                            </View>
                            <AntDesign name={isExpanded ? 'up' : 'down'} size={20} color="#333" />
                        </TouchableOpacity>

                        {isExpanded && (
                            <View className="mt-2.5">
                                {isEditing ? (
                                    <>
                                        <TextInput
                                            multiline
                                            value={editContent}
                                            onChangeText={setEditContent}
                                            className="border-1 rounded-md p-2.5 min-h-20 align-text-top bg-white mb-2.5"
                                        />
                                        <View className="flex-row gap-4">
                                            <TouchableOpacity onPress={() => handleSaveEdit(entry.id)}>
                                                <Text className="text-accent-green font-lato">Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setEditingId(null)}>
                                                <Text className="text-red-500 font-lato">Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-white font-lato">{entry.content}</Text>
                                        <View className="flex-row gap-4 mt-2.5">
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setEditingId(entry.id);
                                                    setEditContent(entry.content);
                                                }}
                                            >
                                                <Ionicons name="create-outline" size={20} color="#63ca53"/>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDelete(entry.id)}>
                                                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                );
            })}
            <TouchableOpacity onPress={() => router.back()}
                              className="bg-accent-orange py-3 ml-96 mr-96 px-6 rounded-lg items-center mt-5">
                <Text className="font-lato text-white">Return</Text>
            </TouchableOpacity>
        </ScrollView>
        </SafeAreaView>
    );
}
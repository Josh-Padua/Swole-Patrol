import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, LayoutAnimation, UIManager, Platform, TextInput} from 'react-native';
import {collection, getDocs, deleteDoc, updateDoc, doc, onSnapshot} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { query, where } from 'firebase/firestore';
import { AntDesign } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
        <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Previous Entries</Text>
            {entries.map((entry) => {
                const isExpanded = entry.id === expandedId;
                const isEditing = entry.id === editingId;

                return (
                    <View
                        key={entry.id}
                        style={{
                            marginBottom: 15,
                            borderBottomWidth: 1,
                            borderBottomColor: '#ccc',
                            paddingBottom: isExpanded ? 15 : 10,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => toggleExpand(entry.id)}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <View>
                                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{entry.title}</Text>
                                <Text style={{ color: '#666' }}>
                                    {entry.date ? formatDate(entry.date) : 'No Date'}
                                </Text>
                            </View>
                            <AntDesign name={isExpanded ? 'up' : 'down'} size={20} color="#333" />
                        </TouchableOpacity>

                        {isExpanded && (
                            <View style={{ marginTop: 10 }}>
                                {isEditing ? (
                                    <>
                                        <TextInput
                                            multiline
                                            value={editContent}
                                            onChangeText={setEditContent}
                                            style={{
                                                borderColor: '#ccc',
                                                borderWidth: 1,
                                                borderRadius: 6,
                                                padding: 10,
                                                minHeight: 80,
                                                textAlignVertical: 'top',
                                                backgroundColor: '#fff',
                                                marginBottom: 10,
                                            }}
                                        />
                                        <View style={{ flexDirection: 'row', gap: 16 }}>
                                            <TouchableOpacity onPress={() => handleSaveEdit(entry.id)}>
                                                <Text style={{ color: 'green', fontWeight: '600' }}>Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setEditingId(null)}>
                                                <Text style={{ color: 'gray', fontWeight: '600' }}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <Text style={{ color: '#444', lineHeight: 20 }}>{entry.content}</Text>
                                        <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setEditingId(entry.id);
                                                    setEditContent(entry.content);
                                                }}
                                            >
                                                <Ionicons name="create-outline" size={20} color="#007AFF" />
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
        </ScrollView>
    );
}
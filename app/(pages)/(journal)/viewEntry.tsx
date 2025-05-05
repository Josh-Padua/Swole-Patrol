import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AntDesign } from '@expo/vector-icons'; // arrow icon

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ViewEntries() {
    const [entries, setEntries] = useState<any[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'journalEntries'));
                const data = snapshot.docs.map((doc) => {
                    const entry = doc.data();
                    return {
                        id: doc.id,
                        title: entry.title ?? 'No Title',
                        content: entry.content ?? 'No Content',
                        date: entry.date?.toDate?.(),
                    };
                });

                const sorted = data.sort((a, b) => b.date - a.date);
                setEntries(sorted);
            } catch (error) {
                console.error('Error fetching journal entries:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, []);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(prev => (prev === id ? null : id));
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    }

    return (
        <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Previous Entries</Text>
            {entries.map((entry) => {
                const isExpanded = entry.id === expandedId;

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
                            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <View>
                                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{entry.title}</Text>
                                <Text style={{ color: '#666' }}>
                                    {entry.date ? entry.date.toLocaleDateString() : 'No Date'}
                                </Text>
                            </View>
                            <AntDesign name={isExpanded ? 'up' : 'down'} size={20} color="#333" />
                        </TouchableOpacity>

                        {isExpanded && (
                            <Text style={{ marginTop: 10, color: '#444', lineHeight: 20 }}>
                                {entry.content}
                            </Text>
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );
}

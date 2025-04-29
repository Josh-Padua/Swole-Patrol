import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function ViewEntries() {
    const [entries, setEntries] = useState<any[]>([]); // specify `any[]` or better type later
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'journalEntries'));
                const data = snapshot.docs.map((doc) => {
                    const entry = doc.data();
                    return {
                        id: doc.id,
                        title: entry.title ?? 'No Title', // handle missing title
                        date: entry.date ?? 'No Date',     // handle missing date
                    };
                });
                setEntries(data);
            } catch (error) {
                console.error('Error fetching journal entries:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    }

    return (
        <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Previous Entries</Text>
            {entries.map((entry) => (
                <View key={entry.id} style={{ marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{entry.title}</Text>
                    <Text style={{ color: '#666' }}>{entry.date}</Text>
                </View>
            ))}
        </ScrollView>
    );
}

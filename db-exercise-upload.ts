import { writeBatch, collection, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import exercises from '@/exercises.json';

export const uploadExercises = async () => {
    const batch = writeBatch(db);
    const exercisesRef = collection(db, 'exercises');

    exercises.forEach((exercise) => {
        const docRef = doc(exercisesRef);
        batch.set(docRef, {
            ...exercise,
            isCustom: false
        });
    });

    await batch.commit();
};
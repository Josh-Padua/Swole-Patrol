import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

import Index from '../index';


// Mock Firebase & Firestore
jest.mock('@/config/firebase', () => ({
    db: {},
}));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        currentUser: { uid: 'test-user' }, // mock authenticated user
    })),
}));
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn().mockResolvedValue({ docs: [] }),
    addDoc: jest.fn().mockResolvedValue({ id: '123' }),
    where: jest.fn(),
    query: jest.fn(),
}));


// Mock expo-router
jest.mock('expo-router', () => {
    const React = require('react');

    return {
        useFocusEffect: (callback) => {
            React.useEffect(() => {
                const cleanup = callback();
                return cleanup;
            }, []);
        },
        useRouter: () => ({ push: jest.fn() }),
        useNavigation: () => ({ navigate: jest.fn() }),
        router: { push: jest.fn() },
        Link: ({ children }) => children,
    };
});


describe('Dashboard', () => {
    it('renders without crashing', () => {
        render(
            <NavigationContainer>
                <Index />
            </NavigationContainer>
        );
    });
});
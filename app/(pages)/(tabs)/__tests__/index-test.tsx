import React from 'react';
import { render } from '@testing-library/react-native';
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

describe('Dashboard', () => {
    it('renders without crashing', () => {
        render(<Index />);
    });
});
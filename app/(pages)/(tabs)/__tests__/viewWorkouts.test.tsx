import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import ViewWorkouts from '@/app/(pages)/(Workouts)/viewWorkouts';

// Mock Firebase & Firestore
jest.mock('@/config/firebase', () => ({
    db: {},
}));
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    getDocs: jest.fn().mockResolvedValue({docs: []}),
    getDoc: jest.fn().mockResolvedValue({exists: () => false, data: () => ({})}),
    setDoc: jest.fn(),
    doc: jest.fn(),
    where: jest.fn(),
    query: jest.fn(),
    documentId: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        currentUser: {uid: 'test-user'},
    })),
}));
jest.mock('@/context/AuthProvider', () => ({
    useAuth: () => ({userData: {userId: 'test-user'}}),
}));
jest.mock('expo-router', () => {
    const React = require('react');
    return {
        useFocusEffect: (callback) => {
            React.useEffect(() => {
                const cleanup = callback();
                return cleanup;
            }, []);
        },
        useRouter: () => ({push: jest.fn()}),
        useNavigation: () => ({navigate: jest.fn()}),
        router: {push: jest.fn()},
        Link: ({children}) => children,
    };
});
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));
jest.mock('expo-image-picker', () => ({
    Image: ({source, style}) => <img src={source} alt="" style={style} />,
}));
jest.mock('@expo/vector-icons', () => ({
    AntDesign: ({name, size, color}) => <i className={`${name} ${size} ${color}`} />,
    MaterialIcons: ({name, size, color}) => <i className={`${name} ${size} ${color}`} />,
}));

// Test suite for the ViewWorkouts component's static UI rendering
describe('ViewWorkouts', () => {
    // Checks if the Workout Streak header is rendered
    it('renders the Workout Streak header', async () => {
        const { findByText } = render(<ViewWorkouts isActive={true} />);
        expect(await findByText('Workout Streak')).toBeTruthy();
    });
    // Checks if the Progress Chart section header is rendered
    it('renders the Progress Chart section', () => {
        const { getByText } = render(<ViewWorkouts isActive={true} />);
        expect(getByText('Progress Chart')).toBeTruthy();
    });
    // Checks if the Progress Gallery section header is rendered
    it('renders the Progress Gallery section', () => {
        const { getByText } = render(<ViewWorkouts isActive={true} />);
        expect(getByText('Progress Gallery')).toBeTruthy();
    });
    // Checks if the Personal Lifting Goal section header is rendered
    it('renders the Personal Lifting Goal section', () => {
        const { getByText } = render(<ViewWorkouts isActive={true} />);
        expect(getByText('Personal Lifting Goal')).toBeTruthy();
    });
    // Checks if the Upload button and "+" icon are rendered in the gallery
    it('renders the Upload button in gallery', () => {
        const { getByText } = render(<ViewWorkouts isActive={true} />);
        expect(getByText('+')).toBeTruthy();
        expect(getByText('Upload')).toBeTruthy();
    });
    // Checks if the Select Exercise button is rendered
    it('renders Select Exercise button', () => {
        const { getByText } = render(<ViewWorkouts isActive={true} />);
        expect(getByText('Select Exercise')).toBeTruthy();
    });
    // Checks if the chart placeholder text is shown when no exercise is selected
    it('renders the chart placeholder text if no exercise is selected', () => {
        const { getByText } = render(<ViewWorkouts isActive={true} />);
        expect(getByText('Select an exercise to view progress chart')).toBeTruthy();
    });
    // Checks if the search input appears when the exercise modal is opened
    it('renders the search input in exercise modal when opened', () => {
        const { getByText, getByPlaceholderText } = render(<ViewWorkouts isActive={true} />);
        fireEvent.press(getByText('Select Exercise'));
        expect(getByPlaceholderText('Search exercises...')).toBeTruthy();
    });
    // Checks if the "Current Max" and "Goal" labels are rendered in the goal section
    it('renders the "Current Max" and "Goal" labels in goal section', () => {
        const { getByText } = render(<ViewWorkouts isActive={true} />);
        expect(getByText(/Current Max:/i)).toBeTruthy();
        expect(getByText(/Goal:/i)).toBeTruthy();
    });
});
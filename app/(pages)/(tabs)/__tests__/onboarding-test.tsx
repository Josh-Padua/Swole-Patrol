import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Onboarding from '@/app/(pages)/(onboarding)/onboarding';
import { Alert } from 'react-native'

jest.mock('expo-router', () => ({
    router: {
        push: jest.fn()
    }
}))

jest.mock('@/config/firebase', () => ({
    auth: {
        currentUser: { uid: 'test-user-id' }
    },
    db: {}
}))

jest.mock('@react-native-picker/picker', () => {
    const MockPicker = ({ children }) => null;
    MockPicker.Item = ({ label, value }) => null;
    return { Picker: MockPicker };
})

describe('Onboarding Screen Text Content', () => {
    it('displays header', () => {
        const { getByText } = render(<Onboarding />);

        expect(getByText("Let's get to know you better!")).toBeTruthy();
    })

    it('displays all onboarding components', () => {
        const { getByText } = render(<Onboarding />);

        const expectedTexts = [
            "What username would you like others to call you by?",
            "How old are you?",
            "What's your gender?",
            "What's your Height?",
            "What's your current weight in kilograms?",
            "Continue"
        ];

        expectedTexts.forEach(text => {
            expect(getByText(text)).toBeTruthy();
        });
    })

    it('shows alert when continue is pressed with empty fields', () => {
        const { getByText } = render(<Onboarding />);
        const alertMock = jest.spyOn(Alert, 'alert').mockImplementation();

        const continueButton = getByText('Continue');
        fireEvent.press(continueButton);
        expect(alertMock).toHaveBeenCalledWith('Please fill in all fields.');

        alertMock.mockRestore();
    })
});

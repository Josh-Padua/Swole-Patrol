import React from 'react';
import { render } from '@testing-library/react-native';
import Index from '../index';

describe('Dashboard', () => {
    it('renders without crashing', () => {
        render(<Index />);
    });
});
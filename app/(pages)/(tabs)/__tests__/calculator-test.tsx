import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

import Index from '../index';
import {calculatePlates, calculateWeight, PlateSet} from "../calculator";


describe('Plate Calculator', () => {
    const barWeight:number = 20;

    describe('calculateWeight', () => {
        it('should ignore negative plate amounts', () => {
            const result = calculateWeight(barWeight, {
                p20kg: -1,
                p15kg: 0,
                p10kg: 0,
                p5kg: 1
            });

            expect(result).toBe(null);
        });

        it('should calculate weight correctly', () => {
            const result = calculateWeight(barWeight, {
                p20kg: 2,
                p15kg: 2,
                p10kg: 0,
                p5kg: 1
            });

            expect(result).toBe(170); // 2*(40+30+5)+20
        });
    });

    describe('calculatePlates', () => {
        it('should ignore negative target weights', () => {
            const result = calculatePlates(barWeight, -5);

            expect(result).toBe(null);
        });

        it('should calculate the plate set correctly', () => {
            const result = calculatePlates(barWeight, (25 + 20 + 25));

            expect(result).toBe({
                p20kg: 1,
                p15kg: 0,
                p10kg: 0,
                p5kg: 1
            });
        });
    });
});
import {View, Text, TouchableOpacity} from 'react-native'
import React, { useState, useEffect } from 'react'
import {useStripe} from '@stripe/stripe-react-native';


const Checkout = () => {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const API_URL = 'http://10.0.2.2:3000'
    const fetchPaymentSheetParams = async () => {
        const response = await fetch(`${API_URL}/payment-sheet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const {paymentIntent, ephemeralKey, customer} = await response.json();

        return {
            paymentIntent,
            ephemeralKey,
            customer,
        };
    };

    const initializePaymentSheet = async () => {
        const {
            paymentIntent,
            ephemeralKey,
            customer,
        } = await fetchPaymentSheetParams();

        const { error } = await initPaymentSheet({
            merchantDisplayName: "Example, Inc.",
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,
            allowsDelayedPaymentMethods: true,
            defaultBillingDetails: {
                name: 'John Doe',
            }
        });
        if (!error) {
            setLoading(true);
        }
    };

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            console.error(`Error code: ${error.code}`);
        } else {
            console.error('Success, your order is confirmed!');
        }
        // to be implemented
    }

    useEffect(() => {
        initializePaymentSheet();
    }, []);

    return (
        <TouchableOpacity
            onPress={openPaymentSheet}
            disabled={!loading}
            className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-4"
        >
            <Text className="text-white font-lato-bold">
                Subscribe Now
            </Text>
        </TouchableOpacity>
    )

}
export default Checkout

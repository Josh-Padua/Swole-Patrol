import {View, Text, TouchableOpacity, Alert} from 'react-native'
import React, {useEffect, useState} from 'react'
import {PaymentSheetError, useStripe} from '@stripe/stripe-react-native';
import { fetchAPI } from "@/lib/fetch";
import * as Linking from 'expo-linking';

const Checkout = () => {
    const {initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const initializePaymentSheet = async () => {

        const { error } = await initPaymentSheet({
            merchantDisplayName: "Swole Patrol",

            intentConfiguration: {
                mode: {
                    amount: 599,
                    currencyCode: 'nzd',
                },
                confirmHandler: async (
                    paymentMethod,
                    shouldSavePaymentMethod,
                    intentCreationCallback,
                ) => {
                    const { paymentIntent, customer } = await fetchAPI("/api/(stripe)/create", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: fullName || email.split('@')[0],
                            email: email,
                        })
                    })

                    if (paymentIntent.client_secret) {
                        intentCreationCallback({ clientSecret: paymentIntent.client_secret });
                    }

                },
            },
        });
        if (error) {
            setLoading(true);
            // handle error
        }
    };

    useEffect(() => {
        initializePaymentSheet();
    }, [])

    const openPaymentSheet = async () => {

        const { error } = await presentPaymentSheet();

        if (error) {
            if (error.code === PaymentSheetError.Canceled) {
                Alert.alert(`Error code: ${error.code}`, error.message);
            }
        } else {
            setSuccess(true);
            // Payment completed - show a confirmation screen.
        }
    }

    return (
        <TouchableOpacity
            onPress={openPaymentSheet}
            className="bg-accent-orange py-3 px-6 rounded-lg items-center mt-4"
        >
            <Text className="text-white font-lato-bold">
                Subscribe Now
            </Text>
        </TouchableOpacity>
    )
}
export default Checkout
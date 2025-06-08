import {View, Text, TouchableOpacity, Alert} from 'react-native'
import React, {useState} from 'react'
import {PaymentSheetError, useStripe} from '@stripe/stripe-react-native';

const Checkout = () => {
    const {initPaymentSheet, presentPaymentSheet } = useStripe();
    const [success, setSuccess] = useState(false);

    const confirmHandler = async (paymentMethod, intentCreationCallback) => {
        // Make a request to server
        const { paymentIntent, customer } = await fetchAPI('/(api)/(stripe)/create', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentMethodId: paymentMethod.id,
                amount: 599,
                currency: 'nzd',
                customer_name: paymentMethod.billing_details?.name || '',
                customer_email: paymentMethod.billing_details?.email || '',
            }),
            },
        )

        if (paymentIntent.client_secret) {
            const { result } = await fetchAPI('/(api)/(stripe)/pay', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_method_id: paymentMethod.id,
                    payment_intent_id: paymentIntent.id,
                    customer_id: customer,
                }),
            })
            if(result.client_secret) {

            }
        }

        const { clientSecret, error } = await response.json();
        if (clientSecret) {
            intentCreationCallback({clientSecret})
        } else {
            intentCreationCallback({error})
        }
    }

    const initializePaymentSheet = async () => {
        const { error } = await initPaymentSheet({
            merchantDisplayName: "Example, Inc.",
            intentConfiguration: {
                mode: {
                    amount: 599,
                    currencyCode: 'nzd',
                },
                confirmHandler: confirmHandler,
            }
        });
        if (error) {
            // handle error
        }
    };

    const openPaymentSheet = async () => {
        await initializePaymentSheet();

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
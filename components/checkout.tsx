import {View, Text, TouchableOpacity, Alert} from 'react-native'
import React, {useEffect, useState} from 'react'
import {PaymentSheetError, useStripe} from '@stripe/stripe-react-native';
import * as Linking from "expo-linking";

async function fetchPaymentSheetParams(): Promise<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
}> {
    return fetch(`/api/(stripe)/create`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => response.json())
}

const Checkout = () => {
    const {initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);

    // const confirmHandler = async (paymentMethod, intentCreationCallback) => {

    const initializePaymentSheet = async () => {
        const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();

        const { error } = await initPaymentSheet({
            merchantDisplayName: "Swole Patrol",

            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,

            allowsDelayedPaymentMethods: true,
            defaultBillingDetails: {
                name: "John Doe",
                email: "johndoe@test.com",
                phone: "888-888-8888"
            },
            returnURL: Linking.createURL("stripe-redirect"),
    });
        if (!error) {
            setLoading(true);
        }
    }

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();
        if (error) {

        } else {
            Alert.alert("Success", "Your payment was successful!");
        }
    };

    useEffect(() => {
        initializePaymentSheet();
    }, []);

    //     // Make a request to server
    //     const { paymentIntent, customer } = await fetchAPI('/api/(stripe)/create', {
    //         method: "POST",
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             paymentMethodId: paymentMethod.id,
    //             amount: 599,
    //             currency: 'nzd',
    //             name: paymentMethod.billing_details?.name || '',
    //             email: paymentMethod.billing_details?.email || '',
    //         }),
    //         },
    //     )
    //
    //     if (paymentIntent.client_secret) {
    //         const { result } = await fetchAPI('/api/(stripe)/pay', {
    //             method: "POST",
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 payment_method_id: paymentMethod.id,
    //                 payment_intent_id: paymentIntent.id,
    //                 customer_id: customer,
    //                 client_secret: paymentIntent.client_secret,
    //             }),
    //         })
    //     }
    //
    //     const { clientSecret, error } = await response.json();
    //     if (clientSecret) {
    //         intentCreationCallback({clientSecret})
    //     } else {
    //         intentCreationCallback({error})
    //     }
    // }

    // const initializePaymentSheet = async () => {
    //     const { error } = await initPaymentSheet({
    //         merchantDisplayName: "Swole Patrol",
    //         intentConfiguration: {
    //             mode: {
    //                 amount: 599,
    //                 currencyCode: 'nzd',
    //             },
    //             confirmHandler: async (
    //                 paymentMethod,
    //                 shouldSavePaymentMethod,
    //                 intentCreationCallback,
    //             ) => {
    //                 const { paymentIntent, customer } = await fetchAPI("/api/(stripe)/create", {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                     },
    //                     body: JSON.stringify({
    //                         name: fullName || email.split('@')[0],
    //                         email: email,
    //                     })
    //                 })
    //
    //                 if (paymentIntent.client_secret) {
    //                     intentCreationCallback({ clientSecret: paymentIntent.client_secret });
    //                 }
    //
    //                 // if (paymentIntent.client_secret) {
    //                 //     const { result } = await fetchAPI("/api/(stripe)/pay", {
    //                 //         method: "POST",
    //                 //         headers: {
    //                 //             "Content-Type": "application/json",
    //                 //         },
    //                 //         body: JSON.stringify({
    //                 //             payment_method_id: paymentMethod.id,
    //                 //             payment_intent_id: paymentIntent.id,
    //                 //             customer_id: customer,
    //                 //             client_secret: paymentIntent.client_secret,
    //                 //         })
    //                 //     })
    //                 //
    //                 //     if (result.client_secret) {
    //                 //         // logic to add verified mark to customer in firebase
    //                 //
    //                 //         // intentCreationCallback({ clientSecret: result.client_secret });
    //                 //         setSuccess(true);
    //                 //     }
    //                 // }
    //             },
    //         },
    //         returnURL: "myapp://premium",
    //     });
    //     if (error) {
    //         // handle error
    //     }
    // };

    useEffect(() => {
        initializePaymentSheet();
    }, [])

    // const confirmHandler = async (
    //     paymentMethod: PaymentMethod.Result,
    //     shouldSavePaymentMethod: boolean,
    //     intentCreationCallback: (params: IntentCreationCallbackParams) => void
    // )=> {
    //     const response = await fetch('/api/(stripe)/create', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         }
    //     });
    //     const { client_secret, error } = await response.json();
    //     if (client_secret) {
    //         intentCreationCallback({clientSecret: client_secret});
    //     } else {
    //         intentCreationCallback({error});
    //     }
    // }

    // const openPaymentSheet = async () => {
    //
    //     const { error } = await presentPaymentSheet();
    //
    //     if (error) {
    //         if (error.code === PaymentSheetError.Canceled) {
    //             Alert.alert(`Error code: ${error.code}`, error.message);
    //         }
    //     } else {
    //         setSuccess(true);
    //         // Payment completed - show a confirmation screen.
    //     }
    // }

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
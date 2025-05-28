import {View, Text, SafeAreaView} from 'react-native'
import React from 'react'
import {StripeProvider} from "@stripe/stripe-react-native";

const Premium = () => {

    return (
        <StripeProvider
         publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}>
        <SafeAreaView className="flex-col items-center justify-center">
            <Text>Premium</Text>
        </SafeAreaView>
        </StripeProvider>
    )
}
export default Premium

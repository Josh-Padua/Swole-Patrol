import {View, Text, SafeAreaView} from 'react-native'
import React from 'react'
import { StripeProvider } from "@stripe/stripe-react-native";
import Checkout from "@/components/checkout";


const Premium = () => {

    return (
        <StripeProvider
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
        >
            <SafeAreaView className="flex-1 items-center justify-center bg-primary-background">
                <Text className="text-white text-xl mb-4">Premium Subscription</Text>
                <Checkout
                    fullName={"test test"}
                    email={"test@test.com"}
                />
            </SafeAreaView>
        </StripeProvider>
    )
}
export default Premium

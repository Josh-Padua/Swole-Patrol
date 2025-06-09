import {View, Text, SafeAreaView, FlatList} from 'react-native'
import React from 'react'
import {StripeProvider} from "@stripe/stripe-react-native";
import Checkout from "@/components/checkout";

const Premium = () => {

    const benefits = [
        { id: '1', title: 'Personalized Workout Plans'},
        { id: '2', title: 'Advanced Progress Tracking'},
        { id: '3', title: 'Exclusive Workout library + meal database'},
        { id: '4', title: 'Investing in what matters. You.'}
    ]

    return (
        <StripeProvider
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        >
            <SafeAreaView className="flex-1 bg-primary-background justify-center">
                <View className="flex-1 px-4 pt-8 mt-20">
                <Text className="font-lato-bold text-4xl text-white text-center mb-2">Unlock your Full Potential.</Text>
                <Text className="font-lato text-white text-center mb-6">Take your fitness journey to another level with premium</Text>
                <Text className="font-lato-semibold text-2xl text-white mb-4 text-center">Why upgrade?</Text>
                <FlatList
                    data={benefits}
                    keyExtractor={(item) => item.id}
                    className="mb-6"
                    renderItem={({item}) => (
                        <View className="flex-row items-center mb-3 px-2">
                            <Text className="text-accent-orange text-lg mr-2">•</Text>
                            <Text className="text-white font-lato text-base flex-1">
                                {item.title}
                            </Text>
                        </View>
                    )}
                />
                    <View className="mb-5">
                        <Checkout/>
                    </View>
                </View>
            </SafeAreaView>
        </StripeProvider>
    )
}
export default Premium

import {View, Text, Button} from 'react-native'
import React from 'react'
import {StripeProvider} from "@stripe/stripe-react-native";

const Premium = () => {
    return (
        // <StripeProvider
        //     publishableKey="pk_test_51RQlsXKijzDpd6MyVB4Sg0wBvcyAq5lDOIPsT7tIQ42wkt5l2mqGVIkF4MptDq9OwIfOyinmV48GE9hr5hfcY6tP00x2RYsqOo"
        // >
        <View>
            <Button title={'Purchase'}/>
        </View>
        // </StripeProvider>
    )
}
export default Premium

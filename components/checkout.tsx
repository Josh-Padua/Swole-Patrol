import {View, Text} from 'react-native'
import React from 'react'

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
        <Screen>
            <Button
                variant="primary"
                disabled={!loading}
                title="Checkout"
                onPress={openPaymentSheet}
            />
        </Screen>
    )

}
export default Checkout

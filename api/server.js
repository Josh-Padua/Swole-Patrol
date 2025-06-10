const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
app.post('/payment-sheet', async (req, res) => {
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
        {customer: customer.id},
        {apiVersion: '2025-04-30.basil'}
    );
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 599,
        currency: 'nzd',
        customer: customer.id,
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
    });
});

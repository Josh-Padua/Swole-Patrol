import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
    appInfo: {
        name: "Swole-Patrol",
    },
});

export async function POST(request: Request) {
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2025-04-30.basil" }
    )

    const paymentIntent = await stripe.paymentIntents.create({
        amount: 599,
        currency: 'nzd',
        customer: customer.id,
        automatic_payment_methods: {
            enabled: true,
        },
    });

    return Response.json({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    })
};
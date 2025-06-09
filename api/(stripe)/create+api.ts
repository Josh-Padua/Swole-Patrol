import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
    appInfo: {
        name: "Swole Patrol",
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

    // const body = await request.json();
    // const { name, email } = body;
    //
    // if (!name || !email) {
    //     return new Response(
    //         JSON.stringify({ error: "Missing required fields",}), {
    //             status: 400,
    //         });
    // }
    //
    // let customer;
    // const existingCustomer = await stripe.customers.list({ email });
    //
    // if (existingCustomer.data.length > 0) {
    //     customer = existingCustomer.data[0];
    // } else {
    //     const newCustomer = await stripe.customers.create({
    //         name,
    //         email,
    //     });
    //
    //     customer = newCustomer;
    // }
    // const ephemeralKey = await stripe.ephemeralKeys.create(
    //     {customer: customer.id},
    //     {apiVersion: '2020-08-27'},
    // );
    // const paymentIntent = await stripe.paymentIntents.create({
    //     amount: 599,
    //     currency: 'nzd',
    //     customer: customer.id,
    //     automatic_payment_methods: {
    //         enabled: true,
    //         allow_redirects: "never",
    //     },
    // });
    //
    // return Response.json({
    //     paymentIntent: paymentIntent.client_secret,
    //     ephemeralKey: ephemeralKey.secret,
    //     customer: customer.id,
    //     publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    // })
    //
    // return new Response (
    //     JSON.stringify({
    //     paymentIntent: paymentIntent,
    //     ephemeralKey: ephemeralKey,
    //     customer: customer.id,
    //     }),
    // );
};
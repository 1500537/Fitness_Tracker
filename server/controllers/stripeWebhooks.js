import stripe from "stripe";
import User from "../models/userModal.js";

// API to create Stripe checkout session
export const createCheckoutSession = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('User object:', req.user);
        
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const { planId, planName, price, billingCycle } = req.body;
        const userId = req.user._id;

        console.log('Extracted data:', { planId, planName, price, billingCycle, userId });

        if (price === 0) {
            // Free plan - update directly
            const updatedUser = await User.findByIdAndUpdate(
                userId, 
                { pricing: planName.toLowerCase() }, // Convert to lowercase
                { new: true }
            );
            console.log(`✅ Free plan updated: User ${userId} pricing set to ${updatedUser?.pricing}`);
            return res.json({ success: true, message: 'Plan updated successfully', shouldRefresh: true });
        }

        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${planName.toUpperCase()} Plan`,
                        description: `${billingCycle} subscription`
                    },
                    unit_amount: price * 100, // Convert to cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/dashboard?success=true&plan=${planName}`,
            cancel_url: `${process.env.CLIENT_URL}/pricing`,
            metadata: {
                userId: userId.toString(),
                planName: planName.toString(),
                billingCycle: billingCycle.toString()
            }
        });
        
        console.log('🚀 Checkout session created:', session.id);
        console.log('📋 Session metadata:', session.metadata);

        res.json({ success: true, url: session.url });
    } catch (error) {
        console.error('Stripe session error:', error);
        res.status(500).json({ success: false, message: 'Payment setup failed', error: error.message });
    }
};

// API to handle stripe WebHooks
export const stripeWebhooks = async (request, response) => {
    console.log('🔔 Webhook received!');
    console.log('📋 Headers:', request.headers);
    
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('✅ Webhook verified successfully');
        console.log('📦 Event type:', event.type);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "payment_intent.succeeded") {
        console.log('💳 Payment intent succeeded!');
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        console.log('🆔 Payment Intent ID:', paymentIntentId);

        try {
            // Getting session from payment intent
            const sessions = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });
            
            console.log('📊 Found sessions:', sessions.data.length);

            if (sessions.data.length > 0) {
                const sessionData = sessions.data[0];
                const { userId, planName } = sessionData.metadata;
                
                console.log(`💳 Processing payment for user ${userId}, plan: ${planName}`);
                console.log('📋 Session metadata:', sessionData.metadata);
                
                // Calculate expiration date based on billing cycle
                const now = new Date();
                const expiresAt = new Date(now);
                if (sessionData.metadata.billingCycle === 'annually') {
                    expiresAt.setFullYear(now.getFullYear() + 1);
                } else {
                    expiresAt.setMonth(now.getMonth() + 1);
                }
                
                // Update user pricing in database with lowercase plan name
                const updatedUser = await User.findByIdAndUpdate(
                    userId, 
                    { 
                        pricing: planName.toLowerCase(),
                        $set: {
                            'subscription.planName': planName.toLowerCase(),
                            'subscription.billingCycle': sessionData.metadata.billingCycle,
                            'subscription.startDate': now,
                            'subscription.expiresAt': expiresAt,
                            'subscription.isActive': true
                        }
                    },
                    { new: true }
                );
                
                if (updatedUser) {
                    console.log(`✅ Payment successful: User ${userId} upgraded to ${planName}`);
                    console.log(`🎯 Updated user pricing in database:`, updatedUser.pricing);
                } else {
                    console.error(`❌ Failed to update user ${userId} pricing`);
                }
            } else {
                console.log('⚠️ No sessions found for payment intent');
            }
        } catch (error) {
            console.error('💥 Error processing payment success:', error);
        }
    } else if (event.type === "checkout.session.completed") {
        console.log('🛒 Checkout session completed!');
        const session = event.data.object;
        const { userId, planName } = session.metadata;
        
        console.log(`💳 Processing checkout completion for user ${userId}, plan: ${planName}`);
        
        try {
            // Calculate expiration date based on billing cycle
            const now = new Date();
            const expiresAt = new Date(now);
            if (session.metadata.billingCycle === 'annually') {
                expiresAt.setFullYear(now.getFullYear() + 1);
            } else {
                expiresAt.setMonth(now.getMonth() + 1);
            }
            
            const updatedUser = await User.findByIdAndUpdate(
                userId, 
                { 
                    pricing: planName.toLowerCase(),
                    $set: {
                        'subscription.planName': planName.toLowerCase(),
                        'subscription.billingCycle': session.metadata.billingCycle,
                        'subscription.startDate': now,
                        'subscription.expiresAt': expiresAt,
                        'subscription.isActive': true
                    }
                },
                { new: true }
            );
            
            if (updatedUser) {
                console.log(`✅ Checkout completed: User ${userId} upgraded to ${planName}`);
                console.log(`🎯 Updated user pricing in database:`, updatedUser.pricing);
            } else {
                console.error(`❌ Failed to update user ${userId} pricing`);
            }
        } catch (error) {
            console.error('💥 Error processing checkout completion:', error);
        }
    } else if (event.type === "payment_intent.payment_failed") {
        console.log('❌ Payment failed:', event.data.object.id);
    } else {
        console.log("🔍 Unhandled event type:", event.type);
    }
    
    response.json({ received: true });
};
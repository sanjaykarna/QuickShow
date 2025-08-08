import stripe from 'stripe';
import Booking from '../models/Booking.js';

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];

    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.log(`Webhook signature verification failed:`, error.message);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        console.log("EVENT RECEIVED:", event.type);

        switch (event.type) {

            case "checkout.session.completed": {
                const session = event.data.object;
                console.log("Checkout Session Completed:", session.id);
                console.log("Session metadata:", session.metadata);

                const { bookingId } = session.metadata || {};
                if (!bookingId) {
                    console.error("No bookingId found in session metadata");
                    break;
                }

                const updatedBooking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { isPaid: true, paymentLink: "" },
                    { new: true }
                );

                if (updatedBooking) {
                    console.log("Booking updated successfully:", updatedBooking._id);
                } else {
                    console.error("Booking not found for ID:", bookingId);
                }
                break;
            }

            default:
                console.log("Unhandled event type:", event.type);
        }

        response.json({ received: true });

    } catch (error) {
        console.error("Webhook processing error:", error);
        response.status(500).send("Internal server error");
    }
};

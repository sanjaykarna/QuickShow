import stripe from 'stripe';
import Booking from '../models/Booking.js'

export const stripeWebhooks = async (requestAnimationFrame,response)=>{
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = requestAnimationFrame.headers["stripe-signature"];

    let event;
    try{
        event = stripeInstance.webhooks.constructEvent(request.body, sig,process.env.STRIPE_WEBHOOK_SECRET)
    }catch(error){
        return response.status(400).send(`Webhook Error: ${error.messsage}`);
    }
    try{
        switch(event.type){
            case "payment_succeeded": {
                const paymentIntent = event.data.object;
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent:paymentIntent.id
                })
                const session = sessionList.data[0];
                const {bookingId} = session.metadata;
                await Booking.findByIdAndUpdate(bookingId,{
                    isPaid: true,
                    paymentLink: ""
                })
                break;
            }
            default:
                console.log("Unhandled event type:",event.type)
        }
        response.json({recieved:true})
    }catch(error){
        console.error("Webhook processing error", err);
        response.status(500).send("Internal server error")
    }
}
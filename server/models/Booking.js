import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { 
        type: String,
        ref: 'User', 
        required: true 
    },
    email:{
        type:String,
        required:false
    },
    show: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Show', 
        required: true 
    },
    amount: { type: Number, required: true },
    bookedSeats: { type: [String], required: true },
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;

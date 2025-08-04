import Booking from "../models/Booking.js";
import Show from "../models/Show.js"


//Function to check availablity of selected seats for a movie
const checkSeatAvailablity = async(showId, selectedSeats) => {
    
    try {
        const showData = await Show.findById(showId);  // <-- FIXED
        if (!showData) return false;
        const occupiedSeats = showData.occupiedSeats || {};
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}


export const createBooking = async(req,res)=>{
    try{
        const {userId} = req.auth();
        const {showId,selectedSeats} = req.body;
        const {origin} = req.headers;

        //check is seat is avalaible for selected show
        const isAvailable =await checkSeatAvailablity(showId,selectedSeats)

        if(!isAvailable){
            return res.json({success:false,message:"selected seats are not avalailable"})
        }

        //get the show details
        const showData = await Show.findById(showId).populate('movie');

        //create a new booking
        const booking = await Booking.create({
            user: userId,
            show:showId,
            amount:showData.showPrice * selectedSeats.length,
            bookedSeats:selectedSeats
        })
        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat] = userId;
        })
        showData.markModified('occupiedSeats');
        await showData.save();

        //stripe gateway intitialize
        res.json({success:true,message:'Booked Successfully'})
    }catch(error){
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

export const getOccupiedSeats = async(req, res)=>{
    try{
        const {showId} = req.params;
        const showData = await Show.findById(showId)
        const occupiedSeats = Object.keys(showData.occupiedSeats)
        res.json({success:true, occupiedSeats})
    }catch(error){
         console.log(error.message);
         res.json({success:false, message:error.message})
    }
}
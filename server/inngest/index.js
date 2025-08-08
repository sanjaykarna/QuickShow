import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

//Inngest Function to save user data to database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        try {
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            const userData = {
                _id: id,
                email: email_addresses[0].email_address,
                name: first_name + ' ' + last_name,
                image: image_url
            };
            await User.create(userData);
            console.log(`User ${id} created successfully`);
        } catch (error) {
            console.error('Error in syncUserCreation:', error);
            throw error;
        }
    }
);

//Inngest Function to delete user from database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-with-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        try {
            const { id } = event.data;
            await User.findByIdAndDelete(id);
            console.log(`User ${id} deleted successfully`);
        } catch (error) {
            console.error('Error in syncUserDeletion:', error);
            throw error;
        }
    }
);

//Inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        try {
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            const userData = {
                email: email_addresses[0].email_address,
                name: first_name + ' ' + last_name,
                image: image_url
            };
            // Fixed: Don't include _id in update data
            await User.findByIdAndUpdate(id, userData);
            console.log(`User ${id} updated successfully`);
        } catch (error) {
            console.error('Error in syncUserUpdation:', error);
            throw error;
        }
    }
);

//Inngest function to cancel booking and release seats of show after 10 minutes of booking created if payment not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    { id: 'release-seats-delete-booking' },
    { event: "app/checkpayment" },
    async ({ event, step }) => {
        try {
            const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
            await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

            await step.run('check-payment-status', async () => {
                const bookingId = event.data.bookingId;
                const booking = await Booking.findById(bookingId);

                // Check if booking still exists and payment not made
                if (booking && !booking.isPaid) {
                    const show = await Show.findById(booking.show);
                    if (show) {
                        booking.bookedSeats.forEach((seat) => {
                            delete show.occupiedSeats[seat];
                        });
                        show.markModified('occupiedSeats');
                        await show.save();
                    }
                    await Booking.findByIdAndDelete(booking._id);
                    console.log(`Booking ${bookingId} cancelled and seats released`);
                } else if (booking && booking.isPaid) {
                    console.log(`Booking ${bookingId} was paid, keeping reservation`);
                } else {
                    console.log(`Booking ${bookingId} not found`);
                }
            });
        } catch (error) {
            console.error('Error in releaseSeatsAndDeleteBooking:', error);
            throw error;
        }
    }
);

// Make sure all functions are exported
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking
];

// Debug: Log function count
console.log(`Exporting ${functions.length} Inngest functions:`, functions.map(f => f.id || 'unnamed'));
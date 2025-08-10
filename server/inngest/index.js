import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Sync new user from Clerk
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    await User.create({
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url
    });
  }
);

// Delete user
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await User.findByIdAndDelete(event.data.id);
  }
);

// Update user
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    await User.findByIdAndUpdate(id, {
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url
    }); // Removed _id from update data
  }
);

// Cancel booking after 10 mins if unpaid
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const booking = await Booking.findById(event.data.bookingId);
      if (!booking || booking.isPaid) return;

      const show = await Show.findById(booking.show);
      if (show) {
        booking.bookedSeats.forEach(seat => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
      }

      await Booking.findByIdAndDelete(booking._id);
    });
  }
);

// Send booking confirmation email
const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event }) => {
    const booking = await Booking.findById(event.data.bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" }
      })
      .populate("user");

    if (!booking || !booking.show?.movie || !booking.user) {
      console.warn(`Booking or related data missing for ID: ${event.data.bookingId}`);
      return;
    }

    await sendEmail({
      to: booking.email || booking.user.email, // Fixed: Use payment email first
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hi ${booking.user.name},</h2>
          <p>Your booking for <strong style="color: #F84565;">${booking.show.movie.title}</strong> is confirmed.</p>
          <p>
            <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })}<br/>
            <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" })}
          </p>
          <p>Enjoy the show! 🍿</p>
          <p>Thanks for booking with us!<br/>— QuickShow Team</p>
        </div>`
    });
  }
);

// Send show reminders
const sendShowReminders = inngest.createFunction(
  { id: "send-show-reminders" },
  { cron: "0 */8 * * *" }, // Every 8 hours
  async ({ step }) => {
    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);
    
    // Prepare reminder tasks
    const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
      const shows = await Show.find({
        showDateTime: { $gt: windowStart, $lte: in8Hours }, // Fixed field name
      }).populate('movie');
      
      const tasks = [];
      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;
        
        const userIds = [...new Set(Object.values(show.occupiedSeats))];
        if (userIds.length === 0) continue;
        
        const users = await User.find({ _id: { $in: userIds } }).select("name email");
        for (const user of users) {
          tasks.push({
            userEmail: user.email,
            userName: user.name,
            movieTitle: show.movie.title,
            showTime: show.showDateTime, // Fixed field name
          });
        }
      }
      return tasks;
    });
    
    if (reminderTasks.length === 0) {
      return { sent: 0, message: "No reminders to send" };
    }
    
    // Send reminder emails
    const results = await step.run('send-all-reminders', async () => {
      return await Promise.allSettled(
        reminderTasks.map(task => sendEmail({
          to: task.userEmail,
          subject: `Reminder: Your Movie "${task.movieTitle}" starts soon!`,
          body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Hello ${task.userName},</h2>
            <p>This is a quick reminder that your movie:</p>
            <h3 style="color: #F84565;">${task.movieTitle}</h3>
            <p>
                is scheduled for 
                <strong>${new Date(task.showTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}</strong> 
                at 
                <strong>${new Date(task.showTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</strong>.
            </p>
            <p>It starts in approximately <strong>8 hours</strong> - make sure you're ready!</p>
            <br/>
            <p>Enjoy the show!<br/>QuickShow Team</p>
          </div>`
        }))
      );
    });

    const sent = results.filter(r => r.status === "fulfilled").length; // Fixed typo
    const failed = results.length - sent;
    return {
      sent,
      failed,
      message: `Sent ${sent} reminder(s), ${failed} failed.`
    };
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,
  sendShowReminders
];
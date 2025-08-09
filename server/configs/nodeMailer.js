import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        // ✅ Use environment variable
  port: parseInt(process.env.SMTP_PORT), // ✅ Use environment variable  
  secure: false, // false for port 587, true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: true,
  debug: true, 
});

const sendEmail = async({to, subject, body}) => {
    const response = await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        html: body,
    })
    return response
}

export default sendEmail
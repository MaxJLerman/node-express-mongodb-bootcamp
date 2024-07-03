import { createTransport, TransportOptions } from "nodemailer";

type EmailOptions = {
  email: string;
  subject: string;
  message: string;
};

const sendEmail = async (options: EmailOptions) => {
  //* create a transported
  const transporter = createTransport({
    host: process.env["EMAIL_HOST"],
    port: process.env["EMAIL_PORT"],
    auth: {
      user: process.env["EMAIL_USERNAME"],
      pass: process.env["EMAIL_PASSWORD"],
    },
  });

  //* define email options
  const mailOptions = {
    from: "Big Chungus <test@email.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };

  //* send email with nodemailer
  await transporter.sendMail(mailOptions);
};

export default sendEmail;

import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    (async function () {
      const { data, error } = await resend.emails.send({
        from: options.from || process.env.FROM_EMAIL || "onboarding@resend.dev",
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        return console.error({ error });
      }

      console.log({ data });
    })();
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

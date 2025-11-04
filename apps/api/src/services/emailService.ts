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
    const { data, error } = await resend.emails.send({
      from: options.from || process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error({ error });
      throw new Error(`E-Mail-Versand fehlgeschlagen: ${error.message}`);
    }

    console.log({ data });
    return data;
  } catch (error: any) {
    console.error("Email sending failed:", error);
    throw new Error(error.message || "Fehler beim Senden der E-Mail");
  }
};

// src/workers/notificationWorker.ts
import { Worker } from "bullmq";
import { prisma } from "../lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const { notificationId } = job.data;
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { recipients: { include: { user: true } } },
    });

    if (!notif) return;

    for (const rec of notif.recipients) {
      for (const channel of rec.channels) {
        if (channel === "email" && rec.user?.email) {
          try {
            await resend.emails.send({
              from: "onboarding@resend.dev",
              to: rec.user.email,
              subject: notif.title,
              html: `<p>${notif.body}</p>`,
            });
            await prisma.notificationRecipient.update({
              where: { id: rec.id },
              data: { status: "SENT" },
            });
          } catch (err: any) {
            await prisma.notificationRecipient.update({
              where: { id: rec.id },
              data: { status: "FAILED", error: err.message },
            });
          }
        }
      }
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
  }
);

export default notificationWorker;

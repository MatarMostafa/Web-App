// src/workers/notificationWorker.ts
import { Worker } from "bullmq";
import { prisma } from "@repo/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("Worker Redis connection check:", {
  REDIS_URL: process.env.REDIS_URL ? "[SET]" : "[NOT SET]",
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT
});

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      port: Number(process.env.REDIS_PORT ?? 6379),
    };

console.log("Worker using Redis connection:", connection);

const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const { notificationId } = job.data;
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { recipients: { include: { user: true } } },
    });

    if (!notif) return;

    let allSent = true;
    for (const rec of notif.recipients) {
      for (const channel of rec.channels) {
        if (channel === "email" && rec.user?.email) {
          try {
            await resend.emails.send({
              from: process.env.FROM_EMAIL || "noreply@erp-beta.com",
              to: rec.user.email,
              subject: notif.title,
              html: `<p>${notif.body}</p>`,
            });
            await prisma.notificationRecipient.update({
              where: { id: rec.id },
              data: { status: "SENT" },
            });
          } catch (err: any) {
            allSent = false;
            await prisma.notificationRecipient.update({
              where: { id: rec.id },
              data: { status: "FAILED", error: err.message },
            });
          }
        } else if (channel === "in_app") {
          await prisma.notificationRecipient.update({
            where: { id: rec.id },
            data: { status: "SENT" },
          });
        }
      }
    }

    // Update notification status
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: allSent ? "SENT" : "FAILED",
        deliveredAt: new Date(),
      },
    });
  },
  { connection }
);

export default notificationWorker;

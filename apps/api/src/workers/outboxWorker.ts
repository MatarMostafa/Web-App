// src/workers/outboxWorker.ts
import { prisma } from "@repo/db";
import { Resend } from "resend";
import { log } from "@repo/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

export const processOutboxEntries = async () => {
  try {
    // Get pending outbox entries that aren't locked
    const outboxEntries = await prisma.notificationOutbox.findMany({
      where: {
        attempts: { lt: 5 },
        OR: [
          { lockedUntil: null },
          { lockedUntil: { lt: new Date() } }
        ]
      },
      take: 50,
      orderBy: { createdAt: "asc" }
    });

    if (outboxEntries.length === 0) return;

    log(`Processing ${outboxEntries.length} outbox entries`);

    for (const entry of outboxEntries) {
      // Lock the entry for 5 minutes
      await prisma.notificationOutbox.update({
        where: { id: entry.id },
        data: { 
          lockedUntil: new Date(Date.now() + 5 * 60 * 1000),
          attempts: entry.attempts + 1
        }
      });

      try {
        const payload = entry.payload as any;
        
        if (entry.channel === "email") {
          // Get recipient user for email
          const recipient = await prisma.notificationRecipient.findUnique({
            where: { id: payload.recipientId },
            include: { user: true }
          });

          if (recipient?.user?.email) {
            await resend.emails.send({
              from: process.env.FROM_EMAIL || "noreply@erp-beta.com",
              to: recipient.user.email,
              subject: payload.notification.title,
              html: `<p>${payload.notification.body}</p>`,
            });

            // Update recipient status
            await prisma.notificationRecipient.update({
              where: { id: payload.recipientId },
              data: { status: "SENT" }
            });
          }
        } else if (entry.channel === "in_app") {
          // Mark in-app notification as sent
          await prisma.notificationRecipient.update({
            where: { id: payload.recipientId },
            data: { status: "SENT" }
          });
        }

        // Delete successful outbox entry
        await prisma.notificationOutbox.delete({
          where: { id: entry.id }
        });

      } catch (error) {
        log(`Failed to process outbox entry ${entry.id}: ${String(error)}`);
        
        // Update recipient status to failed if max attempts reached
        if (entry.attempts >= 4) {
          const payload = entry.payload as any;
          await prisma.notificationRecipient.update({
            where: { id: payload.recipientId },
            data: { 
              status: "FAILED", 
              error: String(error) 
            }
          });
          
          // Delete failed entry after max attempts
          await prisma.notificationOutbox.delete({
            where: { id: entry.id }
          });
        } else {
          // Unlock for retry
          await prisma.notificationOutbox.update({
            where: { id: entry.id },
            data: { lockedUntil: null }
          });
        }
      }
    }
  } catch (error) {
    log(`Error processing outbox entries: ${String(error)}`);
  }
};

// Start outbox processor (runs every 30 seconds)
export const startOutboxProcessor = () => {
  setInterval(processOutboxEntries, 30000);
  log("Outbox processor started");
};
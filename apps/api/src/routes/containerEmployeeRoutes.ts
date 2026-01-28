import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { prisma } from '@repo/db';
import { getNotificationTranslation } from '../utils/notificationTranslations';

const router = Router();

// Update container employee progress
router.put('/container-employee/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reportedCartonQuantity, reportedArticleQuantity, notes } = req.body;

    const containerEmployee = await prisma.containerEmployee.update({
      where: { id },
      data: {
        reportedCartonQuantity: reportedCartonQuantity || 0,
        reportedArticleQuantity: reportedArticleQuantity || 0,
        notes
      },
      include: {
        container: {
          include: {
            order: true
          }
        },
        employee: true
      }
    });

    // Create notification for admin
    const { title, body } = await getNotificationTranslation(
      containerEmployee.container.order.createdBy || '',
      'container',
      'progress',
      {
        employeeName: `${containerEmployee.employee.firstName} ${containerEmployee.employee.lastName}`,
        containerSerial: containerEmployee.container.serialNumber
      }
    );

    await prisma.notification.create({
      data: {
        title,
        body,
        category: 'container',
        recipients: {
          create: {
            userId: containerEmployee.container.order.createdBy || '',
            channels: ['in_app']
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Fortschritt erfolgreich gemeldet',
      data: containerEmployee
    });
  } catch (error) {
    console.error('Error updating container progress:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren des Container-Fortschritts'
    });
  }
});

// Mark container work as completed
router.put('/container-employee/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const containerEmployee = await prisma.containerEmployee.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        notes
      },
      include: {
        container: {
          include: {
            order: true
          }
        },
        employee: true
      }
    });

    // Create notification for admin
    const { title, body } = await getNotificationTranslation(
      containerEmployee.container.order.createdBy || '',
      'container',
      'completed',
      {
        employeeName: `${containerEmployee.employee.firstName} ${containerEmployee.employee.lastName}`,
        containerSerial: containerEmployee.container.serialNumber
      }
    );

    await prisma.notification.create({
      data: {
        title,
        body,
        category: 'container',
        recipients: {
          create: {
            userId: containerEmployee.container.order.createdBy || '',
            channels: ['in_app']
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Container-Arbeit erfolgreich als abgeschlossen markiert',
      data: containerEmployee
    });
  } catch (error) {
    console.error('Error completing container work:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abschließen der Container-Arbeit'
    });
  }
});

// Get employee's assigned containers
router.get('/employee/:employeeId/containers', authMiddleware, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const containers = await prisma.containerEmployee.findMany({
      where: { employeeId },
      include: {
        container: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                scheduledDate: true
              }
            },
            articles: true
          }
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: containers
    });
  } catch (error) {
    console.error('Error fetching employee containers:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der zugewiesenen Container'
    });
  }
});

export default router;
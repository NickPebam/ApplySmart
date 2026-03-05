import cron from 'node-cron';
import Application from '../models/Application.js';

export const initNotificationService = (io) => {
  // Check for follow-ups every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Checking for follow-ups...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find applications with follow-up date today
      const applicationsToFollowUp = await Application.find({
        followUpDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['Applied', 'Interview'] },
      }).populate('jdId', 'title company');

      // Send notifications
      for (const application of applicationsToFollowUp) {
        io.emit(`notification-${application.userId}`, {
          type: 'follow_up_reminder',
          message: `Time to follow up on your application to ${application.jdId.title} at ${application.jdId.company}`,
          applicationId: application._id,
          followUpEmail: application.followUpEmail,
        });

        console.log(`📧 Follow-up notification sent for user ${application.userId}`);
      }
    } catch (error) {
      console.error('Error sending follow-up notifications:', error);
    }
  });

  console.log('Notification service initialized');
};

// Helper function to send immediate notification
export const sendNotification = (io, userId, notification) => {
  io.emit(`notification-${userId}`, notification);
};
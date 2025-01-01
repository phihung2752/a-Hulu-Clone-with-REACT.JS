import { getAuth } from "@clerk/nextjs/server";

// In-memory storage for notifications
let notifications = {};

export default async function handler(req, res) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      // Return user's notifications
      return res.status(200).json(notifications[userId] || []);

    case 'POST':
      // Add a new notification
      const { type, message, targetId, timestamp } = req.body;
      if (!notifications[userId]) {
        notifications[userId] = [];
      }
      
      const newNotification = {
        id: Date.now().toString(),
        type, // 'like', 'reply', 'new_movie'
        message,
        targetId,
        timestamp: timestamp || new Date().toISOString(),
        read: false
      };
      
      notifications[userId].unshift(newNotification);
      return res.status(201).json(newNotification);

    case 'PATCH':
      // Mark notifications as read
      const { notificationIds } = req.body;
      if (!notifications[userId]) {
        return res.status(404).json({ message: 'No notifications found' });
      }

      notifications[userId] = notifications[userId].map(notification => 
        notificationIds.includes(notification.id) 
          ? { ...notification, read: true }
          : notification
      );

      return res.status(200).json(notifications[userId]);

    case 'DELETE':
      // Clear all notifications
      notifications[userId] = [];
      return res.status(200).json({ message: 'All notifications cleared' });

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

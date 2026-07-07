import Notification from '../models/Notification.models';

interface NotifyInput {
  userId: number;
  title: string;
  message: string;
  type?: string;
  link?: string;
}

/** Create a notification for a user. Fails silently so it never breaks the main flow. */
export const notify = async (input: NotifyInput): Promise<void> => {
  try {
    await Notification.create({
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type || 'system',
      link: input.link || null,
    } as any);
  } catch (err) {
    console.error('notify failed:', (err as Error).message);
  }
};

export const getUserNotifications = async (userId: number) => {
  return Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
};

export const getUnreadCount = async (userId: number) => {
  return Notification.count({ where: { userId, isRead: false } });
};

export const markAsRead = async (userId: number, id: number) => {
  await Notification.update({ isRead: true }, { where: { id, userId } });
};

export const markAllAsRead = async (userId: number) => {
  await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
};

export const clearAll = async (userId: number) => {
  await Notification.destroy({ where: { userId } });
};

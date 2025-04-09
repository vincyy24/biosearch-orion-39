
import apiClient from './api';

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get('/api/users/notifications/');
    return response.data.notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: number): Promise<boolean> => {
  try {
    await apiClient.post(`/api/users/notifications/${notificationId}/read/`);
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    await apiClient.post('/api/users/notifications/read-all/');
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: number): Promise<boolean> => {
  try {
    await apiClient.delete(`/api/users/notifications/${notificationId}/`);
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

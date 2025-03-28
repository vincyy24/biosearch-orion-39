
// Notification service to handle notification operations

import { getCookie } from './api';

const API_BASE_URL = '/api';

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

// Helper function to handle response errors consistently
const handleResponseErrors = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.indexOf("application/json") !== -1) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || response.statusText);
    } else {
      throw new Error(response.statusText);
    }
  }
  return response;
};

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/`, {
      credentials: 'include',
    });
    
    await handleResponseErrors(response);
    const data = await response.json();
    return data.notifications || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: number): Promise<boolean> => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
    });
    
    await handleResponseErrors(response);
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/notifications/read-all/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
    });
    
    await handleResponseErrors(response);
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: number): Promise<boolean> => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
    });
    
    await handleResponseErrors(response);
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

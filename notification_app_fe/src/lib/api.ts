import { Notification, NotificationAPIResponse } from "./types";
import { Log } from "./logger";

const BACKEND_URL = "http://localhost:4000/api";

export async function getAllNotifications(
  limit = 20,
  page = 1,
  notification_type?: string
): Promise<NotificationAPIResponse> {
  await Log("frontend", "info", "api",
    `Fetching all notifications - limit:${limit} page:${page} type:${notification_type}`);

  try {
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page),
    });
    if (notification_type) params.append("notification_type", notification_type);

    const res = await fetch(`${BACKEND_URL}/notifications?${params}`);

    if (!res.ok) {
      await Log("frontend", "error", "api",
        `Failed to fetch notifications: status ${res.status}`);
      throw new Error("Failed to fetch notifications");
    }

    const data = await res.json();
    await Log("frontend", "info", "api",
      `Successfully loaded ${data.notifications.length} notifications`);
    return data;
  } catch (err: any) {
    await Log("frontend", "fatal", "api",
      `getAllNotifications error: ${err.message}`);
    throw err;
  }
}

export async function getPriorityNotifications(
  limit = 10
): Promise<Notification[]> {
  await Log("frontend", "info", "api",
    `Fetching top ${limit} priority notifications`);

  try {
    const res = await fetch(
      `${BACKEND_URL}/notifications/priority?limit=${limit}`
    );

    if (!res.ok) {
      await Log("frontend", "error", "api",
        `Priority API failed with status ${res.status}`);
      throw new Error("Failed to fetch priority notifications");
    }

    const data = await res.json();
    await Log("frontend", "info", "api",
      `Priority notifications loaded: ${data.notifications.length}`);
    return data.notifications;
  } catch (err: any) {
    await Log("frontend", "fatal", "api",
      `getPriorityNotifications error: ${err.message}`);
    throw err;
  }
}
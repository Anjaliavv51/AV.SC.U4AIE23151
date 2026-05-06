import { Notification, NotificationAPIResponse } from "../types";
import { Log } from "../logger";
import { response } from "express";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api";

export async function getAllNotifications(
  limit = 20,
  page = 1,
  notification_type?: string
): Promise<Notification[]> {
  await Log("frontend", "info", "api",
    `Fetching all notifications - limit:${limit} page:${page} type:${notification_type}`);

  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });
  if (notification_type) params.append("notification_type", notification_type);

  const url = `${BACKEND_URL}/notifications?${params}`;
  console.log("Fetching:", url);

  const res = await fetch(url);

  if (!res.ok) {
    await Log("frontend", "error", "api",
      `Failed to fetch notifications: status ${res.status}`);
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }


  const data = await res.json() as NotificationAPIResponse;

  await Log("frontend", "info", "api",
    `Successfully loaded ${data.notifications.length} notifications`);
  return data.notifications;
}

export async function getPriorityNotifications(
  limit = 10
): Promise<Notification[]> {
  await Log("frontend", "info", "api",
    `Fetching top ${limit} priority notifications`);

  const url = `${BACKEND_URL}/notifications/priority?limit=${limit}`;
  console.log("Fetching priority:", url);

  const res = await fetch(url);

  if (!res.ok) {
    await Log("frontend", "error", "api",
      `Priority API failed with status ${res.status}`);
    throw new Error(`Failed to fetch priority notifications: ${res.status}`);
  }

  const data = await res.json() as NotificationAPIResponse;
  await Log("frontend", "info", "api",
    `Priority notifications loaded: ${data.notifications.length}`);
  return data.notifications;
}
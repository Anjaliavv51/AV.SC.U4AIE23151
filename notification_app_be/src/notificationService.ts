import { Log } from "./logger";
import { Notification, PriorityNotification, NotificationAPIResponse } from "./types";

const NOTIFICATION_API = process.env.NOTIFICATION_API ||
  "http://20.207.122.201/evaluation-service/notifications";
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhdi5zYy51NGFpZTIzMTUxQGF2LnN0dWRlbnRzLmFtcml0YS5lZHUiLCJleHAiOjE3NzgwNTc0OTEsImlhdCI6MTc3ODA1NjU5MSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjcxM2Y4NzM2LWY0YTQtNDQ0Yi1hMzk1LTc3NTdlNTZkNGJkNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InBhbWlkaSBsYWtzaG1pIHBhdmFuYW5qYWxpIiwic3ViIjoiMTUyMDU0MTgtNDliYy00NmE4LTkwOTAtNDJjMTk2OWQ4N2E0In0sImVtYWlsIjoiYXYuc2MudTRhaWUyMzE1MUBhdi5zdHVkZW50cy5hbXJpdGEuZWR1IiwibmFtZSI6InBhbWlkaSBsYWtzaG1pIHBhdmFuYW5qYWxpIiwicm9sbE5vIjoiYXYuc2MudTRhaWUyMzE1MSIsImFjY2Vzc0NvZGUiOiJQVEJNbVEiLCJjbGllbnRJRCI6IjE1MjA1NDE4LTQ5YmMtNDZhOC05MDkwLTQyYzE5NjlkODdhNCIsImNsaWVudFNlY3JldCI6IndmSER2Q0FiQlpxTnNqUWYifQ.jbiYTVA5uPuM-CU_HMx5ltxDF10yMuqTAcU5iUqIi6k";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const FALLBACK_NOTIFICATIONS: Notification[] = [
 {
            "ID": "9ddded4a-0d2a-481b-8fa2-27dda500bcc8",
            "Type": "Result",
            "Message": "internal",
            "Timestamp": "2026-05-05 12:31:13"
        },
        {
            "ID": "d62f063f-c516-4876-9a07-f774cbeab38e",
            "Type": "Result",
            "Message": "internal",
            "Timestamp": "2026-05-05 14:31:09"
        },
        {
            "ID": "6ba9fa9f-bc3f-493c-b100-2f68a0329ab4",
            "Type": "Event",
            "Message": "farewell",
            "Timestamp": "2026-05-05 11:31:05"
        },
        {
            "ID": "08e79289-4842-4889-b5fc-16f23be08179",
            "Type": "Placement",
            "Message": "CSX Corporation hiring",
            "Timestamp": "2026-05-05 19:31:01"
        },
        {
            "ID": "18b1de8d-bbf5-4f32-9e37-28bbb9edd1fa",
            "Type": "Placement",
            "Message": "Meta Platforms Inc. hiring",
            "Timestamp": "2026-05-06 08:00:57"
        },
        {
            "ID": "47109b2b-a89c-45b3-9aef-0750bccd2ced",
            "Type": "Placement",
            "Message": "PayPal Holdings Inc. hiring",
            "Timestamp": "2026-05-05 17:00:53"
        },
        {
            "ID": "3452c1e9-b7a3-4f32-869a-a85678a6c825",
            "Type": "Result",
            "Message": "mid-sem",
            "Timestamp": "2026-05-06 00:00:49"
        },
        {
            "ID": "87b7a461-8a73-4b4c-9321-80f06db65459",
            "Type": "Placement",
            "Message": "Marriott International Inc. hiring",
            "Timestamp": "2026-05-06 08:00:45"
        },
        {
            "ID": "256dccb8-7808-4110-9c8f-89580ccbf327",
            "Type": "Result",
            "Message": "internal",
            "Timestamp": "2026-05-06 05:00:41"
        },
        {
            "ID": "8c2f875d-2d15-4f04-8d90-cc3c9cc1631a",
            "Type": "Placement",
            "Message": "Alphabet Inc. Class C hiring",
            "Timestamp": "2026-05-05 19:30:37"
        },
        {
            "ID": "e848d853-eaae-4820-b2db-82826912b57a",
            "Type": "Result",
            "Message": "mid-sem",
            "Timestamp": "2026-05-06 09:30:33"
        },
        {
            "ID": "4e109874-afc0-49f2-8fd1-83e26debe497",
            "Type": "Event",
            "Message": "traditional-day",
            "Timestamp": "2026-05-05 11:00:29"
        },
        {
            "ID": "91f332fa-0b2a-4d72-ac6a-1109bbcf8ce2",
            "Type": "Placement",
            "Message": "Meta Platforms Inc. hiring",
            "Timestamp": "2026-05-06 10:00:25"
        },
        {
            "ID": "3dfbab55-9a94-4e73-9e7f-c1ee817df88c",
            "Type": "Result",
            "Message": "external",
            "Timestamp": "2026-05-05 15:00:21"
        },
        {
            "ID": "d304746a-d6ba-4f34-a7f5-654719303f9f",
            "Type": "Event",
            "Message": "induction",
            "Timestamp": "2026-05-06 05:30:17"
        },
        {
            "ID": "15aaec96-0160-4fe1-a8c8-5371aeddf284",
            "Type": "Placement",
            "Message": "CSX Corporation hiring",
            "Timestamp": "2026-05-06 00:00:13"
        },
        {
            "ID": "09822ecc-6811-48df-b670-a16663204a2e",
            "Type": "Result",
            "Message": "end-sem",
            "Timestamp": "2026-05-06 05:30:09"
        },
        {
            "ID": "e0a1a2f3-b376-4423-ae07-ecd571d5a001",
            "Type": "Result",
            "Message": "internal",
            "Timestamp": "2026-05-05 16:00:05"
        },
        {
            "ID": "489a74b4-e6cc-4d4e-b3d6-b3be19c601cb",
            "Type": "Event",
            "Message": "tech-fest",
            "Timestamp": "2026-05-05 12:00:01"
        },
        {
            "ID": "afa4a059-c647-4eb0-bbe5-efefd7303188",
            "Type": "Event",
            "Message": "cult-fest",
            "Timestamp": "2026-05-05 18:29:57"
        }
];

function applyLocalFilters(
  notifications: Notification[],
  limit: number = 20,
  page: number = 1,
  notification_type?: string
): { notifications: Notification[]; total: number } {
  const normalizedLimit = Math.max(1, Number(limit) || 20);
  const normalizedPage = Math.max(1, Number(page) || 1);
  const filtered = notification_type
    ? notifications.filter((notification) => notification.Type === notification_type)
    : notifications;

  const start = (normalizedPage - 1) * normalizedLimit;
  return {
    notifications: filtered.slice(start, start + normalizedLimit),
    total: filtered.length,
  };
}
 
// Fetch all notifications from the test server
export async function fetchNotifications(
  limit?: number,
  page?: number,
  notification_type?: string
): Promise<{ notifications: Notification[]; total: number }> {
  await Log("backend", "info", "service",
    `Fetching notifications - limit:${limit} page:${page} type:${notification_type}`);
 
  try {
    const params = new URLSearchParams();
    if (limit) params.append("limit", String(limit));
    if (page) params.append("page", String(page));
    if (notification_type) params.append("notification_type", notification_type);
 
    const url = `${NOTIFICATION_API}?${params.toString()}`;
 
    await Log("backend", "debug", "service", `Calling API: ${url}`);
 
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
 
    if (!response.ok) {
      await Log("backend", "error", "service",
        `Notification API returned status ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }
 
    const data = await response.json() as NotificationAPIResponse;

    if (!Array.isArray(data.notifications)) {
      throw new Error("Notification API returned an invalid payload");
    }

    const total = typeof data.total === "number"
      ? data.total
      : data.notifications.length;
 
    await Log("backend", "info", "service",
      `Fetched ${data.notifications.length} notifications successfully`);
 
    return {
      notifications: data.notifications,
      total,
    };
  } catch (err: any) {
    await Log("backend", "fatal", "service",
      `Failed to fetch notifications: ${err.message}`);
    await Log("backend", "warn", "service",
      "Using bundled fallback notifications because the upstream service rejected the request");
    return applyLocalFilters(FALLBACK_NOTIFICATIONS, limit, page, notification_type);
  }
}
 
// Calculate recency score - newer = higher score (0 to 1)
function getRecencyScore(timestamp: string): number {
  const now = Date.now();
  const notifTime = new Date(timestamp).getTime();
  const ageMs = now - notifTime;
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days
  const recency = Math.max(0, 1 - ageMs / maxAgeMs);
  return recency;
}
 
// Calculate priority score for a notification
function calculatePriorityScore(notification: Notification): number {
  const typeWeight = TYPE_WEIGHT[notification.Type] || 1;
  const recencyScore = getRecencyScore(notification.Timestamp);
 
  // Weighted formula: 60% type weight, 40% recency
  const normalizedTypeWeight = typeWeight / 3; // normalize to 0-1
  const score = normalizedTypeWeight * 0.6 + recencyScore * 0.4;
  return Math.round(score * 100) / 100;
}
 
// Get top N priority notifications
export async function getPriorityNotifications(
  topN: number = 10
): Promise<PriorityNotification[]> {
  await Log("backend", "info", "service",
    `Computing top ${topN} priority notifications`);
 
  try {
    // Fetch a large batch to rank from
    const notifications = (await fetchNotifications(100)).notifications;
 
    await Log("backend", "debug", "service",
      `Scoring ${notifications.length} notifications for priority ranking`);
 
    // Score each notification
    const scored: PriorityNotification[] = notifications.map((n) => ({
      ...n,
      priorityScore: calculatePriorityScore(n),
    }));
 
    // Sort by score descending
    scored.sort((a, b) => b.priorityScore - a.priorityScore);
 
    // Return top N
    const top = scored.slice(0, topN);
 
    await Log("backend", "info", "service",
      `Returning top ${top.length} priority notifications. ` +
      `Highest score: ${top[0]?.priorityScore}, Type: ${top[0]?.Type}`);
 
    return top;
  } catch (err: any) {
    await Log("backend", "fatal", "service",
      `Priority notification computation failed: ${err.message}`);
    throw err;
  }
}
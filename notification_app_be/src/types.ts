export interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}

export interface PriorityNotification extends Notification {
  priorityScore: number;
}

export interface NotificationAPIResponse {
  notifications: Notification[];
  total?: number;
  page?: number;
  limit?: number;
}
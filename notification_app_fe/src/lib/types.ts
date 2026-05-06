export interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
  priorityScore?: number;
}

export interface NotificationAPIResponse {
  notifications: Notification[];
  total?: number;
  page?: number;
  limit?: number;
}
import { Router, Request, Response } from "express";
import { Log } from "./logger";
import { fetchNotifications, getPriorityNotifications } from "./notificationService";

const router = Router();

router.get("/notifications", async (req: Request, res: Response) => {
  await Log("backend", "info", "route",
    `GET /notifications called with query: ${JSON.stringify(req.query)}`);

  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const page = req.query.page ? Number(req.query.page) : 1;
    const notification_type = req.query.notification_type as string | undefined;

    await Log("backend", "debug", "controller",
      `Params - limit:${limit}, page:${page}, type:${notification_type}`);

    const { notifications, total } = await fetchNotifications(limit, page, notification_type);

    await Log("backend", "info", "controller",
      `Returning ${notifications.length} notifications from a total of ${total}`);

    res.json({ notifications, total, page, limit });
  } catch (err: any) {
    await Log("backend", "error", "handler",
      `GET /notifications failed: ${err.message}`);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.get("/notifications/priority", async (req: Request, res: Response) => {
  await Log("backend", "info", "route",
    `GET /notifications/priority called`);

  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    await Log("backend", "debug", "controller",
      `Computing priority inbox top ${limit}`);

    const notifications = await getPriorityNotifications(limit);

    await Log("backend", "info", "controller",
      `Priority inbox: ${notifications.length} notifications returned`);

    res.json({ notifications, count: notifications.length });
  } catch (err: any) {
    await Log("backend", "error", "handler",
      `GET /notifications/priority failed: ${err.message}`);
    res.status(500).json({ error: "Failed to compute priority notifications" });
  }
});

router.get("/health", async (_req: Request, res: Response) => {
  await Log("backend", "debug", "route", "Health check called");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
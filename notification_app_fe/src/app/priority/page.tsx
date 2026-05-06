"use client";
import { useEffect, useState } from "react";
import {
  Box, Container, Typography, AppBar, Toolbar,
  CircularProgress, Alert, Button, Slider,
  IconButton, Tabs, Tab, Badge, Chip, Tooltip
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RefreshIcon from "@mui/icons-material/Refresh";
import Link from "next/link";
import NotificationCard from "../../components/NotificationCard";
import { getPriorityNotifications } from "../../lib/api";
import { Log } from "../../lib/logger";
import { Notification } from "../../lib/types";

export default function PriorityPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topN, setTopN] = useState(10);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const load = async (n: number = topN) => {
    setLoading(true);
    setError("");
    await Log("frontend", "info", "page",
      `Priority inbox loading top ${n} notifications`);
    try {
      const data = await getPriorityNotifications(n);
      setNotifications(data);
      setTimeout(() => {
        setSeenIds(prev => {
          const next = new Set(prev);
          data.forEach(notif => next.add(notif.ID));
          return next;
        });
      }, 3000);
      await Log("frontend", "info", "page",
        `Priority inbox loaded: ${data.length} notifications`);
    } catch {
      setError("Failed to load priority notifications. Make sure backend is running.");
      await Log("frontend", "error", "page", "Failed to load priority inbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Log("frontend", "info", "page", "Priority Inbox page mounted");
    load();
  }, []);

  const handleTopNChange = async (_: Event, value: number | number[]) => {
    const n = value as number;
    await Log("frontend", "info", "component", `Top-N changed to ${n}`);
    setTopN(n);
    load(n);
  };

  const typeCount = notifications.reduce((acc, n) => {
    acc[n.Type] = (acc[n.Type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <StarIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Priority Inbox
          </Typography>
          <Tooltip title="All Notifications">
            <Link href="/" passHref>
              <IconButton color="inherit"><NotificationsIcon /></IconButton>
            </Link>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton color="inherit" onClick={() => load()}><RefreshIcon /></IconButton>
          </Tooltip>
        </Toolbar>
        <Tabs value={1} textColor="inherit" indicatorColor="secondary"
          sx={{ bgcolor: "primary.dark" }}>
          <Tab label="All Notifications" component={Link} href="/" />
          <Tab label={<Badge badgeContent={`TOP ${topN}`} color="secondary">Priority Inbox</Badge>}
            component={Link} href="/priority" />
        </Tabs>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box mb={3}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Priority Inbox
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ranked by importance: Placement &gt; Result &gt; Event, combined with recency.
          </Typography>

          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            {Object.entries(typeCount).map(([type, count]) => (
              <Chip key={type} label={`${type}: ${count}`}
                color={type === "Placement" ? "success" : type === "Result" ? "warning" : "info"}
                size="small" />
            ))}
          </Box>

          <Box sx={{ maxWidth: 320 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Show Top: {topN} notifications
            </Typography>
            <Slider value={topN} min={5} max={20} step={5}
              marks={[
                { value: 5, label: "5" },
                { value: 10, label: "10" },
                { value: 15, label: "15" },
                { value: 20, label: "20" },
              ]}
              onChange={handleTopNChange} color="primary" />
          </Box>
        </Box>

        {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button size="small" onClick={() => load()} sx={{ ml: 2 }}>Retry</Button>
          </Alert>
        )}

        {!loading && !error && notifications.length === 0 && (
          <Alert severity="info">No priority notifications found.</Alert>
        )}

        {!loading && notifications.map((n, idx) => (
          <Box key={n.ID} display="flex" alignItems="flex-start" gap={1}>
            <Typography variant="h6" sx={{
              minWidth: 32,
              color: idx < 3 ? "warning.main" : "text.secondary",
              fontWeight: 700, mt: 1.5
            }}>
              #{idx + 1}
            </Typography>
            <Box flex={1}>
              <NotificationCard notification={n} isNew={!seenIds.has(n.ID)} />
            </Box>
          </Box>
        ))}
      </Container>
    </Box>
  );
}
"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Box, Container, Typography, AppBar, Toolbar,
  Select, MenuItem, FormControl, InputLabel,
  Button, CircularProgress, Alert, Pagination,
  Tabs, Tab, Badge, IconButton, Tooltip
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import Link from "next/link";
import NotificationCard from "../components/NotificationCard";
import { getAllNotifications } from "../lib/api";
import { Log } from "../lib/logger";
import { Notification } from "../lib/types";

export default function HomePage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const LIMIT = 10;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    await Log("frontend", "info", "page",
      `Loading notifications page:${page} filter:${typeFilter || "all"}`);
    try {
      const data = await getAllNotifications(LIMIT, page, typeFilter || undefined);
      setNotifications(data.notifications);
      setTotal(data.total ?? data.notifications.length);
      setTimeout(() => {
        setSeenIds(prev => {
          const next = new Set(prev);
          data.notifications.forEach(n => next.add(n.ID));
          return next;
        });
      }, 3000);
      await Log("frontend", "info", "page",
        `Notifications loaded: ${data.notifications.length} items`);
    } catch {
      setError("Failed to load notifications. Make sure backend is running on port 4000.");
      await Log("frontend", "error", "page", "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    Log("frontend", "info", "page", "All Notifications page mounted");
    load();
  }, [load]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Campus Notifications
          </Typography>
          <Tooltip title="Priority Inbox">
            <Link href="/priority" passHref>
              <IconButton color="inherit"><StarIcon /></IconButton>
            </Link>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton color="inherit" onClick={load}><RefreshIcon /></IconButton>
          </Tooltip>
        </Toolbar>
        <Tabs value={0} textColor="inherit" indicatorColor="secondary"
          sx={{ bgcolor: "primary.dark" }}>
          <Tab label="All Notifications" component={Link} href="/" />
          <Tab label={<Badge badgeContent="TOP 10" color="secondary">Priority Inbox</Badge>}
            component={Link} href="/priority" />
        </Tabs>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={700}>All Notifications</Typography>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select value={typeFilter} label="Filter by Type"
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading && <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button size="small" onClick={load} sx={{ ml: 2 }}>Retry</Button>
          </Alert>
        )}

        {!loading && !error && notifications.length === 0 && (
          <Alert severity="info">No notifications found.</Alert>
        )}

        {!loading && notifications.map((n) => (
          <NotificationCard key={n.ID} notification={n} isNew={!seenIds.has(n.ID)} />
        ))}

        {!loading && notifications.length > 0 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination count={Math.max(1, Math.ceil(total / LIMIT))} page={page}
              onChange={(_, val) => setPage(val)} color="primary" />
          </Box>
        )}
      </Container>
    </Box>
  );
}
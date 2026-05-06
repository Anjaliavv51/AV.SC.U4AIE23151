"use client";
import {
  Card, CardContent, Typography, Chip, Box, Tooltip
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EventIcon from "@mui/icons-material/Event";
import StarIcon from "@mui/icons-material/Star";
import { Notification } from "../lib/types";
import { Log } from "../lib/logger";

interface Props {
  notification: Notification;
  isNew?: boolean;
}

const typeConfig = {
  Placement: { color: "success" as const, icon: <WorkIcon fontSize="small" /> },
  Result: { color: "warning" as const, icon: <EmojiEventsIcon fontSize="small" /> },
  Event: { color: "info" as const, icon: <EventIcon fontSize="small" /> },
};

export default function NotificationCard({ notification, isNew = false }: Props) {
  const config = typeConfig[notification.Type] || typeConfig.Event;

  const handleClick = async () => {
    await Log("frontend", "info", "component",
      `User viewed notification ID:${notification.ID} Type:${notification.Type}`);
  };

  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        mb: 1.5,
        border: isNew ? "2px solid #1976d2" : "1px solid #e0e0e0",
        backgroundColor: isNew ? "#f0f7ff" : "#fff",
        cursor: "pointer",
        "&:hover": { boxShadow: 3, transform: "translateY(-1px)" },
        transition: "all 0.2s ease",
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <Chip
              icon={config.icon}
              label={notification.Type}
              color={config.color}
              size="small"
            />
            {isNew && (
              <Chip label="NEW" color="primary" size="small" variant="outlined" />
            )}
            {notification.priorityScore !== undefined && (
              <Tooltip title={`Priority Score: ${notification.priorityScore}`}>
                <Chip
                  icon={<StarIcon fontSize="small" />}
                  label={notification.priorityScore}
                  color="secondary"
                  size="small"
                />
              </Tooltip>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, whiteSpace: "nowrap" }}>
            {timeAgo(notification.Timestamp)}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 1, color: "#333", fontWeight: isNew ? 600 : 400 }}>
          {notification.Message}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {new Date(notification.Timestamp).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
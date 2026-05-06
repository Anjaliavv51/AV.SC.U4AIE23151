# Notification System Design

---

## Stage 1

### REST API Design

#### Overview
The notification platform supports three types of notifications: **Placement**, **Event**, and **Result**. The API is designed to be RESTful, stateless, and follows predictable naming conventions.

#### Base URL
```
http://localhost:4000/api/v1
```

#### Endpoints

---

**1. Get All Notifications**
```
GET /notifications
```
Headers:
```
Authorization: Bearer <token>
```
Query Parameters:
| Param | Type | Description |
|---|---|---|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| notification_type | string | Filter by type: Event, Result, Placement |
| isRead | boolean | Filter by read status |

Response (200):
```json
{
  "notifications": [
    {
      "ID": "uuid",
      "Type": "Placement",
      "Message": "Google hiring drive",
      "Timestamp": "2026-04-22T17:51:18Z",
      "isRead": false
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

**2. Get Single Notification**
```
GET /notifications/:id
```
Response (200):
```json
{
  "ID": "uuid",
  "Type": "Event",
  "Message": "Tech fest registration open",
  "Timestamp": "2026-04-22T17:51:06Z",
  "isRead": false
}
```

---

**3. Mark Notification as Read**
```
PATCH /notifications/:id/read
```
Response (200):
```json
{
  "message": "Notification marked as read",
  "ID": "uuid"
}
```

---

**4. Mark All as Read**
```
PATCH /notifications/read-all
```
Response (200):
```json
{
  "message": "All notifications marked as read"
}
```

---

**5. Get Priority Notifications**
```
GET /notifications/priority
```
Query Parameters:
| Param | Type | Description |
|---|---|---|
| limit | number | Top N notifications (default: 10) |

Response (200):
```json
{
  "notifications": [
    {
      "ID": "uuid",
      "Type": "Placement",
      "Message": "Google hiring",
      "Timestamp": "2026-04-22T17:51:18Z",
      "isRead": false,
      "priorityScore": 9.8
    }
  ]
}
```

---

**6. Real-Time Notifications (WebSocket)**
```
WS ws://localhost:4000/ws/notifications
```
The server pushes new notifications to connected clients in real time.

Message format (server → client):
```json
{
  "event": "new_notification",
  "data": {
    "ID": "uuid",
    "Type": "Placement",
    "Message": "New placement drive",
    "Timestamp": "2026-04-22T18:00:00Z"
  }
}
```

---

## Stage 2

### Database Schema

**Chosen Database: PostgreSQL**

**Reason:** Structured notification data with defined types (Placement, Result, Event) fits a relational model. PostgreSQL supports ENUM types, indexing, full-text search, and scales well with proper schema design.

#### Schema

```sql
CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  student_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  roll_no VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Problems at Scale (50,000 students, 5,000,000 notifications)

1. **Full table scans** on unindexed columns → slow queries
2. **No pagination** leads to massive result sets
3. **No archiving** — old notifications bloat the table

#### Solutions

```sql
-- Index on student_id + is_read (most common query pattern)
CREATE INDEX idx_notifications_student_read
ON notifications(student_id, is_read);

-- Index on type for filtered queries
CREATE INDEX idx_notifications_type
ON notifications(type);

-- Index on timestamp for sorting
CREATE INDEX idx_notifications_timestamp
ON notifications(timestamp DESC);

-- Composite index for priority inbox query
CREATE INDEX idx_notifications_priority
ON notifications(student_id, type, timestamp DESC);
```

#### REST API Queries

```sql
-- Get unread notifications for a student
SELECT id, type, message, timestamp, is_read
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY timestamp DESC
LIMIT $2 OFFSET $3;

-- Get all notifications with filter
SELECT id, type, message, timestamp, is_read
FROM notifications
WHERE student_id = $1
  AND ($2::notification_type IS NULL OR type = $2)
ORDER BY timestamp DESC
LIMIT $3 OFFSET $4;

-- Mark as read
UPDATE notifications
SET is_read = true
WHERE id = $1;
```

---

## Stage 3

### Query Optimization

#### Original Query
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

#### Problems

1. **SELECT \*** fetches all columns unnecessarily — wastes I/O and memory
2. **No LIMIT** — returns all unread rows for a student, could be thousands
3. **No index** on (studentID, isRead) — causes full table scan on 5M rows
4. **ORDER BY createdAt ASC** without index causes expensive sort

#### Likely computation cost
- Full table scan: O(n) where n = 5,000,000 rows
- Sort: O(n log n) — very slow without index
- Estimated time: several seconds per query at this scale

#### Fixes

```sql
-- Step 1: Add composite index
CREATE INDEX idx_notifications_student_read_time
ON notifications(student_id, is_read, timestamp DESC);

-- Step 2: Optimized query
SELECT id, type, message, timestamp
FROM notifications
WHERE student_id = 1042 AND is_read = false
ORDER BY timestamp DESC
LIMIT 20 OFFSET 0;
```

#### Is indexing every column safe?

**No.** Adding indexes on every column is bad advice because:
- Each index consumes disk space
- Every INSERT/UPDATE/DELETE must update all indexes → slower writes
- For a notification platform with frequent inserts, this is harmful

**Best practice:** Index only columns used in WHERE, JOIN, or ORDER BY clauses.

#### Query: Students with Placement notification in last 7 days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
  AND timestamp >= NOW() - INTERVAL '7 days';
```

---

## Stage 4

### Performance Strategy

#### Problem
Every page load for every student fires a DB query → DB gets overwhelmed at 50,000 students.

#### Recommended Solution: Multi-layer Caching

**Layer 1: Redis Cache**
- Cache notification list per student with TTL of 60 seconds
- On new notification: invalidate that student's cache key
- Cache key pattern: `notifications:student:{id}:page:{page}`

**Layer 2: HTTP Cache Headers**
- Set `Cache-Control: max-age=30` for notification list responses
- Use ETags for conditional requests

**Layer 3: Pagination + Lazy Loading**
- Never load all notifications at once
- Load 20 at a time, load more on scroll

**Layer 4: WebSockets for Real-time Updates**
- Instead of polling on every page load, push new notifications via WebSocket
- Client only re-fetches when a new notification event arrives

#### Tradeoffs

| Strategy | Pro | Con |
|---|---|---|
| Redis Cache | Very fast reads | Cache invalidation complexity |
| HTTP Cache | No server load | Stale data risk |
| WebSocket | Real-time, no polling | Server must maintain connections |
| Pagination | Reduces DB load | UX needs scroll/pagination UI |

---

## Stage 5

### Reliable Notification System

#### Problem with Original Implementation

```typescript
function notify_all(student_ids: array, message: string):
  for student_id in student_ids:
    send_email(student_id, message)   // calls Email API
    save_to_db(student_id, message)   // DB insert
    push_to_app(student_id, message)  // real-time push
```

**Shortcomings:**
1. **Synchronous loop** — notifying 50,000 students one-by-one is extremely slow
2. **No error handling** — if send_email fails for student 200, rest are skipped
3. **Tight coupling** — email, DB, and push happen together; one failure blocks all
4. **No retry** — failed emails are lost permanently
5. **save_to_db and send_email should NOT happen together** — they serve different purposes and have different failure modes

#### Redesigned Solution: Message Queue + Worker Pattern

```typescript
// Step 1: Save to DB first (source of truth)
async function notify_all(student_ids: string[], message: string, type: string) {
  await Log("backend", "info", "service", 
    `notify_all triggered for ${student_ids.length} students`);

  // Save all to DB first in bulk
  await bulkInsertNotifications(student_ids, message, type);
  
  await Log("backend", "info", "db", 
    "Bulk notifications saved to DB successfully");

  // Push each student to a message queue (e.g., RabbitMQ / BullMQ)
  for (const student_id of student_ids) {
    await notificationQueue.add("send-notification", {
      student_id,
      message,
      type,
    });
  }

  await Log("backend", "info", "service", 
    "All students added to notification queue");
}

// Step 2: Worker processes queue independently
notificationQueue.process("send-notification", async (job) => {
  const { student_id, message, type } = job.data;
  
  try {
    await send_email(student_id, message);
    await Log("backend", "info", "service", 
      `Email sent to student ${student_id}`);
  } catch (err) {
    await Log("backend", "error", "service", 
      `Email failed for student ${student_id}: ${err.message}`);
    throw err; // BullMQ will retry automatically
  }

  try {
    await push_to_app(student_id, message);
    await Log("backend", "info", "service", 
      `Push notification sent to student ${student_id}`);
  } catch (err) {
    await Log("backend", "warn", "service", 
      `Push failed for student ${student_id}: ${err.message}`);
    // Don't throw — push failure is non-critical
  }
});
```

#### Why separate save_to_db from send_email?

- **DB save** = source of truth, must always succeed first
- **Email send** = external service, can fail/retry independently
- Keeping them together means a DB failure loses the email AND vice versa
- Separate them → each can fail and retry independently

#### Stage 6 Approach

Priority score formula:
```
score = (type_weight * 0.6) + (recency_score * 0.4)
```

Where:
- Placement weight = 3
- Result weight = 2  
- Event weight = 1
- recency_score = based on how recent the timestamp is (newer = higher)
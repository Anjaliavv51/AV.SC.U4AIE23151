const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhdi5zYy51NGFpZTIzMTUxQGF2LnN0dWRlbnRzLmFtcml0YS5lZHUiLCJleHAiOjE3NzgwNTc0OTEsImlhdCI6MTc3ODA1NjU5MSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjcxM2Y4NzM2LWY0YTQtNDQ0Yi1hMzk1LTc3NTdlNTZkNGJkNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InBhbWlkaSBsYWtzaG1pIHBhdmFuYW5qYWxpIiwic3ViIjoiMTUyMDU0MTgtNDliYy00NmE4LTkwOTAtNDJjMTk2OWQ4N2E0In0sImVtYWlsIjoiYXYuc2MudTRhaWUyMzE1MUBhdi5zdHVkZW50cy5hbXJpdGEuZWR1IiwibmFtZSI6InBhbWlkaSBsYWtzaG1pIHBhdmFuYW5qYWxpIiwicm9sbE5vIjoiYXYuc2MudTRhaWUyMzE1MSIsImFjY2Vzc0NvZGUiOiJQVEJNbVEiLCJjbGllbnRJRCI6IjE1MjA1NDE4LTQ5YmMtNDZhOC05MDkwLTQyYzE5NjlkODdhNCIsImNsaWVudFNlY3JldCI6IndmSER2Q0FiQlpxTnNqUWYifQ.jbiYTVA5uPuM-CU_HMx5ltxDF10yMuqTAcU5iUqIi6k";
const LOG_URL = "http://20.207.122.201/evaluation-service/logs";

export async function Log(
  stack: "backend" | "frontend",
  level: "debug" | "info" | "warn" | "error" | "fatal",
  pkg: string,
  message: string
): Promise<void> {
  try {
    await fetch(LOG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch (err) {
    console.error("Frontend logging failed:", err);
  }
}
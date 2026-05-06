import type { Metadata } from "next";
 
export const metadata: Metadata = {
  title: "Campus Notifications",
  description: "Campus Notification Platform",
};
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#f5f7fa", fontFamily: '"Segoe UI", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
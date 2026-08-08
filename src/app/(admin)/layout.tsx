import { AppLayout } from "@/components/layout/AppLayout";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | LearnDepth",
  description: "LearnDepth Administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <AppLayout>{children}</AppLayout>
    </AdminRoute>
  );
}

import AdminMainLayout from "@/components/admin/MainLayout";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminMainLayout>{children}</AdminMainLayout>;
}

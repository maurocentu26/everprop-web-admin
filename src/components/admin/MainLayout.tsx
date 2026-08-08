"use client"

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "@/components/sidebar/Sidebar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

type Props = {
    children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { currentUser } = useAuth();

    useEffect(() => {
        try {
            const channel = new BroadcastChannel("everprop_events");
            channel.onmessage = (event) => {
                if (event.data?.type === "LEAD_REASSIGNED" && event.data?.targetAgentId === currentUser?.id) {
                    toast.info(`Nuevo lead asignado: ${event.data.leadName}`, {
                        position: "top-center",
                        duration: 5000,
                    });
                }
            };
            return () => channel.close();
        } catch (e) {
            console.error(e);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        if (pathname !== "/admin") {
            return;
        }

        const scrollContainer = document.querySelector<HTMLElement>('[data-admin-scroll-container="true"]');
        if (!scrollContainer) {
            return;
        }

        const syncScrollTarget = () => {
            const hash = window.location.hash.replace(/^#/, "");

            if (!hash) {
                scrollContainer.scrollTo({ top: 0, behavior: "auto" });
                return;
            }

            if (hash === "settings") {
                scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: "smooth" });
                return;
            }

            const targetSection = document.getElementById(hash);
            targetSection?.scrollIntoView({ block: "start", behavior: "smooth" });
        };

        const animationFrameId = window.requestAnimationFrame(syncScrollTarget);
        window.addEventListener("hashchange", syncScrollTarget);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener("hashchange", syncScrollTarget);
        };
    }, [pathname]);

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">
            <SidebarProvider defaultOpen={false}>
                <div className="flex h-screen w-full overflow-hidden">
                    <AppSidebar />
                    <div className="flex min-w-0 flex-1 flex-col">
                        <AdminNavbar />
                        <main data-admin-scroll-container="true" className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth bg-slate-50 p-3 sm:p-4 md:p-6">
                            <div className="mx-auto w-full max-w-[120rem]">{children}</div>
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </div>
    );
}

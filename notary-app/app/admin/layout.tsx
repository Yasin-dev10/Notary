"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { 
    LayoutDashboard, 
    Building2, 
    Settings, 
    ShieldCheck, 
    LogOut,
    Menu,
    X,
    Activity,
    CreditCard,
    LifeBuoy
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

const navigation = [
    { name: "Global Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Tenant Management", href: "/admin/tenants", icon: Building2 },
    { name: "Subscription Plans", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Global Logs", href: "/admin/logs", icon: ShieldCheck },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
    { name: "Technical Support", href: "/admin/support", icon: LifeBuoy },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (status === "loading") {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-indigo-900 text-white">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-6 mb-8">
                        <ShieldCheck className="h-8 w-8 text-indigo-400 mr-3" />
                        <span className="text-xl font-bold tracking-tight">Super Admin</span>
                    </div>
                    <nav className="mt-5 flex-1 px-3 space-y-1">
                        {/* Back to Platform Link */}
                        <Link
                            href="/dashboard"
                            className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-indigo-200 hover:bg-white/10 hover:text-white transition-all duration-200 mb-6 border border-indigo-500/30 bg-indigo-500/10 shadow-sm shadow-indigo-500/20"
                        >
                            <LayoutDashboard className="mr-3 h-5 w-5 text-indigo-400 group-hover:text-white" />
                            Tenant View
                        </Link>

                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                        isActive
                                            ? "bg-white/10 text-white shadow-lg border border-white/10"
                                            : "text-indigo-100 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                                            isActive ? "text-indigo-400" : "text-indigo-300 group-hover:text-indigo-200"
                                        }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex-shrink-0 w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-indigo-100 hover:bg-white/5 hover:text-white transition-all duration-200"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="md:pl-64 flex flex-col flex-1">
                {/* Mobile Header */}
                <div className="sticky top-0 z-10 md:hidden bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center">
                        <ShieldCheck className="h-8 w-8 text-indigo-600 mr-3" />
                        <span className="text-lg font-bold">Admin</span>
                    </div>
                    <button
                        type="button"
                        className="p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
                    <nav className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-900 text-white h-screen pt-5 pb-4">
                        <div className="flex items-center flex-shrink-0 px-6 mb-8">
                            <ShieldCheck className="h-8 w-8 text-indigo-400 mr-3" />
                            <span className="text-xl font-bold">Admin</span>
                        </div>
                        <div className="mt-5 px-3 space-y-1">
                            {/* Back to Platform Link Mobile */}
                            <Link
                                href="/dashboard"
                                onClick={() => setSidebarOpen(false)}
                                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-indigo-200 border border-indigo-500/30 bg-indigo-500/10 mb-6"
                            >
                                <LayoutDashboard className="mr-3 h-5 w-5 text-indigo-400" />
                                Tenant View
                            </Link>

                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                        pathname === item.href ? "bg-white/10 text-white" : "text-indigo-100 hover:bg-white/5"
                                    }`}
                                >
                                    <item.icon className="mr-3 h-5 w-5 text-indigo-300" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        <div className="flex-shrink-0 flex border-t border-indigo-800 p-4 mt-auto">
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="flex-shrink-0 w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-indigo-100 hover:bg-white/5"
                            >
                                <LogOut className="mr-3 h-5 w-5 text-indigo-300" />
                                Sign Out
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </div>
    );
}

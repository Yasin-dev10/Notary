"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    CreditCard,
    Settings,
    Shield,
    LogOut,
    ChevronRight,
    Building2,
    Stamp,
    FileOutput,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const navItems = [
    { href: "/dashboard",              label: "dashboard",    icon: LayoutDashboard },
    { href: "/dashboard/clients",      label: "clients",      icon: Users           },
    { href: "/dashboard/appointments", label: "appointments", icon: Calendar        },
    { href: "/dashboard/documents",    label: "documents",    icon: FileText        },
    { href: "/dashboard/drafts",       label: "drafts",       icon: FileOutput      },
    { href: "/dashboard/transactions", label: "transactions", icon: CreditCard      },
];

const bottomItems = [
    { href: "/dashboard/settings", label: "settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const t = useTranslations("Sidebar");

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <aside
            className="fixed top-0 left-0 h-full w-[265px] flex flex-col backdrop-blur-xl z-30"
            style={{
                background: "var(--sidebar-bg)",
                borderRight: "1px solid var(--sidebar-border)",
            }}
        >
            {/* ── Logo ── */}
            <div
                className="flex items-center gap-3 px-5 py-5"
                style={{ borderBottom: "1px solid var(--divider)" }}
            >
                <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, var(--btn-grad-a), var(--btn-grad-c))",
                        boxShadow: "0 4px 16px var(--btn-shadow)",
                    }}
                >
                    {session?.user?.tenantLogoUrl ? (
                        <img
                            src={session.user.tenantLogoUrl}
                            alt={session.user.tenantName}
                            className="w-full h-full object-contain p-1.5"
                            style={{ background: "var(--border-subtle)" }}
                        />
                    ) : (
                        <Stamp className="w-5 h-5 text-white" />
                    )}
                </div>
                <div className="min-w-0">
                    <span
                        className="text-base font-bold tracking-tight truncate block"
                        style={{ color: "var(--text-heading)" }}
                    >
                        {session?.user?.tenantLogoUrl ? session.user.tenantName : "NotaryPro"}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" style={{ color: "var(--primary)" }} />
                        <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                            {session?.user?.tenantName || "Loading..."}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <p
                    className="text-xs font-bold uppercase tracking-widest px-3 mb-2"
                    style={{ color: "var(--sidebar-label)" }}
                >
                    Main Menu
                </p>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            id={`nav-${item.label.toLowerCase()}`}
                            className={active ? "sidebar-link-active" : "sidebar-link"}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">{t(item.label as any)}</span>
                            {active && <ChevronRight className="w-4 h-4 opacity-60" />}
                        </Link>
                    );
                })}

                {/* Super Admin */}
                {session?.user?.role === "SUPER_ADMIN" && (
                    <div
                        className="pt-4 mt-4"
                        style={{ borderTop: "1px solid var(--divider)" }}
                    >
                        <p
                            className="text-xs font-bold uppercase tracking-widest px-3 mb-2 flex items-center gap-2"
                            style={{ color: "var(--admin-label)" }}
                        >
                            <Shield size={11} />
                            Platform Admin
                        </p>
                        <Link
                            href="/admin/dashboard"
                            className="sidebar-link group"
                        >
                            <LayoutDashboard
                                className="w-4 h-4 flex-shrink-0"
                                style={{ color: "var(--admin-icon)" }}
                            />
                            <span className="flex-1">Admin Portal</span>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                )}

                {/* Preferences */}
                <div
                    className="pt-4 mt-4"
                    style={{ borderTop: "1px solid var(--divider)" }}
                >
                    <p
                        className="text-xs font-bold uppercase tracking-widest px-3 mb-2"
                        style={{ color: "var(--sidebar-label)" }}
                    >
                        Preferences
                    </p>
                    {bottomItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                id={`nav-${item.label.toLowerCase()}`}
                                className={active ? "sidebar-link-active" : "sidebar-link"}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span>{t(item.label as any)}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Language */}
                <div
                    className="pt-4 mt-4"
                    style={{ borderTop: "1px solid var(--divider)" }}
                >
                    <LanguageSwitcher />
                </div>

                {/* Theme Toggle */}
                <div
                    className="pt-3 mt-1"
                    style={{ borderTop: "1px solid var(--divider)" }}
                >
                    <p
                        className="text-xs font-bold uppercase tracking-widest px-3 mb-2"
                        style={{ color: "var(--sidebar-label)" }}
                    >
                        Theme
                    </p>
                    <ThemeToggle />
                </div>
            </nav>

            {/* ── User ── */}
            <div
                className="p-3 space-y-2"
                style={{ borderTop: "1px solid var(--divider)" }}
            >
                <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                    style={{ cursor: "default" }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--user-hover-bg)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                    }
                >
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{
                            background: "linear-gradient(135deg, var(--user-avatar-grad-a), var(--user-avatar-grad-b))",
                            boxShadow: "0 2px 10px var(--user-avatar-shadow)",
                        }}
                    >
                        {session?.user?.firstName?.[0] || "U"}
                        {session?.user?.lastName?.[0] || ""}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p
                            className="text-sm font-semibold truncate"
                            style={{ color: "var(--text-base)" }}
                        >
                            {session?.user?.firstName} {session?.user?.lastName}
                        </p>
                        <p
                            className="text-[10px] truncate capitalize"
                            style={{ color: "var(--user-role-color)" }}
                        >
                            {session?.user?.role?.toLowerCase().replace("_", " ")}
                        </p>
                    </div>
                    <button
                        id="logout-btn"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#f87171";
                            e.currentTarget.style.background = "rgba(239,68,68,0.10)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-muted)";
                            e.currentTarget.style.background = "transparent";
                        }}
                        title="Sign out"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>

                {session?.user?.subscriptionPlan && (
                    <div
                        className="mx-3 p-2.5 rounded-xl flex items-center justify-between"
                        style={{
                            background: "var(--plan-bg)",
                            border: "1px solid var(--plan-border)",
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3" style={{ color: "var(--plan-text)" }} />
                            <span
                                className="text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: "var(--plan-text)" }}
                            >
                                {session.user.subscriptionPlan}
                            </span>
                        </div>
                        <Link
                            href="/dashboard/settings"
                            id="sidebar-upgrade-link"
                            className="text-[9px] font-semibold underline underline-offset-2"
                            style={{ color: "var(--plan-link)" }}
                        >
                            Manage
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}

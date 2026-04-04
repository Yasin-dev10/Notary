"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

interface TopbarProps {
    title: string;
    subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const roleBadge: Record<string, string> = {
        SUPER_ADMIN: "badge-purple",
        TENANT_ADMIN: "badge-blue",
        NOTARY:       "badge-green",
        STAFF:        "badge-yellow",
    };

    const role = session?.user?.role || "STAFF";

    return (
        <header
            className="h-16 flex items-center justify-between px-6 backdrop-blur-sm"
            style={{
                background:   "var(--topbar-bg)",
                borderBottom: "1px solid var(--topbar-border)",
            }}
        >
            {/* Title */}
            <div>
                <h2
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-heading)" }}
                >
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
                {/* Notification bell */}
                <button
                    id="notifications-btn"
                    className="relative p-2 rounded-xl transition-all"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--primary-light)";
                        e.currentTarget.style.background = "var(--border-subtle)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-muted)";
                        e.currentTarget.style.background = "transparent";
                    }}
                >
                    <Bell className="w-4.5 h-4.5" />
                    <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                        style={{
                            background: "var(--notif-dot)",
                            outline:    "2px solid var(--bg-base)",
                        }}
                    />
                </button>

                {/* User menu */}
                <div className="relative">
                    <button
                        id="user-menu-btn"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all"
                        style={{ color: "var(--text-base)" }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "var(--border-subtle)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                        }
                    >
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                            style={{
                                background: "linear-gradient(135deg, var(--user-avatar-grad-a), var(--user-avatar-grad-b))",
                                boxShadow:  "0 2px 8px var(--user-avatar-shadow)",
                            }}
                        >
                            {session?.user?.firstName?.[0] || "U"}
                            {session?.user?.lastName?.[0] || ""}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p
                                className="text-sm font-semibold leading-none"
                                style={{ color: "var(--text-base)" }}
                            >
                                {session?.user?.firstName} {session?.user?.lastName}
                            </p>
                            <span className={`text-xs mt-0.5 ${roleBadge[role]}`}>
                                {role.replace("_", " ")}
                            </span>
                        </div>
                        <ChevronDown
                            className="w-3.5 h-3.5"
                            style={{ color: "var(--chevron)" }}
                        />
                    </button>

                    {dropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setDropdownOpen(false)}
                            />
                            <div
                                className="absolute right-0 top-full mt-2 w-52 shadow-xl z-20 p-1 rounded-2xl"
                                style={{
                                    background:  "var(--bg-surface)",
                                    border:      "1px solid var(--border-default)",
                                    boxShadow:   "0 16px 48px rgba(0,0,0,0.55)",
                                }}
                            >
                                <div
                                    className="px-3 py-2 mb-1"
                                    style={{ borderBottom: "1px solid var(--divider)" }}
                                >
                                    <p
                                        className="text-xs font-semibold"
                                        style={{ color: "var(--primary-light)" }}
                                    >
                                        {session?.user?.tenantName}
                                    </p>
                                    <p
                                        className="text-xs truncate"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {session?.user?.email}
                                    </p>
                                </div>
                                <button
                                    id="dropdown-signout-btn"
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
                                    style={{ color: "#f87171" }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = "rgba(239,68,68,0.08)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = "transparent")
                                    }
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

import { Topbar } from "@/components/layout/Topbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
    Users,
    Calendar,
    FileText,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

async function getDashboardData(tenantId: string) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [
        totalClients,
        appointmentsThisMonth,
        pendingAppointments,
        completedAppointments,
        pendingDocuments,
        revenue,
        recentClients,
        upcomingAppointments,
    ] = await Promise.all([
        prisma.client.count({ where: { tenantId, deletedAt: null } }),
        prisma.appointment.count({
            where: { tenantId, deletedAt: null, startTime: { gte: monthStart, lte: monthEnd } },
        }),
        prisma.appointment.count({ where: { tenantId, deletedAt: null, status: "PENDING" } }),
        prisma.appointment.count({ where: { tenantId, deletedAt: null, status: "COMPLETED" } }),
        prisma.document.count({ where: { tenantId, deletedAt: null, status: "PENDING_NOTARIZATION" } }),
        prisma.transaction.aggregate({
            where: { tenantId, deletedAt: null, paymentStatus: "PAID" },
            _sum: { amount: true },
        }),
        prisma.client.findMany({
            where: { tenantId, deletedAt: null },
            take: 5,
            orderBy: { createdAt: "desc" },
        }),
        prisma.appointment.findMany({
            where: { tenantId, deletedAt: null, startTime: { gte: now }, status: { not: "CANCELLED" } },
            take: 5,
            orderBy: { startTime: "asc" },
            include: { client: true },
        }),
    ]);

    return {
        totalClients,
        appointmentsThisMonth,
        pendingAppointments,
        completedAppointments,
        pendingDocuments,
        totalRevenue: revenue._sum.amount || 0,
        recentClients,
        upcomingAppointments,
    };
}

const statusColors: Record<string, string> = {
    PENDING: "badge-yellow",
    CONFIRMED: "badge-blue",
    COMPLETED: "badge-green",
    CANCELLED: "badge-red",
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const data = await getDashboardData(session.user.tenantId);
    const t = await getTranslations("Dashboard");

    const stats = [
        {
            id: "stat-clients",
            label: t("total_clients"),
            value: data.totalClients.toLocaleString(),
            icon: Users,
            color: "from-blue-600 to-blue-400",
            glow: "shadow-blue-500/20",
            change: "+12% this month",
            trend: "up",
        },
        {
            id: "stat-appointments",
            label: "Appointments This Month",
            value: data.appointmentsThisMonth.toLocaleString(),
            icon: Calendar,
            color: "from-indigo-600 to-indigo-400",
            glow: "shadow-indigo-500/20",
            change: `${data.pendingAppointments} pending`,
            trend: "neutral",
        },
        {
            id: "stat-revenue",
            label: t("revenue"),
            value: `$${data.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "from-emerald-600 to-emerald-400",
            glow: "shadow-emerald-500/20",
            change: `${data.completedAppointments} completed`,
            trend: "up",
        },
        {
            id: "stat-documents",
            label: t("total_documents"),
            value: data.pendingDocuments.toLocaleString(),
            icon: FileText,
            color: "from-amber-600 to-amber-400",
            glow: "shadow-amber-500/20",
            change: "Awaiting notarization",
            trend: data.pendingDocuments > 0 ? "alert" : "neutral",
        },
    ];

    return (
        <div>
            <Topbar
                title={`${t("welcome")}, ${session.user.firstName}! 👋`}
                subtitle={`${session.user.tenantName} · ${format(new Date(), "EEEE, MMMM d, yyyy")}`}
            />

            <div className="p-6 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.id} id={stat.id} className="stat-card group hover:scale-[1.01] transition-transform duration-300">
                                <div className="flex items-start justify-between">
                                    <div
                                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.glow}`}
                                    >
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        {stat.trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                                        {stat.trend === "alert" && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-white tracking-tight">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-0.5">{stat.label}</p>
                                </div>
                                <p className="text-xs text-slate-500">{stat.change}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Upcoming Appointments */}
                    <div className="xl:col-span-2 glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="section-title">Upcoming Appointments</h3>
                            <Link
                                href="/dashboard/appointments"
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                            >
                                View all →
                            </Link>
                        </div>

                        {data.upcomingAppointments.length === 0 ? (
                            <div className="text-center py-10">
                                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">No upcoming appointments</p>
                                <Link href="/dashboard/appointments" className="btn-primary mt-4 inline-flex">
                                    Schedule one
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.upcomingAppointments.map((apt: any) => (
                                    <div
                                        key={apt.id}
                                        className="flex items-center gap-4 p-3.5 rounded-xl bg-white/3 hover:bg-white/6 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-12 text-center">
                                            <p className="text-xs text-slate-500 font-medium uppercase">
                                                {format(new Date(apt.startTime), "MMM")}
                                            </p>
                                            <p className="text-xl font-bold text-white leading-none">
                                                {format(new Date(apt.startTime), "d")}
                                            </p>
                                        </div>
                                        <div className="w-px h-10 bg-white/10 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate">
                                                {apt.title}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                {apt.client.firstName} {apt.client.lastName} ·{" "}
                                                {format(new Date(apt.startTime), "h:mm a")}
                                            </p>
                                        </div>
                                        <span className={statusColors[apt.status] || "badge-blue"}>
                                            {apt.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Clients */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="section-title">Recent Clients</h3>
                            <Link
                                href="/dashboard/clients"
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                            >
                                View all →
                            </Link>
                        </div>

                        {data.recentClients.length === 0 ? (
                            <div className="text-center py-10">
                                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">No clients yet</p>
                                <Link href="/dashboard/clients" className="btn-primary mt-4 inline-flex">
                                    Add client
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.recentClients.map((client) => (
                                    <Link
                                        key={client.id}
                                        href={`/dashboard/clients/${client.id}`}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-slate-200 text-sm font-semibold flex-shrink-0 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all">
                                            {client.firstName[0]}
                                            {client.lastName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate">
                                                {client.firstName} {client.lastName}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {client.email || "No email"}
                                            </p>
                                        </div>
                                        <span className="text-xs text-slate-600 flex-shrink-0">
                                            {format(new Date(client.createdAt), "MMM d")}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

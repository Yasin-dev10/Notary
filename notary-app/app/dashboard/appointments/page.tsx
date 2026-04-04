"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    Calendar,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Clock,
    MapPin,
    User,
    Loader2,
    Filter,
} from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from "date-fns";
import AddAppointmentModal from "@/components/appointments/AddAppointmentModal";
import AppointmentDetailModal from "@/components/appointments/AppointmentDetailModal";
import { FileText } from "lucide-react";

interface Appointment {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    status: string;
    location: string | null;
    client: { id: string; firstName: string; lastName: string };
    notary: { id: string; firstName: string; lastName: string } | null;
    _count?: { documents: number };
}

const STATUS_OPTIONS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const statusColors: Record<string, string> = {
    PENDING: "badge-yellow",
    CONFIRMED: "badge-blue",
    COMPLETED: "badge-green",
    CANCELLED: "badge-red",
};

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 15;

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(statusFilter !== "ALL" && { status: statusFilter }),
            });
            const res = await fetch(`/api/appointments?${params}`);
            const data = await res.json();
            setAppointments(data.appointments || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Calendar view helpers
    const monthDays = eachDayOfInterval({
        start: startOfMonth(calendarDate),
        end: endOfMonth(calendarDate),
    });
    const startPad = getDay(startOfMonth(calendarDate));

    const getAppointmentsForDay = (day: Date) =>
        appointments.filter((a) => isSameDay(new Date(a.startTime), day));

    return (
        <div>
            <Topbar title="Appointments" subtitle="Schedule and manage appointments" />
            <div className="p-6 space-y-5">
                {/* Controls */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* View toggle */}
                        <div className="flex items-center gap-1 p-1 glass-card rounded-xl">
                            <button
                                id="list-view-btn"
                                onClick={() => setViewMode("list")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "list"
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                List
                            </button>
                            <button
                                id="calendar-view-btn"
                                onClick={() => setViewMode("calendar")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "calendar"
                                        ? "bg-indigo-600 text-white"
                                        : "text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                Calendar
                            </button>
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-1.5">
                            {STATUS_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    id={`filter-${s.toLowerCase()}-btn`}
                                    onClick={() => { setStatusFilter(s); setPage(1); }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${statusFilter === s
                                            ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/8"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        id="add-appointment-btn"
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary flex-shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Schedule Appointment
                    </button>
                </div>

                {/* Calendar View */}
                {viewMode === "calendar" && (
                    <div className="glass-card p-5">
                        {/* Calendar nav */}
                        <div className="flex items-center justify-between mb-5">
                            <button
                                id="prev-month-btn"
                                onClick={() => setCalendarDate((d) => subMonths(d, 1))}
                                className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-slate-200 transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <h3 className="text-base font-semibold text-white">
                                {format(calendarDate, "MMMM yyyy")}
                            </h3>
                            <button
                                id="next-month-btn"
                                onClick={() => setCalendarDate((d) => addMonths(d, 1))}
                                className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-slate-200 transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                                <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: startPad }).map((_, i) => (
                                <div key={`pad-${i}`} className="h-20 rounded-xl" />
                            ))}
                            {monthDays.map((day) => {
                                const dayApts = getAppointmentsForDay(day);
                                const today = isToday(day);
                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={`h-20 rounded-xl p-1.5 border transition-all ${today
                                                ? "border-indigo-500/50 bg-indigo-600/10"
                                                : "border-white/5 hover:border-white/15 hover:bg-white/3"
                                            }`}
                                    >
                                        <p
                                            className={`text-xs font-medium mb-1 ${today ? "text-indigo-400" : "text-slate-400"
                                                }`}
                                        >
                                            {format(day, "d")}
                                        </p>
                                        <div className="space-y-0.5">
                                            {dayApts.slice(0, 2).map((apt) => (
                                                <div
                                                    key={apt.id}
                                                    className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/40 text-indigo-200 truncate"
                                                >
                                                    {format(new Date(apt.startTime), "h:mm")} {apt.title}
                                                </div>
                                            ))}
                                            {dayApts.length > 2 && (
                                                <p className="text-[10px] text-slate-500">+{dayApts.length - 2} more</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/8">
                                        <th className="table-header text-left">Appointment</th>
                                        <th className="table-header text-left">Client</th>
                                        <th className="table-header text-left">Date & Time</th>
                                        <th className="table-header text-left">Location</th>
                                        <th className="table-header text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : appointments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <Calendar className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                                <p className="text-slate-400 text-sm">No appointments found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        appointments.map((apt) => (
                                            <tr 
                                                key={apt.id} 
                                                className="table-row cursor-pointer group"
                                                onClick={() => setSelectedAppointmentId(apt.id)}
                                            >
                                                <td className="table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">{apt.title}</p>
                                                        {apt._count && apt._count.documents > 0 && (
                                                            <span className="badge-blue text-[10px] py-0 px-1.5 flex items-center gap-1" title={`${apt._count.documents} pre-screening docs`}>
                                                                <FileText className="w-3 h-3" /> {apt._count.documents}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {apt.description && (
                                                        <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                                                            {apt.description}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
                                                            {apt.client.firstName[0]}{apt.client.lastName[0]}
                                                        </div>
                                                        <span className="text-sm text-slate-300">
                                                            {apt.client.firstName} {apt.client.lastName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                        <div>
                                                            <p className="text-sm text-slate-300">
                                                                {format(new Date(apt.startTime), "MMM d, yyyy")}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {format(new Date(apt.startTime), "h:mm a")} – {format(new Date(apt.endTime), "h:mm a")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="table-cell">
                                                    {apt.location ? (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {apt.location}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-600 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="table-cell">
                                                    <span className={statusColors[apt.status] || "badge-blue"}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {Math.ceil(total / limit) > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-white/8">
                                <p className="text-xs text-slate-500">
                                    {total} total appointments
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all disabled:opacity-30"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs text-slate-400">{page}</span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(Math.ceil(total / limit), p + 1))}
                                        disabled={page === Math.ceil(total / limit)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all disabled:opacity-30"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddAppointmentModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { setShowAddModal(false); fetchAppointments(); }}
                />
            )}

            {selectedAppointmentId && (
                <AppointmentDetailModal
                    appointmentId={selectedAppointmentId}
                    onClose={() => setSelectedAppointmentId(null)}
                    onUpdate={fetchAppointments}
                />
            )}
        </div>
    );
}

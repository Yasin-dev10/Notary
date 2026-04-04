"use client";

import { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { 
    Activity, 
    User, 
    Globe, 
    Monitor, 
    Info, 
    Clock, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    Search 
} from "lucide-react";
import { format } from "date-fns";

interface Log {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    user: { firstName: string, lastName: string, role: string } | null;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 30;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/activity-logs?page=${page}&limit=${limit}`);
            const data = await res.json();
            if (res.ok) {
                setLogs(data.logs || []);
                setTotal(data.total || 0);
            }
        } catch (err) {
            console.error("Audit log fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <Topbar title="Audit Trail" subtitle="System-wide activity monitoring" />
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-bold text-white">System Activities</h2>
                        <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20 font-bold ml-2">
                            {total} total records
                        </span>
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/8 bg-white/[0.02]">
                                    <th className="table-header text-left">Action</th>
                                    <th className="table-header text-left">User</th>
                                    <th className="table-header text-left">Entity</th>
                                    <th className="table-header text-left">Details</th>
                                    <th className="table-header text-left">Digital Info</th>
                                    <th className="table-header text-left">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && logs.length === 0 ? (
                                    <tr><td colSpan={6} className="py-24 text-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" /></td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan={6} className="py-24 text-center text-slate-500 italic">No activity logs found.</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="table-row border-b border-white/[0.04] last:border-0">
                                            <td className="table-cell">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${getActionColor(log.action)}`}>
                                                        {log.action[0]}
                                                    </div>
                                                    <span className="font-semibold text-slate-200">
                                                        {log.action.replace("_", " ")}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                {log.user ? (
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-medium text-slate-300">{log.user.firstName} {log.user.lastName}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{log.user.role}</p>
                                                    </div>
                                                ) : <span className="text-slate-600 text-xs italic">System</span>}
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs bg-slate-800 text-slate-400 w-fit px-1.5 py-0.5 rounded border border-white/5 uppercase font-bold tracking-tighter">
                                                        {log.entity}
                                                    </span>
                                                    {log.entityId && <span className="text-[10px] text-slate-600 font-mono truncate max-w-[80px]">{log.entityId}</span>}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <p className="text-xs text-slate-400 max-w-[240px] truncate" title={log.details || ""}>
                                                    {log.details || "—"}
                                                </p>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    {log.ipAddress && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500" title="IP Address">
                                                            <Globe className="w-3 h-3" />
                                                            {log.ipAddress}
                                                        </div>
                                                    )}
                                                    {log.userAgent && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-300" title="Source">
                                                            <Monitor className="w-3 h-3 text-slate-500" />
                                                            <span className="truncate max-w-[60px]">{log.userAgent.split(' ')[0]}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                    {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 bg-white/[0.01]">
                            <p className="text-xs text-slate-500">Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} records</p>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg border border-white/8 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-bold text-slate-300 min-w-[3rem] text-center">{page} / {totalPages}</span>
                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded-lg border border-white/8 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getActionColor(action: string): string {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('UPLOAD')) return 'bg-emerald-500/20 text-emerald-400';
    if (act.includes('DELETE')) return 'bg-red-500/20 text-red-400';
    if (act.includes('UPDATE')) return 'bg-amber-500/20 text-amber-400';
    if (act.includes('LOGIN')) return 'bg-blue-500/20 text-blue-400';
    return 'bg-indigo-500/20 text-indigo-400';
}

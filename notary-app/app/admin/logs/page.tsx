"use client";

import { 
    Shield, 
    ShieldCheck, 
    ShieldAlert, 
    Clock, 
    User, 
    Building2, 
    Activity, 
    Download,
    Search,
    Filter,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { useState, useEffect } from "react";

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    tenant: {
        name: string;
        slug: string;
    } | null;
}

export default function GlobalAuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        // In a real app, this would fetch from /api/admin/audit
        // Simulating logs for demonstration
        setTimeout(() => {
            const mockLogs: AuditLog[] = [
                {
                    id: "1",
                    action: "TENANT_CREATED",
                    entity: "Tenant",
                    details: "Created 'Golden Gate Notary' office",
                    ipAddress: "192.168.1.45",
                    createdAt: new Date().toISOString(),
                    user: { firstName: "Super", lastName: "Admin", email: "admin@notarypro.so" },
                    tenant: { name: "Golden Gate Notary", slug: "golden-gate" }
                },
                {
                    id: "2",
                    action: "SUBSCRIPTION_UPGRADED",
                    entity: "Tenant",
                    details: "Upgraded 'Westside Law' to Premium Plan",
                    ipAddress: "192.168.1.102",
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    user: { firstName: "John", lastName: "Agent", email: "john@notarypro.so" },
                    tenant: { name: "Westside Law", slug: "westside" }
                },
                {
                    id: "3",
                    action: "SYSTEM_SETTINGS_UPDATE",
                    entity: "SystemSetting",
                    details: "Updated global commission rate to 15.0%",
                    ipAddress: "10.0.0.12",
                    createdAt: new Date(Date.now() - 7200000).toISOString(),
                    user: { firstName: "Super", lastName: "Admin", email: "admin@notarypro.so" },
                    tenant: null
                },
                {
                    id: "4",
                    action: "LOGIN_FAILURE",
                    entity: "User",
                    details: "Multiple failed login attempts detected",
                    ipAddress: "45.12.89.201",
                    createdAt: new Date(Date.now() - 10800000).toISOString(),
                    user: null,
                    tenant: { name: "Central Notary", slug: "central" }
                }
            ];
            setLogs(mockLogs);
            setLoading(false);
        }, 1000);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Global Audit Universe</h1>
                    <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">
                        Trace every high-level action, security event, and system modification across the entire platform.
                    </p>
                </div>
                <button className="flex items-center justify-center px-6 py-3 bg-white border border-gray-100 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-50 shadow-sm transition-all">
                    <Download size={18} className="mr-2" />
                    Export Audit Trail
                </button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Critical Alerts", value: "3", icon: ShieldAlert, color: "text-red-600 bg-red-100/50" },
                    { label: "Daily System Events", value: "1,245", icon: Activity, color: "text-indigo-600 bg-indigo-100/50" },
                    { label: "Active Sessions", value: "84", icon: User, color: "text-green-600 bg-green-100/50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
                        <div className={`p-4 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Logs Interface */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-[2.5rem] overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search logs by user, tenant, or action..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all font-bold text-sm flex items-center gap-2">
                            <Filter size={18} />
                            Categories
                        </button>
                        <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all">
                            <Clock size={18} />
                        </button>
                    </div>
                </div>

                <div className="min-h-[500px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-full animate-bounce">
                                <ShieldCheck size={32} className="text-indigo-600" />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Compiling audit data...</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {logs.map((log) => (
                                <div key={log.id} className="p-8 hover:bg-gray-50/50 transition-all flex flex-col lg:flex-row lg:items-center gap-6 group">
                                    <div className="flex-shrink-0 flex items-center gap-4 lg:w-48">
                                        <div className={`p-3 rounded-2xl ${
                                            log.action.includes('FAILURE') || log.action.includes('REJECT')
                                                ? 'bg-red-50 text-red-600'
                                                : log.action.includes('CREATE')
                                                ? 'bg-green-50 text-green-600'
                                                : 'bg-indigo-50 text-indigo-600'
                                        }`}>
                                            <Shield size={20} />
                                        </div>
                                        <div className="text-xs font-black tracking-tighter uppercase truncate overflow-hidden">
                                            {log.action.replace(/_/g, ' ')}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            {log.tenant ? (
                                                <span className="flex items-center text-[10px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded uppercase tracking-[0.1em]">
                                                    {log.tenant.slug}
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-[10px] font-black text-white bg-gray-900 px-2 py-0.5 rounded uppercase tracking-[0.1em]">
                                                    SYSTEM
                                                </span>
                                            )}
                                            <time className="text-xs font-bold text-gray-400 italic">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </time>
                                        </div>
                                        <p className="text-sm font-bold text-gray-700 line-clamp-1">{log.details}</p>
                                    </div>

                                    <div className="flex flex-shrink-0 items-center gap-6 lg:border-l lg:pl-6 border-gray-100">
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-gray-900 mb-0.5">
                                                {log.user ? `${log.user.firstName} ${log.user.lastName}` : "Auth System"}
                                            </div>
                                            <div className="text-[10px] font-medium text-gray-400">{log.ipAddress}</div>
                                        </div>
                                        <button className="p-2.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-100 rounded-xl hover:bg-gray-50 shadow-sm">
                                            <ArrowUpRight size={16} className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-8 bg-gray-50/50 flex items-center justify-center border-t border-gray-100">
                    <button className="text-sm font-black text-indigo-600 hover:text-indigo-700 tracking-widest uppercase py-3 px-8 rounded-2xl bg-white border border-indigo-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                        Load Historical Archives
                    </button>
                </div>
            </div>
        </div>
    );
}

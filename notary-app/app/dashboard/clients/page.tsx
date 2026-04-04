"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    Users,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import AddClientModal from "@/components/clients/AddClientModal";

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    createdAt: string;
    _count: { appointments: number; documents: number; transactions: number };
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const limit = 15;

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
            });
            const res = await fetch(`/api/clients?${params}`);
            const data = await res.json();
            setClients(data.clients || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        const timer = setTimeout(fetchClients, 300);
        return () => clearTimeout(timer);
    }, [fetchClients]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <Topbar title="Clients" subtitle="Manage your client database" />
            <div className="p-6 space-y-5">
                {/* Header actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            id="client-search"
                            type="text"
                            placeholder="Search clients..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="input-field pl-9"
                        />
                    </div>
                    <button
                        id="add-client-btn"
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary flex-shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Add Client
                    </button>
                </div>

                {/* Summary */}
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{total} total clients</span>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/8">
                                    <th className="table-header text-left">Client</th>
                                    <th className="table-header text-left">Contact</th>
                                    <th className="table-header text-left">Location</th>
                                    <th className="table-header text-center">Appointments</th>
                                    <th className="table-header text-center">Documents</th>
                                    <th className="table-header text-left">Added</th>
                                    <th className="table-header text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : clients.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-400 text-sm">
                                                {search ? "No clients found" : "No clients yet. Add your first client!"}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    clients.map((client) => (
                                        <tr key={client.id} className="table-row">
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-slate-200 text-sm font-semibold flex-shrink-0">
                                                        {client.firstName[0]}{client.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-200">
                                                            {client.firstName} {client.lastName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="space-y-1">
                                                    {client.email && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <Mail className="w-3 h-3" />
                                                            {client.email}
                                                        </div>
                                                    )}
                                                    {client.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                            <Phone className="w-3 h-3" />
                                                            {client.phone}
                                                        </div>
                                                    )}
                                                    {!client.email && !client.phone && (
                                                        <span className="text-slate-600 text-xs">—</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <span className="text-slate-400 text-xs">
                                                    {[client.city, client.state].filter(Boolean).join(", ") || "—"}
                                                </span>
                                            </td>
                                            <td className="table-cell text-center">
                                                <span className="badge-blue">
                                                    {client._count.appointments}
                                                </span>
                                            </td>
                                            <td className="table-cell text-center">
                                                <span className="badge-purple">
                                                    {client._count.documents}
                                                </span>
                                            </td>
                                            <td className="table-cell text-xs text-slate-500">
                                                {format(new Date(client.createdAt), "MMM d, yyyy")}
                                            </td>
                                            <td className="table-cell text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/dashboard/clients/${client.id}`}
                                                        id={`view-client-${client.id}`}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-white/8">
                            <p className="text-xs text-slate-500">
                                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    id="prev-page-btn"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-slate-400 px-2">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    id="next-page-btn"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <AddClientModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { setShowAddModal(false); fetchClients(); }}
                />
            )}
        </div>
    );
}

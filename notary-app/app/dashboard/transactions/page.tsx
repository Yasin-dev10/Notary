"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    CreditCard,
    Plus,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    TrendingUp,
    Loader2,
    Receipt,
} from "lucide-react";
import { format } from "date-fns";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import { InvoiceModal } from "@/components/transactions/InvoiceModal";
import { LocalPaymentModal } from "@/components/transactions/LocalPaymentModal";
import { Eye, Smartphone } from "lucide-react";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    currency: string;
    paymentStatus: string;
    paymentMethod: string | null;
    createdAt: string;
    client: { id: string; firstName: string; lastName: string } | null;
    appointment: { id: string; title: string } | null;
    processedBy: { id: string; firstName: string; lastName: string } | null;
}

const STATUS_OPTIONS = ["ALL", "UNPAID", "PAID", "REFUNDED", "PARTIALLY_PAID"];

const statusStyle: Record<string, string> = {
    UNPAID: "badge-red",
    PAID: "badge-green",
    REFUNDED: "badge-yellow",
    PARTIALLY_PAID: "badge-blue",
};

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [total, setTotal] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [outstandingTotal, setOutstandingTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const limit = 15;

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(statusFilter !== "ALL" && { status: statusFilter }),
            });
            const res = await fetch(`/api/transactions?${params}`);
            const data = await res.json();
            setTransactions(data.transactions || []);
            setTotal(data.total || 0);
            setRevenue(data.revenue || 0);
            setOutstandingTotal(data.outstanding || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const collectedOnPage = transactions.filter((t) => t.paymentStatus === "PAID").reduce((s, t) => s + t.amount, 0);

    return (
        <div>
            <Topbar title="Transactions" subtitle="Track service fees and payment history" />
            <div className="p-6 space-y-5">
                {/* Summary stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="stat-card">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-1">
                            <DollarSign className="w-4.5 h-4.5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                            ${revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-400">Total Revenue (Paid)</p>
                    </div>
                    <div className="stat-card">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-1">
                            <TrendingUp className="w-4.5 h-4.5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                            ${collectedOnPage.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-400">Collected (Current Page)</p>
                    </div>
                    <div className="stat-card">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-400 flex items-center justify-center shadow-lg shadow-red-500/20 mb-1">
                            <Receipt className="w-4.5 h-4.5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-white">
                            ${outstandingTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-400">Total Outstanding</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {STATUS_OPTIONS.map((s) => (
                            <button
                                key={s}
                                id={`txn-filter-${s.toLowerCase()}-btn`}
                                onClick={() => { setStatusFilter(s); setPage(1); }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${statusFilter === s
                                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/8"
                                    }`}
                            >
                                {s.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                    <button
                        id="add-transaction-btn"
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary flex-shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Record Transaction
                    </button>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/8">
                                    <th className="table-header text-left">Description</th>
                                    <th className="table-header text-left">Client</th>
                                    <th className="table-header text-left">Appointment</th>
                                    <th className="table-header text-right">Amount</th>
                                    <th className="table-header text-left">Method</th>
                                    <th className="table-header text-left">Status</th>
                                    <th className="table-header text-left">Date</th>
                                    <th className="table-header text-left">Processed By</th>
                                    <th className="table-header text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={8} className="py-20 text-center"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" /></td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center">
                                            <CreditCard className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-400 text-sm">No transactions found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((txn) => (
                                        <tr key={txn.id} className="table-row">
                                            <td className="table-cell">
                                                <p className="font-medium text-slate-200 text-sm">{txn.description}</p>
                                            </td>
                                            <td className="table-cell">
                                                {txn.client ? (
                                                    <span className="text-sm text-slate-300">
                                                        {txn.client.firstName} {txn.client.lastName}
                                                    </span>
                                                ) : <span className="text-slate-600 text-xs">—</span>}
                                            </td>
                                            <td className="table-cell">
                                                {txn.appointment ? (
                                                    <span className="text-xs text-slate-400 truncate max-w-[120px] block">{txn.appointment.title}</span>
                                                ) : <span className="text-slate-600 text-xs">—</span>}
                                            </td>
                                            <td className="table-cell text-right">
                                                <span className={`font-semibold ${txn.paymentStatus === "PAID" ? "text-emerald-400" : "text-slate-200"}`}>
                                                    {txn.currency} {txn.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="table-cell text-xs text-slate-400">
                                                {txn.paymentMethod || "—"}
                                            </td>
                                            <td className="table-cell">
                                                <span className={statusStyle[txn.paymentStatus] || "badge-yellow"}>
                                                    {txn.paymentStatus.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="table-cell text-xs text-slate-500">
                                                {format(new Date(txn.createdAt), "MMM d, yyyy")}
                                            </td>
                                            <td className="table-cell">
                                                {txn.processedBy ? (
                                                    <span className="text-xs text-slate-400">
                                                        {txn.processedBy.firstName} {txn.processedBy.lastName}
                                                    </span>
                                                ) : <span className="text-slate-600 text-xs">—</span>}
                                            </td>
                                            <td className="table-cell text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {txn.paymentStatus !== "PAID" && (
                                                        <button
                                                            onClick={() => { setSelectedTxn(txn); setIsPaymentModalOpen(true); }}
                                                            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all inline-flex border border-emerald-500/20 bg-emerald-500/5 shadow-sm"
                                                            title="Take Payment (Local)"
                                                        >
                                                            <Smartphone className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { setSelectedTxn(txn); setIsInvoiceModalOpen(true); }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all inline-flex"
                                                        title="View Invoice"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {Math.ceil(total / limit) > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-white/8">
                            <p className="text-xs text-slate-500">{total} transactions</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all disabled:opacity-30">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-slate-400">{page}</span>
                                <button onClick={() => setPage((p) => Math.min(Math.ceil(total / limit), p + 1))} disabled={page === Math.ceil(total / limit)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all disabled:opacity-30">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <AddTransactionModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { setShowAddModal(false); fetchTransactions(); }}
                />
            )}

            {selectedTxn && (
                <InvoiceModal
                    isOpen={isInvoiceModalOpen}
                    onClose={() => setIsInvoiceModalOpen(false)}
                    transaction={{
                        id: selectedTxn.id,
                        description: selectedTxn.description,
                        amount: selectedTxn.amount,
                        currency: selectedTxn.currency,
                        paymentStatus: selectedTxn.paymentStatus,
                        paymentMethod: selectedTxn.paymentMethod,
                        createdAt: selectedTxn.createdAt,
                        client: selectedTxn.client ? { firstName: selectedTxn.client.firstName, lastName: selectedTxn.client.lastName } : null,
                        processedBy: selectedTxn.processedBy ? { firstName: selectedTxn.processedBy.firstName, lastName: selectedTxn.processedBy.lastName } : null,
                    }}
                />
            )}

            {selectedTxn && (
                <LocalPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={() => { setIsPaymentModalOpen(false); fetchTransactions(); }}
                    transactionId={selectedTxn.id}
                    amount={selectedTxn.amount}
                    currency={selectedTxn.currency}
                    description={selectedTxn.description}
                />
            )}
        </div>
    );
}

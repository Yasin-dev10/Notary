"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CreditCard } from "lucide-react";

interface AddTransactionModalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: {
        clientId?: string;
        appointmentId?: string;
        description?: string;
    };
}

interface Client {
    id: string;
    firstName: string;
    lastName: string;
}

export default function AddTransactionModal({ onClose, onSuccess, initialData }: AddTransactionModalProps) {
    const [form, setForm] = useState({
        description: initialData?.description || "",
        amount: "",
        currency: "USD",
        paymentStatus: "UNPAID",
        paymentMethod: "",
        clientId: initialData?.clientId || "",
        appointmentId: initialData?.appointmentId || "",
        notes: "",
    });
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/clients?limit=100")
            .then((r) => r.json())
            .then((d) => setClients(d.clients || []))
            .catch(() => { });
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    amount: parseFloat(form.amount),
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to record transaction");
                return;
            }
            onSuccess();
        } catch {
            setError("Unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md glass-card p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center">
                            <CreditCard className="w-4.5 h-4.5 text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Record Transaction</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Description *</label>
                        <input name="description" value={form.description} onChange={handleChange} placeholder="Deed notarization fee" className="input-field" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Amount *</label>
                            <input name="amount" type="number" step="0.01" min="0" value={form.amount} onChange={handleChange} placeholder="150.00" className="input-field" required />
                        </div>
                        <div>
                            <label className="label">Currency</label>
                            <select name="currency" value={form.currency} onChange={handleChange} className="input-field">
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                                <option value="CAD">CAD</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Client</label>
                        <select name="clientId" value={form.clientId} onChange={handleChange} className="input-field">
                            <option value="">Select a client (optional)</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Payment Status</label>
                            <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange} className="input-field">
                                <option value="UNPAID">Unpaid</option>
                                <option value="PAID">Paid</option>
                                <option value="PARTIALLY_PAID">Partially Paid</option>
                                <option value="REFUNDED">Refunded</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Payment Method</label>
                            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="input-field">
                                <option value="">Select method</option>
                                <option value="Cash">Cash</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Check">Check</option>
                                <option value="Venmo">Venmo</option>
                                <option value="Zelle">Zelle</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="input-field resize-none" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} id="save-transaction-btn" className="btn-primary">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Transaction"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { X, Smartphone, Loader2 } from "lucide-react";

interface LocalPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    transactionId: string;
    amount: number;
    currency: string;
    description: string;
}

export function LocalPaymentModal({
    isOpen,
    onClose,
    onSuccess,
    transactionId,
    amount,
    currency,
    description
}: LocalPaymentModalProps) {
    const [provider, setProvider] = useState("EVC_PLUS");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (phoneNumber.length < 6) {
            setError("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/payments/local", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transactionId,
                    provider,
                    phoneNumber,
                }),
            });
            const data = await res.json();
            
            if (!res.ok) {
                setError(data.error || "Payment failed");
                return;
            }

            // Simulate a short delay to show "success" state before closing
            setTimeout(() => {
                onSuccess();
            }, 600);
        } catch (err) {
            setError("Unexpected error processing payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
            <div className="relative w-full max-w-sm glass-card p-6 shadow-2xl border border-emerald-500/20">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center">
                            <Smartphone className="w-4.5 h-4.5 text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Mobile Money</h2>
                    </div>
                    {!loading && (
                        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-sm text-slate-400 mb-1">{description}</p>
                    <p className="text-2xl font-bold text-white">{currency} {amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Provider</label>
                        <select 
                            value={provider} 
                            onChange={(e) => setProvider(e.target.value)} 
                            className="input-field"
                            disabled={loading}
                        >
                            <option value="EVC_PLUS">EVC Plus</option>
                            <option value="PREMIER_WALLET">Premier Wallet</option>
                            <option value="SAHAL">Sahal</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Phone Number *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">+252</span>
                            <input 
                                type="tel" 
                                value={phoneNumber} 
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                                placeholder="61XXXXXXX" 
                                className="input-field pl-14" 
                                required 
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary w-full max-w-[140px] justify-center">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                                    Pushing...
                                </>
                            ) : "Pay Now"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

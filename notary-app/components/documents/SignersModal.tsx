"use client";

import { useState, useEffect, useCallback } from "react";
import {
    X, Users, Plus, Trash2, Send, Loader2, Check,
    ChevronUp, ChevronDown, AlertCircle, CheckCircle,
    Clock, Copy, ExternalLink,
} from "lucide-react";

interface Signer {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    order: number;
    status: string;
    token: string;
}

interface SignersModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    documentName: string;
}

const ROLES = ["CLIENT", "NOTARY", "WITNESS", "OTHER"];

const statusColor: Record<string, string> = {
    PENDING: "badge-yellow",
    NOTIFIED: "badge-blue",
    COMPLETED: "badge-green",
};

const statusIcon: Record<string, React.ReactNode> = {
    PENDING: <Clock className="w-3 h-3" />,
    NOTIFIED: <AlertCircle className="w-3 h-3" />,
    COMPLETED: <CheckCircle className="w-3 h-3" />,
};

export function SignersModal({ isOpen, onClose, documentId, documentName }: SignersModalProps) {
    const [signers, setSigners] = useState<Signer[]>([]);
    const [loading, setLoading] = useState(false);
    const [notifying, setNotifying] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [notifyResult, setNotifyResult] = useState<{ signingUrl: string; name: string } | null>(null);

    // New signer form
    const [form, setForm] = useState({ name: "", email: "", phone: "", role: "CLIENT" });
    const [addingSignerLoading, setAddingSignerLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchSigners = useCallback(async () => {
        if (!documentId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/documents/${documentId}/signers`);
            const data = await res.json();
            setSigners(data.signers || []);
        } catch {
            console.error("Failed to fetch signers");
        } finally {
            setLoading(false);
        }
    }, [documentId]);

    useEffect(() => {
        if (isOpen) { fetchSigners(); setNotifyResult(null); }
    }, [isOpen, fetchSigners]);

    const handleAddSigner = async () => {
        setFormError("");
        if (!form.name.trim()) { setFormError("Name is required"); return; }
        if (!form.email && !form.phone) { setFormError("Provide at least an email or phone"); return; }

        setAddingSignerLoading(true);
        try {
            const res = await fetch(`/api/documents/${documentId}/signers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form }),
            });
            if (!res.ok) {
                const d = await res.json();
                setFormError(d.error || "Failed to add signer");
                return;
            }
            setForm({ name: "", email: "", phone: "", role: "CLIENT" });
            await fetchSigners();
        } catch {
            setFormError("Network error");
        } finally {
            setAddingSignerLoading(false);
        }
    };

    const handleDeleteSigner = async (signerId: string) => {
        if (!confirm("Remove this signer?")) return;
        try {
            await fetch(`/api/documents/${documentId}/signers?signerId=${signerId}`, { method: "DELETE" });
            await fetchSigners();
        } catch {
            alert("Failed to remove signer");
        }
    };

    const handleNotifyNext = async () => {
        setNotifying(true);
        setNotifyResult(null);
        try {
            const res = await fetch(`/api/documents/${documentId}/signers/notify`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Failed to notify signer");
                return;
            }
            if (data.message) {
                alert(data.message); // "All signers complete"
                return;
            }
            setNotifyResult({ signingUrl: data.signingUrl, name: data.notifiedSigner.name });
            await fetchSigners();
        } catch {
            alert("Network error");
        } finally {
            setNotifying(false);
        }
    };

    const copyLink = (url: string, id: string) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const allComplete = signers.length > 0 && signers.every(s => s.status === "COMPLETED");
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-5 border-b border-white/8 flex items-center justify-between bg-white/3 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Multi-Party Signers
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{documentName}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">

                    {/* Notify Result Banner */}
                    {notifyResult && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                {notifyResult.name} has been notified
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    readOnly
                                    value={notifyResult.signingUrl}
                                    className="flex-1 text-xs bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-slate-300 font-mono"
                                />
                                <button
                                    onClick={() => copyLink(notifyResult.signingUrl, "result")}
                                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                    title="Copy link"
                                >
                                    {copiedId === "result" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <a href={notifyResult.signingUrl} target="_blank" rel="noreferrer"
                                    className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* All Complete Banner */}
                    {allComplete && (
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center">
                            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                            <p className="text-white font-semibold text-sm">All signatures collected!</p>
                            <p className="text-slate-400 text-xs mt-1">The document is now pending notarization.</p>
                        </div>
                    )}

                    {/* Existing Signers */}
                    <div>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Signers ({signers.length})
                        </h3>

                        {loading ? (
                            <div className="py-8 text-center">
                                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                            </div>
                        ) : signers.length === 0 ? (
                            <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                                <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">No signers added yet</p>
                                <p className="text-slate-600 text-xs">Add signers below to begin the workflow</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {signers.map((signer, i) => {
                                    const signingUrl = `${baseUrl}/sign/${signer.token}`;
                                    return (
                                        <div key={signer.id}
                                            className="flex items-center gap-3 p-3.5 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 transition-all group">
                                            {/* Order badge */}
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                                                {signer.order}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-200">{signer.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-slate-500 uppercase">{signer.role}</span>
                                                    {signer.email && <span className="text-[10px] text-slate-600">· {signer.email}</span>}
                                                    {signer.phone && <span className="text-[10px] text-slate-600">· {signer.phone}</span>}
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <span className={`${statusColor[signer.status] || "badge-yellow"} flex items-center gap-1 flex-shrink-0 text-[11px]`}>
                                                {statusIcon[signer.status]}
                                                {signer.status}
                                            </span>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => copyLink(signingUrl, signer.id)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                                    title="Copy signing link"
                                                >
                                                    {copiedId === signer.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                                {signer.status !== "COMPLETED" && (
                                                    <button
                                                        onClick={() => handleDeleteSigner(signer.id)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                        title="Remove signer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Add Signer Form */}
                    {!allComplete && (
                        <div className="p-4 rounded-xl border border-white/8 bg-white/2 space-y-3">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Signer</h3>

                            {formError && (
                                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    placeholder="Full Name *"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="input-field col-span-2"
                                />
                                <input
                                    placeholder="Email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input-field"
                                />
                                <input
                                    placeholder="Phone"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="input-field"
                                />
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    className="input-field"
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <button
                                    onClick={handleAddSigner}
                                    disabled={addingSignerLoading}
                                    className="btn-primary justify-center"
                                >
                                    {addingSignerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Add Signer
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer — Notify Button */}
                {!allComplete && signers.length > 0 && (
                    <div className="p-4 border-t border-white/8 bg-white/3 flex-shrink-0">
                        <button
                            id="notify-next-signer-btn"
                            onClick={handleNotifyNext}
                            disabled={notifying}
                            className="btn-primary w-full justify-center py-3 shadow-lg shadow-indigo-500/20"
                        >
                            {notifying ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Notify Next Signer via SMS / Email
                        </button>
                        <p className="text-center text-[11px] text-slate-600 mt-2">
                            Sends a unique signing link to the next pending signer in order
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

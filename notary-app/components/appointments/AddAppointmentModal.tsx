"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar } from "lucide-react";

interface AddAppointmentModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface Client {
    id: string;
    firstName: string;
    lastName: string;
}

export default function AddAppointmentModal({ onClose, onSuccess }: AddAppointmentModalProps) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        clientId: "",
        startTime: "",
        endTime: "",
        location: "",
        status: "PENDING",
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
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to create appointment");
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
            <div className="relative w-full max-w-lg glass-card p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
                            <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Schedule Appointment</h2>
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
                        <label className="label">Title *</label>
                        <input name="title" value={form.title} onChange={handleChange} placeholder="Deed notarization" className="input-field" required />
                    </div>

                    <div>
                        <label className="label">Client *</label>
                        <select name="clientId" value={form.clientId} onChange={handleChange} className="input-field" required>
                            <option value="">Select a client</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.firstName} {c.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Start Time *</label>
                            <input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} className="input-field" required />
                        </div>
                        <div>
                            <label className="label">End Time *</label>
                            <input name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} className="input-field" required />
                        </div>
                    </div>

                    <div>
                        <label className="label">Location</label>
                        <input name="location" value={form.location} onChange={handleChange} placeholder="Office, Zoom, etc." className="input-field" />
                    </div>

                    <div>
                        <label className="label">Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className="input-field">
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="input-field resize-none" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} id="save-appointment-btn" className="btn-primary">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Appointment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

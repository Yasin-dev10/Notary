"use client";

import { useState } from "react";
import { X, Loader2, User, Upload, CheckCircle2 } from "lucide-react";

interface AddClientModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddClientModal({ onClose, onSuccess }: AddClientModalProps) {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
        idType: "",
        idNumber: "",
        idImageUrl: "",
        notes: "",
    });
    const [idPhoto, setIdPhoto] = useState<File | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to create client");
                return;
            }
            onSuccess();
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-2xl glass-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
                            <User className="w-4.5 h-4.5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Add New Client</h2>
                            <p className="text-xs text-slate-400">Fill in the client details below</p>
                        </div>
                    </div>
                    <button
                        id="close-modal-btn"
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Personal Info */}
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Personal Information
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">First Name *</label>
                                <input name="firstName" value={form.firstName} onChange={handleChange} className="input-field" required />
                            </div>
                            <div>
                                <label className="label">Last Name *</label>
                                <input name="lastName" value={form.lastName} onChange={handleChange} className="input-field" required />
                            </div>
                            <div>
                                <label className="label">Email</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="label">Phone</label>
                                <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Address
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="label">Street Address</label>
                                <input name="address" value={form.address} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="label">City</label>
                                <input name="city" value={form.city} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="label">State</label>
                                <input name="state" value={form.state} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="label">ZIP Code</label>
                                <input name="zipCode" value={form.zipCode} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="label">Country</label>
                                <input name="country" value={form.country} onChange={handleChange} className="input-field" />
                            </div>
                        </div>
                    </div>

                    {/* ID Info */}
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Identity Document
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">ID Type</label>
                                <select name="idType" value={form.idType} onChange={handleChange} className="input-field">
                                    <option value="">Select type</option>
                                    <option value="Passport">Passport</option>
                                    <option value="Driver's License">Driver's License</option>
                                    <option value="National ID">National ID</option>
                                    <option value="State ID">State ID</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">ID Number</label>
                                <input name="idNumber" value={form.idNumber} onChange={handleChange} className="input-field" />
                            </div>
                            <div className="col-span-2">
                                <label className="label">ID Photo (Image)</label>
                                <div className="flex items-center gap-3">
                                    <div
                                        onClick={() => document.getElementById('id-photo-input')?.click()}
                                        className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${idPhoto ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20'}`}
                                    >
                                        <input
                                            id="id-photo-input"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setIdPhoto(file);
                                                    setUploadingPhoto(true);
                                                    const formData = new FormData();
                                                    formData.append("file", file);
                                                    try {
                                                        const res = await fetch("/api/upload", { method: "POST", body: formData });
                                                        const data = await res.json();
                                                        setForm(prev => ({ ...prev, idImageUrl: data.fileUrl }));
                                                    } catch (err) {
                                                        console.error("Upload failed", err);
                                                    } finally {
                                                        setUploadingPhoto(false);
                                                    }
                                                }
                                            }}
                                        />
                                        {form.idImageUrl ? (
                                            <div className="flex items-center justify-center gap-2 text-emerald-400">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-sm font-medium">ID Photo Uploaded</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                <span className="text-sm">Click to upload ID photo</span>
                                            </div>
                                        )}
                                    </div>
                                    {form.idImageUrl && (
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                                           {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={form.idImageUrl} alt="ID Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="label">Notes</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows={3}
                            className="input-field resize-none"
                            placeholder="Any additional notes..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            id="save-client-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Save Client"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

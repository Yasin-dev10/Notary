"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, Loader2, Building2, User, Mail, Lock, Hash } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        organizationName: "",
        slug: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            // Auto-generate slug from org name
            if (name === "organizationName") {
                updated.slug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-")
                    .slice(0, 50);
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                return;
            }

            router.push("/login?registered=true");
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 bg-grid flex items-center justify-center p-4 py-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-lg relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Create your organization
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        Set up your NotaryPro workspace in seconds
                    </p>
                </div>

                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Organization Info */}
                        <div className="space-y-1 mb-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <Building2 className="w-3.5 h-3.5" />
                                Organization
                            </div>
                        </div>

                        <div>
                            <label className="label">Organization Name</label>
                            <input
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                placeholder="Acme Notary Services"
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Workspace URL</label>
                            <div className="flex items-center">
                                <span className="px-3 py-2.5 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-slate-400 text-sm">
                                    notarypro.com/
                                </span>
                                <input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="acme-notary"
                                    className="input-field rounded-l-none"
                                    pattern="[a-z0-9-]+"
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Only lowercase letters, numbers, and hyphens
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 pt-1">
                            <div className="flex-1 h-px bg-white/10" />
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <User className="w-3.5 h-3.5" />
                                Admin Account
                            </div>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">First Name</label>
                                <input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Last Name</label>
                                <input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Smith"
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@company.com"
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="At least 8 characters"
                                className="input-field"
                                minLength={8}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            id="register-submit-btn"
                            className="btn-primary w-full justify-center py-3 text-base mt-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Create Organization
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-sm text-slate-400">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

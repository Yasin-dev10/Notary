"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Shield, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-grid flex items-center justify-center p-4 relative"
            style={{ background: "var(--bg-base)" }}
        >
            {/* Ambient glow orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
                    style={{ background: "var(--glow-a)" }}
                />
                <div
                    className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
                    style={{ background: "var(--glow-b)" }}
                />
                <div
                    className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full blur-3xl"
                    style={{ background: "var(--glow-c)" }}
                />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                        style={{
                            background: "linear-gradient(135deg, var(--btn-grad-a), var(--btn-grad-c))",
                            boxShadow: "0 8px 32px var(--btn-shadow)",
                        }}
                    >
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: "var(--text-heading)" }}
                    >
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                        Sign in to your NotaryPro workspace
                    </p>
                </div>

                {/* Card */}
                <div
                    className="p-8 rounded-2xl"
                    style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.40)",
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div
                                className="p-3.5 rounded-xl text-sm flex items-center gap-2"
                                style={{
                                    background: "rgba(239,68,68,0.08)",
                                    border: "1px solid rgba(239,68,68,0.18)",
                                    color: "#fca5a5",
                                }}
                            >
                                <div
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ background: "#f87171" }}
                                />
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="label">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@company.com"
                                className="input-field"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pr-12"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: "var(--text-muted)" }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.color = "var(--primary-light)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.color = "var(--text-muted)")
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            id="login-submit-btn"
                            className="btn-primary w-full justify-center py-3 text-base"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div
                        className="mt-6 pt-6 text-center"
                        style={{ borderTop: "1px solid var(--divider)" }}
                    >
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Don&apos;t have an organization?{" "}
                            <Link
                                href="/register"
                                className="font-semibold transition-colors"
                                style={{ color: "var(--link-color)" }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = "var(--link-hover)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = "var(--link-color)")
                                }
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo hint */}
                <div
                    className="mt-4 p-3 rounded-xl text-center"
                    style={{
                        background: "var(--border-subtle)",
                        border: "1px solid var(--border-default)",
                    }}
                >
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Demo: Set up PostgreSQL and run{" "}
                        <code
                            className="px-1 py-0.5 rounded"
                            style={{
                                background: "var(--border-default)",
                                color: "var(--primary-light)",
                            }}
                        >
                            npm run db:seed
                        </code>{" "}
                        to create sample data
                    </p>
                </div>
            </div>
        </div>
    );
}

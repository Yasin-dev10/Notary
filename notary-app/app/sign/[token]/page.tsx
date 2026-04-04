"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
    FileText, CheckCircle, Users, AlertCircle, Loader2,
    PenLine, ShieldCheck, ChevronRight, Clock,
} from "lucide-react";
import dynamic from "next/dynamic";

const SignaturePad = dynamic(() => import("@/components/documents/SignaturePad"), { ssr: false });

interface Signer {
    id: string;
    name: string;
    role: string;
    status: string;
    order: number;
}

interface DocumentInfo {
    id: string;
    name: string;
    description: string | null;
    fileUrl: string;
    status: string;
    signers: Signer[];
}

interface SignerInfo {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
    order: number;
    status: string;
}

type PageState = "loading" | "ready" | "signing" | "done" | "error" | "alreadySigned" | "notYourTurn";

export default function SignPage() {
    const params = useParams<{ token: string }>();
    const token = params.token;

    const [pageState, setPageState] = useState<PageState>("loading");
    const [errorMsg, setErrorMsg] = useState("");
    const [signerInfo, setSignerInfo] = useState<SignerInfo | null>(null);
    const [docInfo, setDocInfo] = useState<DocumentInfo | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSignerInfo = useCallback(async () => {
        try {
            const res = await fetch(`/api/sign/${token}`);
            const data = await res.json();

            if (!res.ok) {
                if (data.alreadySigned) { setPageState("alreadySigned"); return; }
                if (data.notYourTurn) { setPageState("notYourTurn"); setErrorMsg(data.error); return; }
                setPageState("error");
                setErrorMsg(data.error || "Something went wrong.");
                return;
            }

            setSignerInfo(data.signer);
            setDocInfo(data.document);
            setPageState("ready");
        } catch {
            setPageState("error");
            setErrorMsg("Failed to load signing information.");
        }
    }, [token]);

    useEffect(() => { fetchSignerInfo(); }, [fetchSignerInfo]);

    const handleSignatureSave = async (signatureUrl: string, snapshotUrl: string | null) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/sign/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signatureUrl, snapshotUrl }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error submitting signature");
                return;
            }
            setPageState("done");
        } catch {
            alert("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusColor: Record<string, string> = {
        PENDING: "text-slate-400 bg-slate-800",
        NOTIFIED: "text-amber-400 bg-amber-400/10",
        COMPLETED: "text-emerald-400 bg-emerald-400/10",
    };

    const statusIcon: Record<string, React.ReactNode> = {
        PENDING: <Clock className="w-3 h-3" />,
        NOTIFIED: <AlertCircle className="w-3 h-3" />,
        COMPLETED: <CheckCircle className="w-3 h-3" />,
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4"
            style={{ background: "radial-gradient(ellipse at top, #1e1b4b 0%, #0f0f1a 50%, #000 100%)" }}>

            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm mb-4">
                        <ShieldCheck className="w-4 h-4" />
                        Secure Document Signing
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Digital Signature Portal</h1>
                    <p className="text-slate-400 text-sm">This page is secured and unique to you</p>
                </div>

                {/* Loading */}
                {pageState === "loading" && (
                    <div className="glass-card p-12 text-center">
                        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Loading signing information...</p>
                    </div>
                )}

                {/* Error */}
                {pageState === "error" && (
                    <div className="glass-card p-10 text-center">
                        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Unable to Load</h2>
                        <p className="text-slate-400 text-sm">{errorMsg}</p>
                    </div>
                )}

                {/* Already Signed */}
                {pageState === "alreadySigned" && (
                    <div className="glass-card p-10 text-center">
                        <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Already Signed</h2>
                        <p className="text-slate-400 text-sm">You have already signed this document. No further action is needed.</p>
                    </div>
                )}

                {/* Not Your Turn */}
                {pageState === "notYourTurn" && (
                    <div className="glass-card p-10 text-center">
                        <Clock className="w-14 h-14 text-amber-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Not Your Turn Yet</h2>
                        <p className="text-slate-400 text-sm">{errorMsg}</p>
                        <p className="text-slate-500 text-xs mt-3">You will receive a notification when it&apos;s your turn to sign.</p>
                    </div>
                )}

                {/* Ready to Sign */}
                {(pageState === "ready" || pageState === "signing") && signerInfo && docInfo && (
                    <>
                        {/* Document Card */}
                        <div className="glass-card p-6 mb-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-semibold text-white truncate">{docInfo.name}</h2>
                                    {docInfo.description && (
                                        <p className="text-slate-400 text-sm mt-0.5">{docInfo.description}</p>
                                    )}
                                    {docInfo.fileUrl && docInfo.fileUrl !== "#" && (
                                        <a href={docInfo.fileUrl} target="_blank" rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 text-indigo-400 text-sm hover:text-indigo-300 mt-2 transition-colors">
                                            View Document <ChevronRight className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Signers Progress */}
                        <div className="glass-card p-5 mb-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-4 h-4 text-slate-400" />
                                <h3 className="text-sm font-medium text-slate-300">Signing Progress</h3>
                                <span className="ml-auto text-xs text-slate-500">
                                    {docInfo.signers.filter(s => s.status === "COMPLETED").length} / {docInfo.signers.length} signed
                                </span>
                            </div>
                            <div className="space-y-2">
                                {docInfo.signers.map((s, i) => (
                                    <div key={s.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${s.id === signerInfo.id
                                            ? "border-indigo-500/30 bg-indigo-500/5"
                                            : "border-white/5 bg-white/2"}`}>
                                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs text-slate-400 font-medium flex-shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                                                {s.name}
                                                {s.id === signerInfo.id && (
                                                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">You</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-500">{s.role}</p>
                                        </div>
                                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${statusColor[s.status] || "text-slate-400 bg-slate-800"}`}>
                                            {statusIcon[s.status]}
                                            {s.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sign Button */}
                        <div className="glass-card p-6 text-center">
                            <p className="text-slate-300 text-sm mb-1">Hello, <span className="text-white font-semibold">{signerInfo.name}</span></p>
                            <p className="text-slate-500 text-xs mb-5">
                                As <span className="text-slate-400">{signerInfo.role}</span>, your signature is required to proceed.
                            </p>
                            <button
                                id="open-signature-pad-btn"
                                onClick={() => setPageState("signing")}
                                disabled={isSubmitting}
                                className="btn-primary w-full justify-center py-3 text-base shadow-lg shadow-indigo-500/20"
                            >
                                <PenLine className="w-5 h-5" />
                                Sign Document Now
                            </button>
                            <p className="text-xs text-slate-600 mt-3">
                                By signing, you agree that this constitutes a legal signature.
                            </p>
                        </div>
                    </>
                )}

                {/* Signature Pad Overlay */}
                {pageState === "signing" && (
                    <SignaturePad
                        onSave={handleSignatureSave}
                        onClose={() => setPageState("ready")}
                    />
                )}

                {/* Done */}
                {pageState === "done" && (
                    <div className="glass-card p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Signature Complete!</h2>
                        <p className="text-slate-400 text-sm mb-1">Your signature has been recorded successfully.</p>
                        <p className="text-slate-500 text-xs">
                            The next signer will be notified automatically. You may now close this page.
                        </p>
                        <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                            <p className="text-emerald-400 text-xs font-medium">✓ Signature secured & timestamped</p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-slate-700 mt-6">
                    Powered by NotaryPro · Secure Digital Signing
                </p>
            </div>
        </div>
    );
}

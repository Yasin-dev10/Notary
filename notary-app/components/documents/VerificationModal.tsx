"use client";

import { X, CheckCircle2, ShieldCheck, Copy, ExternalLink, Lock } from "lucide-react";
import { useState } from "react";

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: {
        id: string;
        name: string;
        trackingId: string;
        verificationHash?: string | null;
    };
}

export function VerificationModal({ isOpen, onClose, document }: VerificationModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    // Build the verification URL: include the hash as `?h=` query param if available
    const baseUrl = typeof window !== "undefined"
        ? `${window.location.origin}/verify/${document.trackingId}`
        : `/verify/${document.trackingId}`;

    const verificationUrl = document.verificationHash
        ? `${baseUrl}?h=${document.verificationHash}`
        : baseUrl;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verificationUrl)}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(verificationUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md overflow-hidden relative border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-white/8 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-semibold text-white">Document Verification</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-3xl shadow-xl mb-6 ring-8 ring-indigo-500/10 ring-offset-4 ring-offset-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={qrCodeUrl}
                            alt="Verification QR Code"
                            className="w-48 h-48"
                        />
                    </div>

                    <div className="text-center mb-8">
                        <h4 className="text-xl font-bold text-white mb-2">{document.name}</h4>
                        <p className="text-sm text-slate-400">Scan this QR code to verify document authenticity</p>
                    </div>

                    <div className="w-full space-y-4">
                        {/* Tracking ID row */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest ml-1">Tracking ID</span>
                            <div className="flex items-center gap-2 bg-slate-900/50 border border-white/8 p-3 rounded-xl">
                                <code className="text-indigo-400 font-mono text-sm flex-1">{document.trackingId}</code>
                            </div>
                        </div>

                        {/* Hash badge */}
                        {document.verificationHash && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                <span className="text-[11px] text-emerald-400 font-medium">Secured with verification hash</span>
                                <code className="text-[10px] text-slate-500 font-mono ml-auto truncate max-w-[100px]">
                                    {document.verificationHash.substring(0, 8)}…
                                </code>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={copyToClipboard}
                                className="flex-1 px-4 py-3 bg-slate-800 text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all border border-white/8"
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copied!" : "Copy Link"}
                            </button>
                            <a
                                href={verificationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Link
                            </a>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white/5 border-t border-white/8 text-center">
                    <p className="text-xs text-slate-500">
                        The recipient can scan this QR code to confirm this document was notarized by our institution. The link is secured with a unique verification hash.
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { 
    ShieldCheck, 
    ShieldAlert, 
    FileText, 
    Calendar, 
    User, 
    Building2, 
    CheckCircle2, 
    Loader2, 
    ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function VerificationPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function verify() {
            try {
                // Forward the `h` (verificationHash) query param to the API
                const hash = searchParams.get("h");
                const url = hash
                    ? `/api/verify/${id}?h=${encodeURIComponent(hash)}`
                    : `/api/verify/${id}`;

                const res = await fetch(url);
                const data = await res.json();
                if (res.ok) {
                    setResult(data.document);
                } else {
                    setError(data.error || "Verification failed");
                }
            } catch (err) {
                setError("Could not connect to the verification server");
            } finally {
                setLoading(false);
            }
        }
        if (id) verify();
    }, [id, searchParams]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-inter selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950 to-slate-950">
            
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-2xl relative">
                {/* Branding */}
                <div className="flex items-center justify-center gap-3 mb-12 animate-in slide-in-from-top-12 duration-700">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                        <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Notary System</h1>
                        <p className="text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">Document Verification</p>
                    </div>
                </div>

                {loading ? (
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                        <h2 className="text-xl font-bold text-white mb-2">Authenticating Document</h2>
                        <p className="text-slate-400">Please wait while we verify the security records...</p>
                    </div>
                ) : error ? (
                    <div className="glass-card p-8 border-red-500/20 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white text-center mb-3">Verification Failed</h2>
                        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl mb-8">
                            <p className="text-red-400 text-center text-sm">{error}</p>
                        </div>
                        <p className="text-slate-400 text-center text-sm mb-8">
                            This tracking ID does not match any records in our secure database. If you believe this is an error, please contact the issuing institution.
                        </p>
                        <Link href="/" className="w-full py-4 bg-slate-900 border border-white/8 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all font-semibold">
                            <ChevronLeft className="w-4 h-4" />
                            Return to Homepage
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Success Badge */}
                        <div className="glass-card p-8 border-emerald-500/20 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheck className="w-48 h-48 -mr-12 -mt-12" />
                           </div>
                           
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center ring-4 ring-emerald-500/5">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Document Verified</h2>
                                        <p className="text-emerald-400/80 text-sm font-medium">Authentic & Legally Signed</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-y border-white/5 py-8">
                                    <div className="space-y-4">
                                        <DetailItem icon={<FileText />} label="Document Name" value={result.name} />
                                        <DetailItem icon={<Building2 />} label="Issuing Institution" value={result.institution} />
                                        <DetailItem icon={<Calendar />} label="Notarization Date" value={result.notarizationDate ? format(new Date(result.notarizationDate), "MMMM d, yyyy") : "N/A"} />
                                    </div>
                                    <div className="space-y-4">
                                        <DetailItem icon={<User />} label="Principals" value={result.clientName} />
                                        <DetailItem icon={<ShieldCheck />} label="Tracking ID" value={result.trackingId} highlight />
                                        <DetailItem icon={<Calendar />} label="Registered" value={format(new Date(result.createdAt), "MMM d, yyyy 'at' h:mm a")} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Digital Signatures</h3>
                                    <div className="space-y-3">
                                        {result.signatures.map((sig: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                                                        {sig.signerName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">{sig.signerName}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase">{sig.signerRole}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-emerald-500 font-bold">SIGNED</p>
                                                    <p className="text-[9px] text-slate-500">{format(new Date(sig.signedAt), "MMM d, yyyy")}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {result.signatures.length === 0 && <p className="text-sm text-slate-500 italic">No digital signatures found in record.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-slate-500 text-xs px-12">
                            This verification service confirms that the document presented matches exactly the digital record on file at our institution. This record cannot be altered once notarized.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailItem({ icon, label, value, highlight = false }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1 text-slate-500">
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">{label}</p>
                <p className={`text-sm font-semibold ${highlight ? 'text-indigo-400 font-mono' : 'text-slate-200'}`}>{value}</p>
            </div>
        </div>
    );
}

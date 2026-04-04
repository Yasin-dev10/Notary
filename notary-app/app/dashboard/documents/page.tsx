"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import {
    FileText,
    Plus,
    Upload,
    ChevronLeft,
    ChevronRight,
    Download,
    Loader2,
    CheckCircle,
    Clock,
    AlertCircle,
    Edit,
    PenLine,
    Search,
} from "lucide-react";
import { format } from "date-fns";
import { UploadModal } from "@/components/documents/UploadModal";
import { VerificationModal } from "@/components/documents/VerificationModal";
import { DocumentVersionsModal } from "@/components/documents/DocumentVersionsModal";
import { SignersModal } from "@/components/documents/SignersModal";
import { ShieldCheck, History, Users } from "lucide-react";

interface Document {
    id: string;
    name: string;
    description: string | null;
    status: string;
    trackingId: string | null;
    verificationHash: string | null;
    fileUrl: string;
    fileSize: number | null;
    mimeType: string | null;
    createdAt: string;
    client: { id: string; firstName: string; lastName: string } | null;
    appointment: { id: string; title: string } | null;
    uploadedBy: { id: string; firstName: string; lastName: string } | null;
}

const STATUS_OPTIONS = ["ALL", "DRAFT", "PENDING_NOTARIZATION", "NOTARIZED", "REJECTED"];

const statusStyle: Record<string, string> = {
    DRAFT: "badge-yellow",
    PENDING_NOTARIZATION: "badge-blue",
    NOTARIZED: "badge-green",
    REJECTED: "badge-red",
};

const statusIcon: Record<string, React.ReactNode> = {
    DRAFT: <Edit className="w-3 h-3" />,
    PENDING_NOTARIZATION: <Clock className="w-3 h-3" />,
    NOTARIZED: <CheckCircle className="w-3 h-3" />,
    REJECTED: <AlertCircle className="w-3 h-3" />,
};

function formatFileSize(bytes: number | null): string {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
    const [isSignersModalOpen, setIsSignersModalOpen] = useState(false);
    const limit = 15;

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(statusFilter !== "ALL" && { status: statusFilter }),
                ...(search && { search }),
            });
            const res = await fetch(`/api/documents?${params}`);
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Failed to fetch documents:", errorText);
                setDocuments([]);
                setTotal(0);
                return;
            }

            const data = await res.json();
            setDocuments(data.documents || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    return (
        <div>
            <Topbar title="Documents" subtitle="Manage and track all notarized documents" />
            <div className="p-6 space-y-5">
                {/* Controls */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search documents by name..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="input-field pl-9"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {STATUS_OPTIONS.map((s) => (
                            <button
                                key={s}
                                id={`doc-filter-${s.toLowerCase()}-btn`}
                                onClick={() => { setStatusFilter(s); setPage(1); }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${statusFilter === s
                                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/8"
                                    }`}
                            >
                                {s.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            id="upload-document-btn"
                            onClick={() => setIsUploadModalOpen(true)}
                            className="btn-secondary"
                        >
                            <Upload className="w-4 h-4" />
                            Upload
                        </button>
                        <button
                            id="create-document-btn"
                            onClick={() => router.push("/dashboard/documents/create")}
                            className="btn-primary"
                        >
                            <PenLine className="w-4 h-4" />
                            Create Document
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Total", value: total, color: "text-slate-300" },
                        { label: "Pending", value: documents.filter((d) => d.status === "PENDING_NOTARIZATION").length, color: "text-blue-400" },
                        { label: "Notarized", value: documents.filter((d) => d.status === "NOTARIZED").length, color: "text-emerald-400" },
                        { label: "Rejected", value: documents.filter((d) => d.status === "REJECTED").length, color: "text-red-400" },
                    ].map((s) => (
                        <div key={s.label} className="glass-card p-4 text-center">
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/8">
                                    <th className="table-header text-left">Document</th>
                                    <th className="table-header text-left">Client</th>
                                    <th className="table-header text-left">Appointment</th>
                                    <th className="table-header text-left">Uploaded By</th>
                                    <th className="table-header text-left">Size</th>
                                    <th className="table-header text-left">Status</th>
                                    <th className="table-header text-left">Date</th>
                                    <th className="table-header text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={8} className="py-20 text-center"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" /></td></tr>
                                ) : documents.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center">
                                            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-400 text-sm">No documents found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    documents.map((doc) => (
                                        <tr key={doc.id} className="table-row">
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/8 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-200 text-sm">{doc.name}</p>
                                                        {doc.description && (
                                                            <p className="text-xs text-slate-500 truncate max-w-[180px]">{doc.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                {doc.client ? (
                                                    <span className="text-sm text-slate-300">
                                                        {doc.client.firstName} {doc.client.lastName}
                                                    </span>
                                                ) : <span className="text-slate-600 text-xs">—</span>}
                                            </td>
                                            <td className="table-cell">
                                                {doc.appointment ? (
                                                    <span className="text-xs text-slate-400 truncate max-w-[120px] block">
                                                        {doc.appointment.title}
                                                    </span>
                                                ) : <span className="text-slate-600 text-xs">—</span>}
                                            </td>
                                            <td className="table-cell">
                                                {doc.uploadedBy ? (
                                                    <span className="text-xs text-slate-400">
                                                        {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                                                    </span>
                                                ) : <span className="text-slate-600 text-xs">—</span>}
                                            </td>
                                            <td className="table-cell text-xs text-slate-500">
                                                {formatFileSize(doc.fileSize)}
                                            </td>
                                            <td className="table-cell">
                                                <span className={`${statusStyle[doc.status] || "badge-yellow"} flex items-center gap-1 w-fit`}>
                                                    {statusIcon[doc.status]}
                                                    {doc.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="table-cell text-xs text-slate-500">
                                                {format(new Date(doc.createdAt), "MMM d, yyyy")}
                                            </td>
                                            <td className="table-cell text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {doc.status !== "NOTARIZED" && (
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm("Are you sure you want to notarize this document? This will notify the client.")) {
                                                                    try {
                                                                        const res = await fetch(`/api/documents/${doc.id}`, {
                                                                            method: "PATCH",
                                                                            headers: { "Content-Type": "application/json" },
                                                                            body: JSON.stringify({ status: "NOTARIZED" }),
                                                                        });
                                                                        if (res.ok) fetchDocuments();
                                                                    } catch (err) {
                                                                        console.error("Notarization failed:", err);
                                                                    }
                                                                }
                                                            }}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all inline-flex"
                                                            title="Notarize"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {doc.trackingId && (
                                                        <button
                                                            onClick={() => { setSelectedDoc(doc); setIsVerifyModalOpen(true); }}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all inline-flex"
                                                            title="Verify (QR Code)"
                                                        >
                                                            <ShieldCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => { setSelectedDoc(doc); setIsSignersModalOpen(true); }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all inline-flex"
                                                        title="Multi-Party Signers"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedDoc(doc); setIsVersionsModalOpen(true); }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all inline-flex"
                                                        title="Version History"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <a
                                                        href={doc.fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        id={`download-doc-${doc.id}`}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all inline-flex"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {Math.ceil(total / limit) > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-white/8">
                            <p className="text-xs text-slate-500">{total} documents</p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all disabled:opacity-30">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-slate-400">{page} / {Math.ceil(total / limit)}</span>
                                <button onClick={() => setPage((p) => Math.min(Math.ceil(total / limit), p + 1))} disabled={page === Math.ceil(total / limit)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all disabled:opacity-30">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={() => fetchDocuments()}
            />

            {selectedDoc && (
                <VerificationModal
                    isOpen={isVerifyModalOpen}
                    onClose={() => setIsVerifyModalOpen(false)}
                    document={{
                        id: selectedDoc.id,
                        name: selectedDoc.name,
                        trackingId: selectedDoc.trackingId || "",
                        verificationHash: selectedDoc.verificationHash,
                    }}
                />
            )}

            <DocumentVersionsModal
                isOpen={isVersionsModalOpen}
                onClose={() => setIsVersionsModalOpen(false)}
                onSuccess={() => fetchDocuments()}
                document={selectedDoc}
            />

            {selectedDoc && (
                <SignersModal
                    isOpen={isSignersModalOpen}
                    onClose={() => setIsSignersModalOpen(false)}
                    documentId={selectedDoc.id}
                    documentName={selectedDoc.name}
                />
            )}
        </div>
    );
}

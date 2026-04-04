"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Upload, File, Loader2, CheckCircle2, AlertCircle, History, Download } from "lucide-react";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    document: { id: string; name: string; fileUrl: string; status: string } | null;
}

interface Version {
    id: string;
    version: number;
    fileUrl: string;
    fileSize: number | null;
    createdAt: string;
    uploadedBy: {
        firstName: string;
        lastName: string;
    } | null;
}

export function DocumentVersionsModal({ isOpen, onClose, onSuccess, document }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // History
    const [versions, setVersions] = useState<Version[]>([]);
    const [loadingVersions, setLoadingVersions] = useState(false);

    const fetchVersions = useCallback(async () => {
        if (!document) return;
        setLoadingVersions(true);
        try {
            const res = await fetch(`/api/documents/${document.id}/versions`);
            if (res.ok) {
                const data = await res.json();
                setVersions(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingVersions(false);
        }
    }, [document]);

    useEffect(() => {
        if (isOpen && document) {
            fetchVersions();
        } else {
            resetForm();
        }
    }, [isOpen, document, fetchVersions]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file || !document) return;

        setUploading(true);
        setError(null);
        setProgress(10);

        try {
            // Upload file directly to local Next.js API
            const formData = new FormData();
            formData.append("file", file);

            const resUpload = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!resUpload.ok) throw new Error("Failed to upload file");
            const { fileUrl } = await resUpload.json();
            setProgress(60);

            // Save new version to database
            const resDb = await fetch(`/api/documents/${document.id}/versions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileUrl: fileUrl,
                    fileSize: file.size,
                    mimeType: file.type,
                }),
            });

            if (!resDb.ok) throw new Error("Failed to save new version record");
            setProgress(100);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                fetchVersions();
                setFile(null);
                setSuccess(false);
            }, 1500);
        } catch (err: any) {
            setError(err.message || "An error occurred during upload");
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setUploading(false);
        setProgress(0);
        setError(null);
        setSuccess(false);
    };

    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-2xl overflow-hidden relative border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/8 flex items-center justify-between bg-white/5 shrink-0">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-400" />
                        Versions: {document.name}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Version Upload Area */}
                    {document.status !== "NOTARIZED" && document.status !== "REJECTED" && (
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex flex-col gap-1">
                                Upload New Version
                                <span className="text-xs text-slate-500 font-normal">If a mistake happens or the document was revised, upload the latest change here. (Nuqullada Is-beddelay)</span>
                            </h4>
                            
                            {success ? (
                                <div className="py-4 text-center animate-in zoom-in-95 duration-300">
                                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-emerald-400">New Version Uploaded</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`
                                            border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
                                            ${file ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"}
                                            ${uploading ? "pointer-events-none opacity-50" : ""}
                                        `}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />

                                        {file ? (
                                            <div className="flex flex-col items-center">
                                                <p className="text-sm font-medium text-slate-200 truncate max-w-full">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Upload className="w-5 h-5 text-slate-400 mb-2" />
                                                <p className="text-xs font-medium text-slate-300">
                                                    Click to select revised file
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
                                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    {uploading && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                <span>Uploading...</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <button
                                            disabled={!file || uploading}
                                            onClick={handleUpload}
                                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {uploading ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</>
                                            ) : (
                                                <><Upload className="w-3.5 h-3.5" />Upload Version</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Version History List */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-4">Version History</h4>
                        {loadingVersions ? (
                            <div className="py-8 text-center">
                                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                            </div>
                        ) : versions.length === 0 ? (
                            <div className="py-8 text-center border text-slate-500 text-sm border-dashed border-white/10 rounded-xl">
                                <p>No older versions available.</p>
                                <p className="text-xs mt-1">The current file is v1.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Current File representation */}
                                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                            <span className="text-xs font-bold">V{versions.length > 0 ? versions[0].version + 1 : 1}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">Current (Latest)</p>
                                            <p className="text-xs text-slate-500">Active Document</p>
                                        </div>
                                    </div>
                                    <a
                                        href={document.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                </div>

                                {/* Older versions */}
                                {versions.map((ver) => (
                                    <div key={ver.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center border border-white/10">
                                                <span className="text-xs font-bold">V{ver.version}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-300">
                                                    Version {ver.version}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(ver.createdAt).toLocaleString()} 
                                                    {ver.uploadedBy ? ` • by ${ver.uploadedBy.firstName}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={ver.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-all"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 border-t border-white/8 flex justify-end shrink-0">
                    <button onClick={onClose} className="btn-secondary text-sm">Close</button>
                </div>
            </div>
        </div>
    );
}

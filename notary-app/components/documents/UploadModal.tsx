"use client";

import { useState, useRef } from "react";
import { X, Upload, File, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setProgress(10);

        try {
            // 1. Upload file directly to our local Next.js API
            const formData = new FormData();
            formData.append("file", file);

            const resUpload = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!resUpload.ok) throw new Error("Failed to upload file");
            const { fileUrl } = await resUpload.json();
            setProgress(60);

            // 2. Save to database
            const resDb = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: file.name,
                    fileUrl: fileUrl,
                    fileSize: file.size,
                    mimeType: file.type,
                    status: "DRAFT",
                }),
            });

            if (!resDb.ok) throw new Error("Failed to save document record");
            setProgress(100);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
                resetForm();
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-md overflow-hidden relative border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-white/8 flex items-center justify-between bg-white/5">
                    <h3 className="text-lg font-semibold text-white">Upload Document</h3>
                    <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="py-8 text-center animate-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">Upload Successful!</h4>
                            <p className="text-slate-400">Document has been saved to your dashboard.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
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
                                        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-3">
                                            <File className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-200 mb-1 truncate max-w-full">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center mb-3">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300 mb-1">
                                            Click to select a file
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            PDF, PNG, JPG, or DOCX up to 10MB
                                        </p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {uploading && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>Uploading...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={uploading}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/8 text-slate-300 font-medium hover:bg-white/5 transition-all text-sm disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!file || uploading}
                                    onClick={handleUpload}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Start Upload"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

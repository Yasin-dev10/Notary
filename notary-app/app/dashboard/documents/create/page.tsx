"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    ArrowLeft, Save, FileText, PenLine, Image as ImageIcon,
    Type, Hash, Calendar, User, Building2, CheckSquare,
    Trash2, RotateCcw, Download, Eye, Plus, ChevronDown,
    Stamp, Upload, X, Loader2, AlertCircle, ZoomIn, ZoomOut,
    GripVertical, Minus, ChevronRight
} from "lucide-react";
import SignaturePad from "@/components/documents/SignaturePad";
import { Topbar } from "@/components/layout/Topbar";

// --------------- Types ---------------
type FieldType = "text" | "textarea" | "date" | "number" | "checkbox" | "signature" | "photo" | "stamp" | "divider";

interface DocumentField {
    id: string;
    type: FieldType;
    label: string;
    value: string;
    required: boolean;
    placeholder?: string;
    imageData?: string; // base64 for signature/photo
    snapshotData?: string; // base64 for live snapshot
    width?: number;
    height?: number;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
}

interface NotaryTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    fields: Omit<DocumentField, "id" | "value">[];
}

// --------------- Templates ---------------
const TEMPLATES: NotaryTemplate[] = [
    {
        id: "affidavit",
        name: "Affidavit",
        description: "Sworn statement of facts",
        icon: "📋",
        fields: [
            { type: "text", label: "Full Name of Affiant", required: true, placeholder: "Enter full legal name" },
            { type: "date", label: "Date of Affidavit", required: true },
            { type: "text", label: "State", required: true, placeholder: "State" },
            { type: "text", label: "County", required: true, placeholder: "County" },
            { type: "textarea", label: "Statement of Facts", required: true, placeholder: "I, the undersigned, being duly sworn, depose and state that..." },
            { type: "signature", label: "Affiant Signature", required: true, width: 400, height: 150 },
            { type: "divider", label: "Notary Section", required: false },
            { type: "text", label: "Notary Name", required: true },
            { type: "date", label: "Commission Expiration Date", required: true },
            { type: "signature", label: "Notary Signature & Seal", required: true, width: 400, height: 150 },
            { type: "stamp", label: "Notary Stamp", required: false, width: 200, height: 200 },
        ]
    },
    {
        id: "acknowledgment",
        name: "Acknowledgment",
        description: "Document acknowledgment certificate",
        icon: "✅",
        fields: [
            { type: "text", label: "State", required: true },
            { type: "text", label: "County", required: true },
            { type: "date", label: "Date", required: true },
            { type: "text", label: "Grantor/Signer Name", required: true },
            { type: "textarea", label: "Acknowledgment Statement", required: true, placeholder: "Before me, the undersigned Notary Public, personally appeared..." },
            { type: "text", label: "Document Title", required: true },
            { type: "signature", label: "Signer Signature", required: true, width: 400, height: 150 },
            { type: "divider", label: "Notary Certificate", required: false },
            { type: "signature", label: "Notary Signature", required: true, width: 400, height: 150 },
            { type: "stamp", label: "Official Notary Seal", required: true, width: 200, height: 200 },
        ]
    },
    {
        id: "power_of_attorney",
        name: "Power of Attorney",
        description: "Grant authority to another person",
        icon: "⚖️",
        fields: [
            { type: "text", label: "Principal (Grantor) Name", required: true },
            { type: "text", label: "Principal Address", required: true },
            { type: "text", label: "Agent (Attorney-in-Fact) Name", required: true },
            { type: "text", label: "Agent Address", required: true },
            { type: "date", label: "Effective Date", required: true },
            { type: "textarea", label: "Powers Granted", required: true, placeholder: "I hereby grant my agent full authority to..." },
            { type: "checkbox", label: "Durable Power of Attorney (survives incapacity)", required: false },
            { type: "signature", label: "Principal Signature", required: true, width: 400, height: 150 },
            { type: "photo", label: "Principal ID Photo", required: false, width: 300, height: 200 },
            { type: "divider", label: "Notarization", required: false },
            { type: "signature", label: "Notary Signature", required: true, width: 400, height: 150 },
            { type: "stamp", label: "Notary Seal", required: true, width: 200, height: 200 },
        ]
    },
    {
        id: "jurat",
        name: "Jurat",
        description: "Sworn/subscribed certification",
        icon: "🔏",
        fields: [
            { type: "text", label: "Document Title", required: true },
            { type: "text", label: "Signer Full Name", required: true },
            { type: "date", label: "Date", required: true },
            { type: "textarea", label: "Document Content / Statement", required: true },
            { type: "signature", label: "Signer Signature", required: true, width: 400, height: 150 },
            { type: "divider", label: "Notary Certification", required: false },
            { type: "text", label: "Notary Name", required: true },
            { type: "text", label: "Notary State", required: true },
            { type: "date", label: "Commission Expires", required: true },
            { type: "signature", label: "Notary Signature", required: true, width: 400, height: 150 },
            { type: "stamp", label: "Notary Seal", required: false, width: 200, height: 200 },
        ]
    },
    {
        id: "blank",
        name: "Blank Document",
        description: "Start from scratch",
        icon: "📄",
        fields: [
            { type: "text", label: "Document Title", required: true },
            { type: "date", label: "Date", required: true },
        ]
    }
];

const FIELD_ICONS: Record<FieldType, string> = {
    text: "T",
    textarea: "¶",
    date: "📅",
    number: "#",
    checkbox: "☑",
    signature: "✍️",
    photo: "📷",
    stamp: "🔏",
    divider: "—",
};

function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

export default function CreateDocumentPage() {
    const router = useRouter();
    const [step, setStep] = useState<"template" | "build" | "preview">("template");
    const [selectedTemplate, setSelectedTemplate] = useState<NotaryTemplate | null>(null);
    const [fields, setFields] = useState<DocumentField[]>([]);
    const [docTitle, setDocTitle] = useState("");
    const [docDescription, setDocDescription] = useState("");
    const [clientName, setClientName] = useState("");
    const [saving, setSaving] = useState(false);
    const [activeSignatureFieldId, setActiveSignatureFieldId] = useState<string | null>(null);
    const [activePhotoFieldId, setActivePhotoFieldId] = useState<string | null>(null);
    const [activeStampFieldId, setActiveStampFieldId] = useState<string | null>(null);
    const [importDragging, setImportDragging] = useState(false);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
    const [dragFieldIdx, setDragFieldIdx] = useState<number | null>(null);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [clients, setClients] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [expiryDate, setExpiryDate] = useState("");
    const importRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const stampInputRef = useRef<HTMLInputElement>(null);

    // Fetch clients
    useEffect(() => {
        fetch("/api/clients?limit=100").then(r => r.json()).then(d => {
            setClients(d.clients || []);
        }).catch(() => {});
    }, []);

    const applyTemplate = (template: NotaryTemplate) => {
        setSelectedTemplate(template);
        setDocTitle(template.name + " - " + new Date().toLocaleDateString());
        const initialFields: DocumentField[] = template.fields.map(f => ({
            ...f,
            id: generateId(),
            value: "",
        }));
        setFields(initialFields);
        setStep("build");
    };

    const addField = (type: FieldType) => {
        const newField: DocumentField = {
            id: generateId(),
            type,
            label: type === "divider" ? "Section Divider" :
                   type === "signature" ? "Signature" :
                   type === "photo" ? "Photo/Image" :
                   type === "stamp" ? "Official Stamp" :
                   type === "checkbox" ? "Checkbox" : "New Field",
            value: "",
            required: false,
            placeholder: "",
            width: type === "signature" ? 400 : type === "photo" ? 300 : type === "stamp" ? 200 : undefined,
            height: type === "signature" ? 150 : type === "photo" ? 200 : type === "stamp" ? 200 : undefined,
        };
        setFields(prev => [...prev, newField]);
        setShowAddMenu(false);
    };

    const updateField = (id: string, updates: Partial<DocumentField>) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
    };

    const moveField = (from: number, to: number) => {
        setFields(prev => {
            const arr = [...prev];
            const [item] = arr.splice(from, 1);
            arr.splice(to, 0, item);
            return arr;
        });
    };

    // Drag-and-drop for fields
    const handleDragStart = (idx: number) => setDragFieldIdx(idx);
    const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
    const handleDrop = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (dragFieldIdx !== null && dragFieldIdx !== idx) moveField(dragFieldIdx, idx);
        setDragFieldIdx(null);
        setDragOverIdx(null);
    };

    // Import existing document (PDF/image)
    const handleImportFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const importedField: DocumentField = {
                id: generateId(),
                type: "photo",
                label: "Imported: " + file.name,
                value: file.name,
                required: false,
                imageData: dataUrl,
                width: 600,
                height: 800,
            };
            setFields(prev => [...prev, importedField]);
        };
        reader.readAsDataURL(file);
    };

    const handleImportDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setImportDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImportFile(file);
    };

    // Photo upload for photo fields
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activePhotoFieldId) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateField(activePhotoFieldId, { imageData: ev.target?.result as string, value: file.name });
            setActivePhotoFieldId(null);
        };
        reader.readAsDataURL(file);
    };

    const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeStampFieldId) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateField(activeStampFieldId, { imageData: ev.target?.result as string, value: file.name });
            setActiveStampFieldId(null);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!docTitle) return;
        setSaving(true);
        try {
            // Serialize the document as JSON (stored in description/metadata)
            const docData = {
                title: docTitle,
                description: docDescription,
                clientName,
                template: selectedTemplate?.id,
                fields: fields.map(f => ({
                    ...f,
                    imageData: f.imageData?.substring(0, 100) // truncate for API, full stored separately
                })),
            };

            const signatures = fields
                .filter(f => f.type === "signature" && f.imageData)
                .map(f => ({
                    signatureUrl: f.imageData,
                    snapshotUrl: f.snapshotData,
                    signerName: f.label,
                    signerRole: "CLIENT",
                }));

            const attachments = fields
                .filter(f => (f.type === "photo" || f.type === "stamp") && f.imageData)
                .map(f => ({
                    fileUrl: f.imageData,
                    fileName: f.value || f.label,
                    type: f.type === "stamp" ? "OTHER" : "PHOTO",
                }));

            const isImported = fields.length === 1 && fields[0].type === "photo" && fields[0].value?.match(/\.(pdf|png|jpg|jpeg|docx)$/i);

            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: docTitle,
                    description: docDescription || `Template: ${selectedTemplate?.name || "Custom"}`,
                    fileUrl: isImported ? fields[0].imageData : "#",
                    status: "DRAFT",
                    type: isImported ? "UPLOADED" : "GENERATED",
                    documentData: isImported ? null : docData,
                    clientId: selectedClientId || null,
                    expiryDate: expiryDate || null,
                    mimeType: "application/notary-document",
                    signatures,
                    attachments,
                }),
            });
            if (res.ok) {
                router.push("/dashboard/documents");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    // ==================== RENDER ====================

    if (step === "template") {
        return (
            <div>
                <Topbar title="Create Document" subtitle="Choose a template to get started" />
                <div className="p-6">
                    {/* Import Existing */}
                    <div className="mb-8">
                        <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-indigo-400" />
                            Import Existing Document
                        </h2>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setImportDragging(true); }}
                            onDragLeave={() => setImportDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setImportDragging(false);
                                const file = e.dataTransfer.files[0];
                                if (file) {
                                    handleImportFile(file);
                                    setDocTitle(file.name);
                                    setSelectedTemplate(TEMPLATES.find(t => t.id === "blank")!);
                                    setStep("build");
                                }
                            }}
                            onClick={() => importRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                                importDragging
                                    ? "border-indigo-500 bg-indigo-500/10"
                                    : "border-white/10 hover:border-white/25 hover:bg-white/5"
                            }`}
                        >
                            <input
                                ref={importRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.png,.jpg,.jpeg,.docx"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleImportFile(file);
                                        setDocTitle(file.name);
                                        setSelectedTemplate(TEMPLATES.find(t => t.id === "blank")!);
                                        setStep("build");
                                    }
                                }}
                            />
                            <div className="w-12 h-12 bg-indigo-500/15 text-indigo-400 rounded-xl flex items-center justify-center">
                                <Upload className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-200">Drop a document here or click to browse</p>
                                <p className="text-xs text-slate-500 mt-1">PDF, PNG, JPG, DOCX — up to 50MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Templates */}
                    <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        Or Start from a Template
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {TEMPLATES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => applyTemplate(t)}
                                className="glass-card-hover p-5 text-left group transition-all duration-200"
                                id={`template-${t.id}-btn`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                                        {t.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{t.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                                        <p className="text-xs text-indigo-400/70 mt-2">{t.fields.length} fields</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors mt-1 flex-shrink-0" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // =================== BUILD STEP ===================
    return (
        <div className="flex flex-col h-full">
            <Topbar
                title={docTitle || "New Document"}
                subtitle={selectedTemplate?.name || "Custom Document"}
            />

            {/* Hidden inputs */}
            <input ref={photoInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            <input ref={stampInputRef} type="file" className="hidden" accept="image/*" onChange={handleStampUpload} />

            {/* Signature Modal */}
            {activeSignatureFieldId && (
                <SignaturePad
                    onSave={(signatureUrl, snapshotUrl) => {
                        updateField(activeSignatureFieldId, { 
                            imageData: signatureUrl, 
                            snapshotData: snapshotUrl || undefined, 
                            value: "signed" 
                        });
                        setActiveSignatureFieldId(null);
                    }}
                    onClose={() => setActiveSignatureFieldId(null)}
                />
            )}

            <div className="flex flex-col lg:flex-row gap-0 flex-1 overflow-hidden">
                {/* LEFT: Toolbar */}
                <div className="w-full lg:w-64 xl:w-72 border-b lg:border-b-0 lg:border-r border-white/8 bg-slate-950/50 flex-shrink-0 overflow-y-auto">
                    <div className="p-4 space-y-4">
                        {/* Document Info */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Document Info</h3>
                            <input
                                id="doc-title-input"
                                type="text"
                                placeholder="Document Title"
                                value={docTitle}
                                onChange={e => setDocTitle(e.target.value)}
                                className="input-field text-sm"
                            />
                            <textarea
                                id="doc-description-input"
                                placeholder="Description (optional)"
                                value={docDescription}
                                onChange={e => setDocDescription(e.target.value)}
                                className="input-field text-sm resize-none h-16"
                            />
                            <select
                                id="doc-client-select"
                                value={selectedClientId}
                                onChange={e => setSelectedClientId(e.target.value)}
                                className="input-field text-sm"
                            >
                                <option value="">Select Client (optional)</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                                ))}
                            </select>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Expiry Date (Optional)</label>
                                <input
                                    id="doc-expiry-input"
                                    type="date"
                                    value={expiryDate}
                                    onChange={e => setExpiryDate(e.target.value)}
                                    className="input-field text-sm"
                                />
                            </div>
                        </div>

                        {/* Add Field */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Add Field</h3>
                            <div className="grid grid-cols-2 gap-1.5">
                                {(Object.entries({
                                    text: "Text",
                                    textarea: "Paragraph",
                                    date: "Date",
                                    number: "Number",
                                    checkbox: "Checkbox",
                                    signature: "Signature",
                                    photo: "Photo",
                                    stamp: "Stamp",
                                    divider: "Divider",
                                }) as [FieldType, string][]).map(([type, label]) => (
                                    <button
                                        key={type}
                                        id={`add-field-${type}-btn`}
                                        onClick={() => addField(type)}
                                        className="flex items-center gap-1.5 px-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 text-xs text-slate-300 transition-all text-left"
                                    >
                                        <span className="text-base leading-none">{FIELD_ICONS[type]}</span>
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Import */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Import</h3>
                            <button
                                onClick={() => importRef.current?.click()}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 hover:border-indigo-500/30 text-xs text-slate-300 transition-all"
                            >
                                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                                Add from file (PDF/image)
                            </button>
                            <input
                                ref={importRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImportFile(file);
                                }}
                            />
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-white/8 space-y-2">
                            <button
                                id="back-to-templates-btn"
                                onClick={() => setStep("template")}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 text-sm transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Templates
                            </button>
                            <button
                                id="preview-doc-btn"
                                onClick={() => setStep("preview")}
                                className="w-full btn-secondary justify-center text-sm"
                            >
                                <Eye className="w-4 h-4" />
                                Preview
                            </button>
                            <button
                                id="save-document-btn"
                                onClick={handleSave}
                                disabled={!docTitle || saving}
                                className="w-full btn-primary justify-center"
                            >
                                {saving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4" />Save Document</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Document Canvas */}
                <div className="flex-1 overflow-y-auto bg-slate-900/30 p-4 lg:p-8">
                    <div className="max-w-3xl mx-auto">
                        {/* Doc Header */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-2 text-center">
                            <h1 className="text-2xl font-bold text-white mb-1">{docTitle || "Document Title"}</h1>
                            {docDescription && <p className="text-sm text-slate-400">{docDescription}</p>}
                            <p className="text-xs text-slate-600 mt-2">
                                {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>

                        {/* Fields */}
                        <div className="space-y-2">
                            {fields.map((field, idx) => (
                                <FieldEditor
                                    key={field.id}
                                    field={field}
                                    idx={idx}
                                    isDragOver={dragOverIdx === idx}
                                    onUpdate={(updates) => updateField(field.id, updates)}
                                    onRemove={() => removeField(field.id)}
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    onSignatureClick={() => setActiveSignatureFieldId(field.id)}
                                    onPhotoClick={() => {
                                        setActivePhotoFieldId(field.id);
                                        photoInputRef.current?.click();
                                    }}
                                    onStampClick={() => {
                                        setActiveStampFieldId(field.id);
                                        stampInputRef.current?.click();
                                    }}
                                />
                            ))}

                            {fields.length === 0 && (
                                <div className="py-16 text-center text-slate-600">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Use the panel on the left to add fields to your document</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-6 p-4 border-t border-white/8 text-center">
                            <p className="text-xs text-slate-600">Document prepared by Notary System • {new Date().getFullYear()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {step === "preview" && (
                <PreviewModal
                    docTitle={docTitle}
                    docDescription={docDescription}
                    fields={fields}
                    onClose={() => setStep("build")}
                    onSave={handleSave}
                    saving={saving}
                />
            )}
        </div>
    );
}

// =================== FIELD EDITOR ===================

interface FieldEditorProps {
    field: DocumentField;
    idx: number;
    isDragOver: boolean;
    onUpdate: (updates: Partial<DocumentField>) => void;
    onRemove: () => void;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onSignatureClick: () => void;
    onPhotoClick: () => void;
    onStampClick: () => void;
}

function FieldEditor({
    field, idx, isDragOver, onUpdate, onRemove,
    onDragStart, onDragOver, onDrop,
    onSignatureClick, onPhotoClick, onStampClick
}: FieldEditorProps) {
    const [editing, setEditing] = useState(false);

    if (field.type === "divider") {
        return (
            <div
                draggable
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className={`group relative bg-white/5 border rounded-xl px-4 py-3 transition-all ${isDragOver ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/8"}`}
            >
                <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-slate-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 border-t border-white/15" />
                    <input
                        value={field.label}
                        onChange={e => onUpdate({ label: e.target.value })}
                        className="bg-transparent text-center text-xs font-semibold text-slate-400 uppercase tracking-wider outline-none border-none w-48"
                    />
                    <div className="flex-1 border-t border-white/15" />
                    <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        );
    }

    if (field.type === "signature") {
        return (
            <div
                draggable
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className={`group bg-white/5 border rounded-xl p-4 transition-all ${isDragOver ? "border-indigo-500/50" : "border-white/8"}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-slate-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                        <input value={field.label} onChange={e => onUpdate({ label: e.target.value })}
                            className="bg-transparent text-sm font-medium text-slate-300 outline-none border-none" />
                        {field.required && <span className="text-red-400 text-xs">*</span>}
                    </div>
                    <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
                {field.imageData ? (
                    <div className="flex items-end gap-3 flex-wrap">
                        <div className="relative inline-block">
                            <img src={field.imageData} alt="Signature" className="max-h-24 border border-white/10 rounded-lg bg-white/5 shadow-inner" />
                            <button
                                onClick={onSignatureClick}
                                className="absolute -top-1 -right-1 p-1 bg-slate-800 border border-white/10 rounded-md text-slate-400 hover:text-white text-xs shadow-lg"
                            >
                                <RotateCcw className="w-3 h-3" />
                            </button>
                            <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tight">Saxeexa (Signature)</p>
                        </div>
                        {field.snapshotData && (
                            <div className="relative inline-block">
                                <img src={field.snapshotData} alt="Presence Snapshot" className="max-h-24 aspect-square object-cover border border-indigo-500/30 rounded-lg bg-slate-900 shadow-inner" />
                                <div className="absolute top-1 right-1 px-1 py-0.5 bg-indigo-500/80 text-white text-[8px] font-bold rounded uppercase tracking-tighter backdrop-blur-sm">
                                    Live
                                </div>
                                <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tight">Biometric Snapshot</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        id={`sign-field-${field.id}`}
                        onClick={onSignatureClick}
                        className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-indigo-500/40 rounded-lg text-indigo-400 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-sm"
                    >
                        <PenLine className="w-4 h-4" />
                        Click to sign
                    </button>
                )}
            </div>
        );
    }

    if (field.type === "photo" || field.type === "stamp") {
        const clickHandler = field.type === "photo" ? onPhotoClick : onStampClick;
        return (
            <div
                draggable
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className={`group bg-white/5 border rounded-xl p-4 transition-all ${isDragOver ? "border-indigo-500/50" : "border-white/8"}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-slate-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                        <input value={field.label} onChange={e => onUpdate({ label: e.target.value })}
                            className="bg-transparent text-sm font-medium text-slate-300 outline-none border-none" />
                    </div>
                    <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
                {field.imageData ? (
                    <div className="relative inline-block">
                        <img src={field.imageData} alt={field.label}
                            className={`border border-white/10 rounded-lg bg-white/5 ${field.type === "stamp" ? "max-h-32 opacity-90" : "max-h-48"}`} />
                        <button onClick={clickHandler} className="absolute top-1 right-1 p-1 bg-slate-800 rounded-md text-slate-400 hover:text-white">
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <button
                        id={`upload-field-${field.id}`}
                        onClick={clickHandler}
                        className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-white/15 rounded-lg text-slate-400 hover:border-white/30 hover:bg-white/5 transition-all text-sm"
                    >
                        {field.type === "stamp" ? <Stamp className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                        {field.type === "stamp" ? "Upload stamp/seal image" : "Upload photo/image"}
                    </button>
                )}
            </div>
        );
    }

    if (field.type === "checkbox") {
        return (
            <div
                draggable
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                className={`group bg-white/5 border rounded-xl p-4 transition-all ${isDragOver ? "border-indigo-500/50" : "border-white/8"}`}
            >
                <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-slate-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                    <input
                        type="checkbox"
                        checked={field.value === "true"}
                        onChange={e => onUpdate({ value: String(e.target.checked) })}
                        className="w-4 h-4 accent-indigo-500"
                        id={`checkbox-${field.id}`}
                    />
                    <input
                        value={field.label}
                        onChange={e => onUpdate({ label: e.target.value })}
                        className="flex-1 bg-transparent text-sm text-slate-300 outline-none border-none"
                    />
                    <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        );
    }

    // Text fields (text, textarea, date, number)
    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`group bg-white/5 border rounded-xl p-4 transition-all ${isDragOver ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/8 hover:border-white/15"}`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-slate-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    <input
                        value={field.label}
                        onChange={e => onUpdate({ label: e.target.value })}
                        className="bg-transparent text-sm font-medium text-slate-300 outline-none border-none flex-1 min-w-0"
                    />
                    {field.required && <span className="text-red-400 text-xs flex-shrink-0">*</span>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onUpdate({ required: !field.required })}
                        className={`p-1 rounded text-xs transition-all ${field.required ? "text-red-400" : "text-slate-600 hover:text-slate-300"}`}
                        title="Toggle required"
                    >
                        {field.required ? "req" : "opt"}
                    </button>
                    <button onClick={onRemove} className="p-1 text-slate-600 hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {field.type === "textarea" ? (
                <textarea
                    id={`field-${field.id}`}
                    value={field.value}
                    onChange={e => onUpdate({ value: e.target.value })}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    className="input-field text-sm resize-none h-24"
                />
            ) : field.type === "date" ? (
                <input
                    id={`field-${field.id}`}
                    type="date"
                    value={field.value}
                    onChange={e => onUpdate({ value: e.target.value })}
                    className="input-field text-sm"
                />
            ) : field.type === "number" ? (
                <input
                    id={`field-${field.id}`}
                    type="number"
                    value={field.value}
                    onChange={e => onUpdate({ value: e.target.value })}
                    placeholder={field.placeholder || "0"}
                    className="input-field text-sm"
                />
            ) : (
                <input
                    id={`field-${field.id}`}
                    type="text"
                    value={field.value}
                    onChange={e => onUpdate({ value: e.target.value })}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    className="input-field text-sm"
                />
            )}
        </div>
    );
}

// =================== PREVIEW MODAL ===================
function PreviewModal({ docTitle, docDescription, fields, onClose, onSave, saving }: {
    docTitle: string; docDescription: string; fields: DocumentField[];
    onClose: () => void; onSave: () => void; saving: boolean;
}) {
    const { data: session } = useSession();
    const tenantName = session?.user?.tenantName || "NotaryPro";
    const logoUrl = session?.user?.tenantLogoUrl;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/8 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-indigo-400" />
                        Document Preview
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-6">
                    <div className="bg-white rounded-xl p-8 text-gray-900 shadow-2xl min-h-96">
                        <div className="text-center border-b border-gray-200 pb-4 mb-6">
                            <div className="flex flex-col items-center gap-3 mb-4">
                                <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt={tenantName} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Stamp className="w-8 h-8 text-indigo-600" />
                                    )}
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tenantName}</p>
                            </div>
                            <h1 className="text-2xl font-bold">{docTitle || "Untitled Document"}</h1>
                            {docDescription && <p className="text-sm text-gray-600 mt-1">{docDescription}</p>}
                            <p className="text-xs text-gray-400 mt-2">
                                {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                        <div className="space-y-4">
                            {fields.map(field => (
                                <div key={field.id}>
                                    {field.type === "divider" ? (
                                        <div className="flex items-center gap-3 my-6">
                                            <div className="flex-1 border-t border-gray-300" />
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{field.label}</span>
                                            <div className="flex-1 border-t border-gray-300" />
                                        </div>
                                    ) : field.type === "signature" || field.type === "stamp" ? (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{field.label}</p>
                                            <div className="flex items-end gap-4">
                                                {field.imageData ? (
                                                    <div className="flex flex-col gap-1">
                                                        <img src={field.imageData} alt={field.label} className="max-h-24 border border-gray-200 rounded" />
                                                        {field.type === "signature" && <p className="text-[8px] text-gray-400 uppercase">E-Sign Ink</p>}
                                                    </div>
                                                ) : (
                                                    <div className="h-16 w-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                                        <span className="text-xs text-gray-400">No {field.type}</span>
                                                    </div>
                                                )}
                                                
                                                {field.type === "signature" && field.snapshotData && (
                                                    <div className="flex flex-col gap-1">
                                                        <img src={field.snapshotData} alt="Presence Snapshot" className="max-h-24 aspect-square object-cover border border-indigo-200 rounded" />
                                                        <p className="text-[8px] text-indigo-400 uppercase font-bold">Biometric Verification</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : field.type === "photo" ? (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{field.label}</p>
                                            {field.imageData ? (
                                                <img src={field.imageData} alt={field.label} className="max-h-48 border border-gray-200 rounded" />
                                            ) : (
                                                <div className="h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                                    <span className="text-xs text-gray-400">No photo provided</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : field.type === "checkbox" ? (
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${field.value === "true" ? "bg-indigo-600 border-indigo-600" : "border-gray-400"}`}>
                                                {field.value === "true" && <span className="text-white text-xs">✓</span>}
                                            </div>
                                            <span className="text-sm text-gray-700">{field.label}</span>
                                        </div>
                                    ) : (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                                {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                                            </p>
                                            <p className="text-sm text-gray-800 border-b border-gray-200 pb-1 min-h-6">
                                                {field.value || <span className="text-gray-300 italic">Not filled</span>}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-400">Notary Document — Generated on {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-white/8 flex gap-3">
                    <button onClick={onClose} className="flex-1 btn-secondary justify-center">
                        <ArrowLeft className="w-4 h-4" />Edit
                    </button>
                    <button onClick={onSave} disabled={saving} className="flex-1 btn-primary justify-center">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Document
                    </button>
                </div>
            </div>
        </div>
    );
}

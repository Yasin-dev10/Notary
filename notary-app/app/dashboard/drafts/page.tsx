"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Topbar } from "@/components/layout/Topbar";
import {
    FileText,
    Home,
    Car,
    Scale,
    Key,
    Plus,
    ChevronRight,
    Download,
    Eye,
    Trash2,
    Search,
    X,
    Save,
    FileCheck,
    Calendar,
    User,
    Loader2,
    CheckCircle,
    AlertCircle,
    Pencil,
    ArrowLeft,
    Printer,
    FileOutput,
    ClipboardList,
    Building2,
} from "lucide-react";
import toast from "react-hot-toast";

// ──────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────
interface TemplateField {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "textarea";
    required: boolean;
    placeholder?: string;
}

interface DocumentTemplate {
    id: string;
    name: string;
    description?: string;
    category: string;
    content: string;
    fields: TemplateField[];
    isDefault: boolean;
}

interface DraftDocument {
    id: string;
    title: string;
    status: string;
    fieldValues: Record<string, string>;
    createdAt: string;
    template: { id: string; name: string; category: string };
    client?: { id: string; firstName: string; lastName: string } | null;
}

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
}

// ──────────────────────────────────────────────────────
// CATEGORY CONFIG
// ──────────────────────────────────────────────────────
const categoryConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
    real_estate: {
        icon: Home,
        label: "Real Estate",
        color: "text-emerald-400",
        bg: "from-emerald-600 to-teal-600",
    },
    vehicle: {
        icon: Car,
        label: "Vehicle",
        color: "text-amber-400",
        bg: "from-amber-600 to-orange-600",
    },
    legal: {
        icon: Scale,
        label: "Legal",
        color: "text-purple-400",
        bg: "from-purple-600 to-indigo-600",
    },
    rental: {
        icon: Key,
        label: "Rental",
        color: "text-blue-400",
        bg: "from-blue-600 to-cyan-600",
    },
    general: {
        icon: FileText,
        label: "General",
        color: "text-slate-400",
        bg: "from-slate-600 to-slate-500",
    },
};

// ──────────────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────────────
type View = "list" | "choose-template" | "fill-form" | "preview" | "draft-detail";

export default function DraftsPage() {
    const [view, setView] = useState<View>("list");
    const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
    const [drafts, setDrafts] = useState<DraftDocument[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
    const [selectedDraft, setSelectedDraft] = useState<DraftDocument | null>(null);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [formTitle, setFormTitle] = useState("");
    const [selectedClientId, setSelectedClientId] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generatedContent, setGeneratedContent] = useState("");
    const previewRef = useRef<HTMLDivElement>(null);

    // Load initial data
    useEffect(() => {
        loadTemplates();
        loadDrafts();
        loadClients();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/drafts/templates");
            if (res.ok) setTemplates(await res.json());
        } catch { } finally {
            setLoading(false);
        }
    };

    const loadDrafts = async () => {
        try {
            const res = await fetch("/api/drafts");
            if (res.ok) {
                const data = await res.json();
                setDrafts(data.drafts || []);
            }
        } catch { }
    };

    const loadClients = async () => {
        try {
            const res = await fetch("/api/clients?limit=100");
            if (res.ok) {
                const data = await res.json();
                setClients(data.clients || []);
            }
        } catch { }
    };

    // ── Fill placeholders ──────────────────────────────
    const fillTemplate = useCallback(
        (values: Record<string, string>, content: string) => {
            let filled = content;
            Object.entries(values).forEach(([key, val]) => {
                filled = filled.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val || `[${key}]`);
            });
            return filled;
        },
        []
    );

    // ── Select template → go to form ──────────────────
    const handleSelectTemplate = (template: DocumentTemplate) => {
        setSelectedTemplate(template);
        const initial: Record<string, string> = {};
        template.fields.forEach((f) => (initial[f.name] = ""));
        setFieldValues(initial);
        setFormTitle(`${template.name} - ${new Date().toLocaleDateString()}`);
        setSelectedClientId("");
        setView("fill-form");
    };

    // ── Preview ───────────────────────────────────────
    const handlePreview = () => {
        if (!selectedTemplate) return;
        const content = fillTemplate(fieldValues, selectedTemplate.content);
        setGeneratedContent(content);
        setView("preview");
    };

    // ── Save Draft ────────────────────────────────────
    const handleSaveDraft = async (status: "DRAFT" | "FINALIZED") => {
        if (!selectedTemplate || !formTitle) {
            toast.error("Please enter a document title");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/drafts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formTitle,
                    templateId: selectedTemplate.id,
                    fieldValues,
                    clientId: selectedClientId || null,
                    status,
                }),
            });
            if (!res.ok) throw new Error();
            toast.success(status === "FINALIZED" ? "Document finalized! ✅" : "Draft saved! 💾");
            await loadDrafts();
            setView("list");
        } catch {
            toast.error("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // ── PDF Generation (client-side) ──────────────────
    const handleDownloadPDF = async () => {
        if (!selectedTemplate) return;
        const content = generatedContent || fillTemplate(fieldValues, selectedTemplate.content);

        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ unit: "mm", format: "a4" });

        const margin = 20;
        const pageWidth = 210;
        const contentWidth = pageWidth - margin * 2;
        const lineHeight = 6;
        let y = margin;

        // Header bar
        doc.setFillColor(67, 56, 202); // indigo-700
        doc.rect(0, 0, pageWidth, 14, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text("NOTARYPRO — OFFICIAL DOCUMENT", pageWidth / 2, 9, { align: "center" });

        y = 24;

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 60);
        doc.text(formTitle.toUpperCase(), pageWidth / 2, y, { align: "center" });
        y += 8;

        // Divider
        doc.setDrawColor(67, 56, 202);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;

        // Body
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);

        const lines = content.split("\n");
        lines.forEach((line: string) => {
            if (y > 270) {
                doc.addPage();
                y = margin;
            }
            const wrapped = doc.splitTextToSize(line || " ", contentWidth);
            wrapped.forEach((wl: string) => {
                doc.text(wl, margin, y);
                y += lineHeight;
            });
        });

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont("helvetica", "normal");
            doc.text(
                `Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
                pageWidth / 2,
                290,
                { align: "center" }
            );
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, 286, pageWidth - margin, 286);
        }

        doc.save(`${formTitle.replace(/\s+/g, "_")}.pdf`);
        toast.success("PDF downloaded! 📄");
    };

    // ── Print ─────────────────────────────────────────
    const handlePrint = () => {
        const content = generatedContent;
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`<!DOCTYPE html><html><head>
<title>${formTitle}</title>
<style>
  body { font-family: 'Courier New', monospace; font-size: 11pt; margin: 40px; color: #111; line-height: 1.7; }
  h1 { text-align:center; color:#312e81; font-size:14pt; margin-bottom:4px; }
  hr { border: 1px solid #312e81; margin: 12px 0; }
  .header { background:#3730a3; color:white; padding:8px 20px; margin:-40px -40px 30px; text-align:center; font-weight:bold; letter-spacing:1px; }
  pre { white-space:pre-wrap; word-break:break-word; font-family: inherit; }
  @media print { .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
<div class="header">NOTARYPRO — OFFICIAL DOCUMENT</div>
<h1>${formTitle}</h1>
<hr/>
<pre>${content}</pre>
<hr/>
<p style="text-align:center;font-size:9pt;color:#999">Generated: ${new Date().toLocaleString()}</p>
</body></html>`);
        win.document.close();
        win.print();
    };

    // ──────────────────────────────────────────────────
    // VIEW: DRAFT LIST
    // ──────────────────────────────────────────────────
    if (view === "list") {
        const filtered = drafts.filter((d) =>
            d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.template.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="min-h-screen">
                <Topbar
                    title="Document Drafting Tool"
                    subtitle="Ku samee heshiisyada system-ka dhexdiisa"
                />
                <div className="p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Templates", value: templates.length, icon: ClipboardList, color: "from-indigo-600 to-purple-600" },
                            { label: "All Drafts", value: drafts.length, icon: FileText, color: "from-slate-600 to-slate-500" },
                            { label: "Finalized", value: drafts.filter(d => d.status === "FINALIZED").length, icon: FileCheck, color: "from-emerald-600 to-teal-600" },
                            { label: "In Progress", value: drafts.filter(d => d.status === "DRAFT").length, icon: Pencil, color: "from-amber-600 to-orange-600" },
                        ].map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className="stat-card">
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                                        <Icon className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <p className="text-2xl font-bold text-white">{s.value}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                id="search-drafts"
                                type="text"
                                placeholder="Search drafts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input pl-10 w-full"
                            />
                        </div>
                        <button
                            id="btn-new-draft"
                            onClick={() => setView("choose-template")}
                            className="btn-primary flex items-center gap-2 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            New Document
                        </button>
                    </div>

                    {/* Drafts table or empty */}
                    {filtered.length === 0 ? (
                        <div className="glass-card p-16 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
                                <FileOutput className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Drafts Yet</h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                                Template ka dooro, meelaha buuxi, PDF-kana dajiso dhawaaq keliya!
                            </p>
                            <button
                                id="btn-start-drafting"
                                onClick={() => setView("choose-template")}
                                className="btn-primary"
                            >
                                Start Drafting
                            </button>
                        </div>
                    ) : (
                        <div className="glass-card overflow-hidden">
                            <div className="p-5 border-b border-white/8 flex items-center justify-between">
                                <h3 className="section-title">Recent Drafts</h3>
                                <span className="badge-blue">{filtered.length} documents</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                {filtered.map((draft) => {
                                    const cat = categoryConfig[draft.template.category] || categoryConfig.general;
                                    const CatIcon = cat.icon;
                                    return (
                                        <div
                                            key={draft.id}
                                            className="flex items-center gap-4 p-4 hover:bg-white/3 transition-colors group"
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.bg} flex items-center justify-center flex-shrink-0`}>
                                                <CatIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-200 truncate">{draft.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {draft.template.name}
                                                    {draft.client && ` · ${draft.client.firstName} ${draft.client.lastName}`}
                                                    {" · "}
                                                    {new Date(draft.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={draft.status === "FINALIZED" ? "badge-green" : "badge-yellow"}>
                                                {draft.status}
                                            </span>
                                            <button
                                                id={`view-draft-${draft.id}`}
                                                onClick={() => {
                                                    setSelectedDraft(draft);
                                                    // Find template
                                                    const tpl = templates.find(t => t.id === draft.template.id);
                                                    if (tpl) {
                                                        setSelectedTemplate(tpl);
                                                        setFieldValues(draft.fieldValues || {});
                                                        setFormTitle(draft.title);
                                                        const content = fillTemplate(draft.fieldValues || {}, tpl.content);
                                                        setGeneratedContent(content);
                                                        setView("preview");
                                                    }
                                                }}
                                                className="p-2 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                title="View / Download"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                id={`delete-draft-${draft.id}`}
                                                onClick={async () => {
                                                    if (!confirm("Delete this draft?")) return;
                                                    await fetch(`/api/drafts/${draft.id}`, { method: "DELETE" });
                                                    toast.success("Draft deleted");
                                                    loadDrafts();
                                                }}
                                                className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ──────────────────────────────────────────────────
    // VIEW: CHOOSE TEMPLATE
    // ──────────────────────────────────────────────────
    if (view === "choose-template") {
        const grouped: Record<string, DocumentTemplate[]> = {};
        templates.forEach((t) => {
            if (!grouped[t.category]) grouped[t.category] = [];
            grouped[t.category].push(t);
        });

        return (
            <div className="min-h-screen">
                <Topbar title="Choose Template" subtitle="Heshiiskaaga noocka dooro" />
                <div className="p-6 space-y-6">
                    <button
                        id="btn-back-list"
                        onClick={() => setView("list")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Drafts
                    </button>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                        </div>
                    ) : (
                        Object.entries(grouped).map(([category, temps]) => {
                            const cat = categoryConfig[category] || categoryConfig.general;
                            const CatIcon = cat.icon;
                            return (
                                <div key={category}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${cat.bg} flex items-center justify-center`}>
                                            <CatIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                                            {cat.label}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                                        {temps.map((template) => (
                                            <button
                                                key={template.id}
                                                id={`select-template-${template.id}`}
                                                onClick={() => handleSelectTemplate(template)}
                                                className="glass-card p-5 text-left hover:border-indigo-500/40 hover:bg-white/5 transition-all group hover:scale-[1.01] duration-200"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.bg} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                                                        <CatIcon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-tight">
                                                            {template.name}
                                                        </h4>
                                                        {template.description && (
                                                            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                                                                {template.description}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-slate-600 mt-2">
                                                            {template.fields.length} fields
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-0.5" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }

    // ──────────────────────────────────────────────────
    // VIEW: FILL FORM
    // ──────────────────────────────────────────────────
    if (view === "fill-form" && selectedTemplate) {
        return (
            <div className="min-h-screen">
                <Topbar
                    title={selectedTemplate.name}
                    subtitle="Buuxi meelaha banaan ee heshiiska"
                />
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            id="btn-back-templates"
                            onClick={() => setView("choose-template")}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="text-xs">Choose Template</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-xs text-indigo-400 font-medium">Fill Fields</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* FORM */}
                        <div className="xl:col-span-2 space-y-5">
                            {/* Document metadata */}
                            <div className="glass-card p-5 space-y-4">
                                <h3 className="section-title flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-indigo-400" />
                                    Document Info
                                </h3>
                                <div>
                                    <label className="form-label">Document Title *</label>
                                    <input
                                        id="field-doc-title"
                                        type="text"
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        className="form-input w-full"
                                        placeholder="e.g. Guri Iib Axmed Cali - 2026"
                                    />
                                </div>
                                <div>
                                    <label className="form-label flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        Attach to Client (Optional)
                                    </label>
                                    <select
                                        id="field-client-select"
                                        value={selectedClientId}
                                        onChange={(e) => setSelectedClientId(e.target.value)}
                                        className="form-input w-full"
                                    >
                                        <option value="">— No client —</option>
                                        {clients.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.firstName} {c.lastName}
                                                {c.email ? ` (${c.email})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Template fields */}
                            <div className="glass-card p-5">
                                <h3 className="section-title flex items-center gap-2 mb-5">
                                    <ClipboardList className="w-4 h-4 text-indigo-400" />
                                    Template Fields
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedTemplate.fields.map((field) => (
                                        <div
                                            key={field.name}
                                            className={field.type === "textarea" ? "sm:col-span-2" : ""}
                                        >
                                            <label className="form-label flex items-center gap-1">
                                                {field.label}
                                                {field.required && (
                                                    <span className="text-red-400 text-xs">*</span>
                                                )}
                                            </label>
                                            {field.type === "textarea" ? (
                                                <textarea
                                                    id={`field-${field.name}`}
                                                    value={fieldValues[field.name] || ""}
                                                    onChange={(e) =>
                                                        setFieldValues((prev) => ({
                                                            ...prev,
                                                            [field.name]: e.target.value,
                                                        }))
                                                    }
                                                    className="form-input w-full min-h-[90px] resize-y"
                                                    placeholder={field.placeholder || ""}
                                                />
                                            ) : (
                                                <input
                                                    id={`field-${field.name}`}
                                                    type={field.type}
                                                    value={fieldValues[field.name] || ""}
                                                    onChange={(e) =>
                                                        setFieldValues((prev) => ({
                                                            ...prev,
                                                            [field.name]: e.target.value,
                                                        }))
                                                    }
                                                    className="form-input w-full"
                                                    placeholder={field.placeholder || ""}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* LIVE MINI PREVIEW */}
                        <div className="xl:col-span-1">
                            <div className="glass-card p-5 sticky top-6">
                                <h3 className="section-title flex items-center gap-2 mb-4">
                                    <Eye className="w-4 h-4 text-indigo-400" />
                                    Live Preview
                                </h3>
                                <div className="bg-white rounded-xl p-4 max-h-96 overflow-y-auto">
                                    <pre className="text-[9px] text-gray-700 whitespace-pre-wrap font-mono leading-tight">
                                        {fillTemplate(fieldValues, selectedTemplate.content)}
                                    </pre>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 space-y-2">
                                    <button
                                        id="btn-preview-full"
                                        onClick={handlePreview}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Full Preview & Download
                                    </button>
                                    <button
                                        id="btn-save-draft"
                                        onClick={() => handleSaveDraft("DRAFT")}
                                        disabled={saving}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all text-sm font-medium disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Draft
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ──────────────────────────────────────────────────
    // VIEW: FULL PREVIEW
    // ──────────────────────────────────────────────────
    if (view === "preview" && selectedTemplate) {
        return (
            <div className="min-h-screen">
                <Topbar title="Document Preview" subtitle={formTitle} />
                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <button
                            id="btn-back-form"
                            onClick={() => {
                                if (selectedDraft) {
                                    setSelectedDraft(null);
                                    setView("list");
                                } else {
                                    setView("fill-form");
                                }
                            }}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                id="btn-print"
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-medium transition-all"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                            <button
                                id="btn-download-pdf"
                                onClick={handleDownloadPDF}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                            {!selectedDraft && (
                                <button
                                    id="btn-finalize"
                                    onClick={() => handleSaveDraft("FINALIZED")}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                                    Save & Finalize
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Document preview wrapper */}
                    <div className="max-w-4xl mx-auto">
                        <div className="glass-card overflow-hidden">
                            {/* Document header */}
                            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-8 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">NOTARYPRO OFFICIAL DOCUMENT</p>
                                        <p className="text-indigo-200 text-xs">{selectedTemplate.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/70 text-xs">Generated</p>
                                    <p className="text-white text-xs font-medium">
                                        {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                    </p>
                                </div>
                            </div>

                            {/* Document body - mimics paper */}
                            <div className="bg-white p-10" ref={previewRef}>
                                <h1 className="text-center text-lg font-bold text-gray-800 mb-2">{formTitle}</h1>
                                <hr className="border-indigo-700 mb-6" />
                                <pre className="font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {generatedContent}
                                </pre>
                                <hr className="border-gray-200 mt-8 mb-4" />
                                <p className="text-center text-xs text-gray-400">
                                    Generated by NotaryPro · {new Date().toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
    Calendar, 
    Clock, 
    User, 
    Mail, 
    Phone, 
    FileText, 
    Upload, 
    CheckCircle2, 
    Loader2, 
    LayoutDashboard,
    X,
    MapPin,
    AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Tenant {
    id: string;
    name: string;
    logoUrl: string | null;
    themeColor: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
}

export default function PublicBookingPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form settings
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        title: "Document Notarization",
        description: "",
        date: "",
        time: "",
        location: "",
    });

    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const res = await fetch(`/api/notary/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setTenant(data);
                } else {
                    toast.error("Notary office not found");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load office details");
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchTenant();
    }, [slug]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const uploaded = [...uploadedFiles];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const data = new FormData();
            data.append("file", file);

            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: data,
                });

                if (res.ok) {
                    const result = await res.json();
                    uploaded.push({
                        name: file.name,
                        fileUrl: result.fileUrl,
                        fileSize: file.size,
                        mimeType: file.type,
                    });
                } else {
                    toast.error(`Failed to upload ${file.name}`);
                }
            } catch (error) {
                toast.error(`Error uploading ${file.name}`);
            }
        }

        setUploadedFiles(uploaded);
        setUploading(false);
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;

        if (!formData.date || !formData.time) {
            toast.error("Please select both date and time");
            return;
        }

        setSubmitting(true);

        try {
            // Combine date and time
            const startTime = new Date(`${formData.date}T${formData.time}`);
            const endTime = new Date(startTime.getTime() + 30 * 60000); // Default 30 mins

            const res = await fetch("/api/appointments/client", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantId: tenant.id,
                    ...formData,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    documents: uploadedFiles,
                }),
            });

            if (res.ok) {
                setSuccess(true);
                toast.success("Appointment booked successfully!");
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to book appointment");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-grid">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Loading booking portal...</p>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-grid">
                <div className="glass-card p-10 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Office Not Found</h1>
                    <p className="text-slate-400 mb-6">The notary office you are looking for does not exist or has been deactivated.</p>
                    <a href="/" className="btn-primary w-full justify-center">Return Home</a>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 bg-grid">
                <div className="glass-card p-10 max-w-lg w-full text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-3">Booking Confirmed!</h1>
                    <p className="text-slate-400 mb-8">
                        Thank you, <span className="text-indigo-400 font-semibold">{formData.firstName}</span>. Your appointment has been scheduled for <span className="text-white">{formData.date}</span> at <span className="text-white">{formData.time}</span>. 
                        We will review your documents (Pre-screening) and contact you shortly.
                    </p>
                    
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Office:</span>
                            <span className="text-slate-200 font-medium">{tenant.name}</span>
                        </div>
                        {tenant.address && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Location:</span>
                                <span className="text-slate-200 font-medium flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {tenant.address}
                                </span>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn-secondary w-full justify-center mt-10"
                    >
                        Book Another Appointment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 bg-grid py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-10">
                    {tenant.logoUrl ? (
                        <img src={tenant.logoUrl} alt={tenant.name} className="h-16 mb-6 object-contain" />
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/25">
                            <LayoutDashboard className="w-8 h-8 text-white" />
                        </div>
                    )}
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                        Schedule an Appointment
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Book your visit to <span className="text-indigo-400 font-semibold">{tenant.name}</span>. 
                        Upload your documents below so our team can pre-screen them before your arrival.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Client & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-card p-8">
                            <h2 className="section-title mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-400" /> Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            required
                                            value={formData.firstName}
                                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                                            className="input-field pl-11" 
                                            placeholder="Ahmed" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Last Name</label>
                                    <input 
                                        required
                                        value={formData.lastName}
                                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                                        className="input-field" 
                                        placeholder="Ali" 
                                    />
                                </div>
                                <div>
                                    <label className="label">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                            className="input-field pl-11" 
                                            placeholder="ahmed@example.com" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                            className="input-field pl-11" 
                                            placeholder="+252 ..." 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8">
                            <h2 className="section-title mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-400" /> Appointment Details
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Purpose of Visit</label>
                                    <select 
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="input-field appearance-none cursor-pointer"
                                    >
                                        <option value="Document Notarization">Document Notarization</option>
                                        <option value="Power of Attorney">Power of Attorney</option>
                                        <option value="Affidavit">Affidavit</option>
                                        <option value="Contract Signing">Contract Signing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Additional Notes (Optional)</label>
                                    <textarea 
                                        rows={3}
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        placeholder="E.g. I need to notarize 3 copies of my graduation certificate."
                                        className="input-field resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pre-screening Documents Upload */}
                        <div className="glass-card p-8">
                            <h2 className="section-title mb-2 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-indigo-400" /> Pre-screening Documents
                            </h2>
                            <p className="text-xs text-slate-500 mb-6">Upload clear scans or photos of your documents to speed up the process.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="relative group cursor-pointer">
                                    <input 
                                        type="file" 
                                        multiple 
                                        className="hidden" 
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    <div className="h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all">
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                                                <span className="text-xs text-slate-400">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-2 group-hover:bg-indigo-500/20 transition-colors">
                                                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                                                </div>
                                                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">Click to upload files</span>
                                            </>
                                        )}
                                    </div>
                                </label>

                                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                    {uploadedFiles.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center border border-white/5 bg-white/2 rounded-2xl text-slate-600">
                                            <FileText className="w-6 h-6 mb-1 opacity-20" />
                                            <span className="text-[10px]">No files uploaded yet</span>
                                        </div>
                                    ) : (
                                        uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 group animate-in slide-in-from-right-2 duration-300">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                                    </div>
                                                    <span className="text-xs text-slate-300 truncate">{file.name}</span>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Date/Time Sidebar */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 sticky top-8">
                            <h2 className="section-title mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-400" /> Select Time
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="label text-xs">Appointment Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            required
                                            type="date" 
                                            value={formData.date}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={e => setFormData({...formData, date: e.target.value})}
                                            className="input-field pl-10 block" 
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="label text-xs">Preferred Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            required
                                            type="time" 
                                            value={formData.time}
                                            onChange={e => setFormData({...formData, time: e.target.value})}
                                            className="input-field pl-10 block" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 space-y-4">
                                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-slate-400 italic">
                                        Your session will take approximately 30 minutes. Please arrive 5 minutes early.
                                    </div>
                                    
                                    <button 
                                        type="submit"
                                        disabled={submitting || uploading}
                                        className="btn-primary w-full justify-center text-base py-3 shadow-indigo-500/40"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Confirm Booking"
                                        )}
                                    </button>
                                    
                                    <p className="text-[10px] text-center text-slate-500 px-2">
                                        By booking, you agree to our terms of service and privacy policy regarding document handling.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Office Highlights */}
                        <div className="glass-card p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Pre-screening</p>
                                    <p className="text-xs text-slate-500">Save time at the office</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Fast Service</p>
                                    <p className="text-xs text-slate-500">Average 30m turnaround</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-12 text-center text-slate-600 text-sm">
                    <p>&copy; {new Date().getFullYear()} {tenant.name}. Powered by NotaryPro.</p>
                </div>
            </div>
        </div>
    );
}


"use client";

import { useState, useEffect } from "react";
import { 
    X, 
    Loader2, 
    Calendar, 
    Clock, 
    User, 
    FileText, 
    CheckCircle, 
    AlertCircle, 
    Download, 
    ExternalLink,
    MapPin,
    Trash2,
    CheckSquare,
    MoreVertical,
    DollarSign,
    Receipt
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
interface Document {
    id: string;
    name: string;
    fileUrl: string;
    status: string;
    createdAt: string;
}

interface Transaction {
    id: string;
    description: string;
    amount: number;
    currency: string;
    paymentStatus: string;
    createdAt: string;
}

interface AppointmentDetail {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    status: string;
    location: string | null;
    notes: string | null;
    client: { 
        id: string; 
        firstName: string; 
        lastName: string; 
        email: string; 
        phone: string | null 
    };
    notary: { id: string; firstName: string; lastName: string } | null;
    documents: Document[];
    transactions: Transaction[];
}

interface Props {
    appointmentId: string;
    onClose: () => void;
    onUpdate: () => void;
}

export default function AppointmentDetailModal({ appointmentId, onClose, onUpdate }: Props) {
    const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`/api/appointments/${appointmentId}`);
            if (res.ok) {
                const data = await res.json();
                setAppointment(data);
            } else {
                toast.error("Failed to load appointment details");
                onClose();
            }
        } catch (error) {
            toast.error("Error fetching appointment");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [appointmentId, onClose]);

    const updateStatus = async (newStatus: string) => {
        if (!appointment) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/appointments/${appointmentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                toast.success(`Status updated to ${newStatus}`);
                setAppointment({ ...appointment, status: newStatus });
                onUpdate();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                <div className="relative glass-card p-12 flex flex-col items-center justify-center min-w-[300px]">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                    <p className="text-slate-400">Loading details...</p>
                </div>
            </div>
        );
    }

    if (!appointment) return null;

    const statusColors: Record<string, string> = {
        PENDING: "badge-yellow",
        CONFIRMED: "badge-blue",
        COMPLETED: "badge-green",
        CANCELLED: "badge-red",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl glass-card overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{appointment.title}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={statusColors[appointment.status]}>{appointment.status}</span>
                                <span className="text-slate-500 text-xs">ID: {appointment.id.split('-')[0]}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {appointment.status === "PENDING" && (
                            <button 
                                onClick={() => updateStatus("CONFIRMED")} 
                                disabled={updating}
                                className="btn-primary py-2 px-3 text-xs"
                            >
                                <CheckSquare className="w-4 h-4" /> Confirm Appointment
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Left Panel: Details */}
                    <div className="md:col-span-1 p-6 border-r border-white/8 space-y-8 bg-white/2">
                        {/* Client Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> Client Information
                            </h3>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 border border-white/5">
                                    {appointment.client.firstName[0]}{appointment.client.lastName[0]}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">{appointment.client.firstName} {appointment.client.lastName}</p>
                                    <p className="text-xs text-slate-400 truncate">{appointment.client.email}</p>
                                    <p className="text-xs text-slate-400 mt-1">{appointment.client.phone || "No phone"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Schedule
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                    <p className="text-sm">{format(new Date(appointment.startTime), "EEEE, MMM d, yyyy")}</p>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Clock className="w-4 h-4 text-indigo-400" />
                                    <p className="text-sm">
                                        {format(new Date(appointment.startTime), "h:mm a")} – {format(new Date(appointment.endTime), "h:mm a")}
                                    </p>
                                </div>
                                {appointment.location && (
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <MapPin className="w-4 h-4 text-indigo-400" />
                                        <p className="text-sm">{appointment.location}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-4 pt-4">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <button className="btn-secondary w-full justify-start text-xs py-2 h-auto" onClick={() => updateStatus("CANCELLED")}>
                                    <X className="w-3.5 h-3.5 text-red-500" /> Cancel Session
                                </button>
                                <button className="btn-secondary w-full justify-start text-xs py-2 h-auto" onClick={() => updateStatus("COMPLETED")}>
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Mark Completed
                                </button>
                                <button className="btn-primary w-full justify-start text-xs py-2 h-auto bg-emerald-600 hover:bg-emerald-500" onClick={() => setShowBillModal(true)}>
                                    <DollarSign className="w-3.5 h-3.5" /> Bill Client
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Pre-screening & Previews */}
                    <div className="md:col-span-2 p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                        <div>
                            <h3 className="section-title mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-400" /> Pre-screening Documents
                            </h3>
                            
                            {appointment.documents.length === 0 ? (
                                <div className="glass-card bg-indigo-500/5 border-dashed border-indigo-500/20 py-12 flex flex-col items-center justify-center">
                                    <AlertCircle className="w-10 h-10 text-slate-600 mb-3" />
                                    <p className="text-slate-400 text-sm">No documents were uploaded with this booking.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {appointment.documents.map((doc) => (
                                        <div key={doc.id} className="glass-card-hover p-4 flex flex-col justify-between h-32 relative group">
                                            <div className="flex items-start justify-between">
                                                <div className="p-2 rounded-xl bg-white/10 group-hover:bg-indigo-600/30 transition-colors">
                                                    <FileText className="w-5 h-5 text-indigo-300" />
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a 
                                                        href={doc.fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg"
                                                        title="View Document"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                    <a 
                                                        href={doc.fileUrl} 
                                                        download 
                                                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg"
                                                        title="Download"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-white truncate max-w-full" title={doc.name}>
                                                    {doc.name}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1">Uploaded {format(new Date(doc.createdAt), "MMM d, h:mm a")}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {appointment.description && (
                            <div className="pt-4">
                                <h3 className="section-title mb-3">Client Description / Purpose</h3>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-slate-300 leading-relaxed">
                                    {appointment.description}
                                </div>
                            </div>
                        )}

                        {appointment.notes && (
                            <div className="pt-4">
                                <h3 className="section-title mb-3">Office Internal Notes</h3>
                                <textarea 
                                    className="input-field min-h-[80px]" 
                                    defaultValue={appointment.notes}
                                    placeholder="Add internal notes about this booking..."
                                />
                            </div>
                        )}

                        <div className="pt-4">
                            <h3 className="section-title mb-4 flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-emerald-400" /> Billing History
                            </h3>
                            {appointment.transactions.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">No transactions recorded for this appointment.</p>
                            ) : (
                                <div className="space-y-3">
                                    {appointment.transactions.map((tx) => (
                                        <div key={tx.id} className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-white">{tx.description}</p>
                                                <p className="text-[10px] text-slate-500">{format(new Date(tx.createdAt), "MMM d, yyyy")}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">{tx.currency} {tx.amount.toLocaleString()}</p>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${tx.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                    {tx.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showBillModal && (
                <AddTransactionModal 
                    onClose={() => setShowBillModal(false)}
                    onSuccess={() => {
                        setShowBillModal(false);
                        fetchDetails();
                        onUpdate();
                        toast.success("Transaction recorded");
                    }}
                    initialData={{
                        clientId: appointment.client.id,
                        appointmentId: appointment.id,
                        description: `Services for ${appointment.title}`
                    }}
                />
            )}
        </div>
    );
}

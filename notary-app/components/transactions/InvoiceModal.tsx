"use client";

import { X, Printer, Download, Building2, User, CreditCard, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: {
        id: string;
        description: string;
        amount: number;
        currency: string;
        paymentStatus: string;
        paymentMethod: string | null;
        createdAt: string;
        client: { firstName: string, lastName: string } | null;
        processedBy: { firstName: string, lastName: string } | null;
    };
}

import { useSession } from "next-auth/react";

export function InvoiceModal({ isOpen, onClose, transaction }: InvoiceModalProps) {
    const { data: session } = useSession();
    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    const tenantName = session?.user?.tenantName || "Notary System";
    const logoUrl = session?.user?.tenantLogoUrl;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 print:bg-white print:p-0">
            <div className="glass-card w-full max-w-2xl overflow-hidden relative border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 print:shadow-none print:border-0 print:m-0 print:w-full print:max-w-none print:bg-white">
                
                {/* Header Actions - Hidden on print */}
                <div className="p-4 border-b border-white/8 flex items-center justify-between bg-white/5 print:hidden">
                    <h3 className="text-lg font-semibold text-white">Invoice / Receipt</h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrint}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all flex items-center gap-2 text-sm font-medium"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="p-8 bg-slate-950/50 print:bg-white print:text-black">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center print:bg-white print:border overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt={tenantName} className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <Building2 className="w-7 h-7 text-white print:text-indigo-600" />
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-white print:text-black uppercase tracking-tight">{tenantName}</h1>
                            </div>
                            <p className="text-slate-400 print:text-slate-600 text-sm">Official Notary Services</p>
                            <p className="text-slate-500 print:text-slate-500 text-xs truncate max-w-[200px]">Workspace: {session?.user?.tenantSlug}.notarypro.com</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-black text-indigo-500 print:text-indigo-600 uppercase mb-2">RECEIPT</h2>
                            <p className="text-xs text-slate-500 font-mono">#{transaction.id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-sm text-slate-400 print:text-slate-600 mt-2">{format(new Date(transaction.createdAt), "MMMM d, yyyy")}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12 border-t border-white/8 print:border-slate-200 pt-8">
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Billed To</h3>
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-white print:text-black">
                                    {transaction.client ? `${transaction.client.firstName} ${transaction.client.lastName}` : "Walk-in Client"}
                                </p>
                                <p className="text-sm text-slate-400 print:text-slate-600">Client ID Record Included</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Payment Info</h3>
                            <div className="space-y-1">
                                <p className="text-sm text-slate-300 print:text-slate-700">
                                    Method: <span className="font-semibold">{transaction.paymentMethod || "Cash"}</span>
                                </p>
                                <div className="flex items-center justify-end gap-2 mt-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${transaction.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 print:text-emerald-600' : 'bg-amber-500/20 text-amber-400'}`}>
                                        {transaction.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-12">
                        <table className="w-full text-left">
                            <thead className="border-b border-white/8 print:border-slate-200">
                                <tr>
                                    <th className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                                    <th className="py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/4 print:divide-slate-100">
                                <tr>
                                    <td className="py-6">
                                        <p className="text-slate-200 print:text-black font-medium">{transaction.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">Notary stamping and registration fee</p>
                                    </td>
                                    <td className="py-6 text-right">
                                        <p className="text-slate-200 print:text-black font-bold">
                                            {transaction.currency} {transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot className="border-t-2 border-white/8 print:border-slate-800">
                                <tr>
                                    <td className="py-6 text-right text-slate-500 font-bold uppercase text-xs">Total Amount</td>
                                    <td className="py-6 text-right">
                                        <p className="text-2xl font-black text-white print:text-black">
                                            {transaction.currency} {transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </p>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="flex justify-between items-end pt-12 border-t border-dashed border-white/10 print:border-slate-200">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <User className="w-3.5 h-3.5" />
                                <span>Issued by: {transaction.processedBy ? `${transaction.processedBy.firstName} ${transaction.processedBy.lastName}` : "System Admin"}</span>
                            </div>
                            <p className="text-[10px] text-slate-600 italic">This is a computer-generated receipt and requires no physical signature.</p>
                        </div>
                        <div className="text-right">
                            <div className="w-24 h-24 border border-white/5 bg-white/5 rounded-xl flex items-center justify-center p-2 mb-2 ml-auto opacity-50 grayscale print:opacity-100">
                                {/* Placeholder for a system stamp or a small QR code */}
                                <div className="text-[8px] text-slate-600 font-bold text-center uppercase leading-tight">
                                    Official<br/>Notary<br/>Seal
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white/5 border-t border-white/8 text-center print:hidden">
                    <p className="text-[10px] text-slate-500">
                        Thank you for your business. For any queries, please contact our support department.
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { 
    LifeBuoy, 
    MessageSquare, 
    User, 
    Clock, 
    Search, 
    Filter, 
    AlertCircle, 
    CheckCircle2, 
    ChevronRight,
    Loader2,
    Send,
    Tag,
    Paperclip,
    Building2
} from "lucide-react";
import { useState } from "react";

interface Ticket {
    id: string;
    subject: string;
    tenant: string;
    tenantSlug: string;
    status: 'OPEN' | 'RESOLVED' | 'URGENT' | 'IN_PROGRESS';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdAt: string;
    author: string;
}

export default function TechSupport() {
    const [loading, setLoading] = useState(false);
    
    const tickets: Ticket[] = [
        {
            id: "T-104",
            subject: "Unable to upload signatures from mobile device",
            tenant: "Southside Legal",
            tenantSlug: "southside",
            status: "URGENT",
            priority: "CRITICAL",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            author: "Sarah Miller (Admin)"
        },
        {
            id: "T-112",
            subject: "Billing error on custom domain setup",
            tenant: "Prime Notary",
            tenantSlug: "prime-notary",
            status: "IN_PROGRESS",
            priority: "HIGH",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            author: "Marc Johnson (Admin)"
        },
        {
            id: "T-115",
            subject: "Feature Request: Document Watermarking",
            tenant: "Central Notary",
            tenantSlug: "central-notary",
            status: "OPEN",
            priority: "LOW",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            author: "Adam Smith (Admin)"
        }
    ];

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-indigo-600">
                        Technical Headquarters
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">
                        Interface for Super Admins to resolve critical technical debt and provide concierge support to Tenant Admins.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-red-100 transition-all transform hover:-translate-y-1">
                        <AlertCircle size={18} className="mr-2" />
                        Platform Incident
                    </button>
                    <button className="flex items-center justify-center px-6 py-3 bg-white border border-gray-100 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-50 shadow-sm transition-all shadow-indigo-50">
                        Knowledge Base
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tickets List */}
                <div className="lg:col-span-12 xl:col-span-12 space-y-6">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                         <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by ticket ID, tenant, or subject..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-red-500/20 outline-none font-medium text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all font-bold text-sm flex items-center gap-2">
                                <Filter size={18} />
                                Priority
                            </button>
                            <button className="px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all font-bold text-sm flex items-center gap-2">
                                <Tag size={18} />
                                Status
                            </button>
                        </div>
                    </div>

                    {/* Support Queue */}
                    <div className="bg-white shadow-2xl shadow-indigo-100/20 border border-gray-100 rounded-[2.5rem] overflow-hidden">
                        <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <LifeBuoy size={24} className="text-indigo-600" />
                                Concierge Support Queue
                            </h3>
                            <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-lg uppercase tracking-wider">
                                4 Active Requests
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="p-10 hover:bg-gray-50/50 transition-all cursor-pointer group relative overflow-hidden">
                                     {/* Priority Indicator */}
                                     <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                                         ticket.priority === 'CRITICAL' ? 'bg-red-500' : 
                                         ticket.priority === 'HIGH' ? 'bg-orange-500' :
                                         ticket.priority === 'MEDIUM' ? 'bg-indigo-500' : 'bg-gray-300'
                                     }`} />

                                    <div className="flex flex-col md:flex-row md:items-center gap-8">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-[0.1em] border border-indigo-100">
                                                    {ticket.id}
                                                </span>
                                                <span className="flex items-center text-xs font-bold text-gray-400 gap-1.5 italic">
                                                    <Clock size={14} />
                                                    {new Date(ticket.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                                                {ticket.subject}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                    <div className="h-6 w-6 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <Building2 size={12} />
                                                    </div>
                                                    {ticket.tenant} ({ticket.tenantSlug})
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                    <div className="h-6 w-6 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <User size={12} />
                                                    </div>
                                                    {ticket.author}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-shrink-0 items-center justify-between md:flex-col md:items-end gap-4">
                                            <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${
                                                ticket.status === 'URGENT' ? 'bg-red-50 text-red-700 border-red-100' :
                                                ticket.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                                {ticket.status.replace(/_/g, ' ')}
                                            </span>
                                            <button className="p-3 bg-white border border-gray-100 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all duration-300 transform group-hover:scale-110">
                                                <MessageSquare size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-10 bg-gray-50 border-t border-gray-100 flex items-center justify-center">
                            <button className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-all group">
                                Browse Archived Tickets
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

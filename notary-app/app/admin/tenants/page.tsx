"use client";

import { 
    Search, 
    Filter, 
    Plus, 
    Building2, 
    MoreVertical, 
    CheckCircle2, 
    XCircle, 
    ExternalLink,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
    X,
    User,
    Lock,
    Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    subscriptionPlan: string;
    isActive: boolean;
    createdAt: string;
    _count: {
        users: number;
        documents: number;
    };
}

export default function TenantManagement() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        email: "",
        subscriptionPlan: "FREE",
        admin: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
        }
    });

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tenants?search=${search}&page=${page}`);
            const data = await res.json();
            setTenants(data.tenants);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch tenants", error);
            toast.error("Failed to load tenants");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, [page, search]);

    const handleProvision = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/tenants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Tenant provisioned successfully!");
                setIsModalOpen(false);
                fetchTenants();
                setFormData({
                    name: "",
                    slug: "",
                    email: "",
                    subscriptionPlan: "FREE",
                    admin: {
                        firstName: "",
                        lastName: "",
                        email: "",
                        password: "",
                    }
                });
            } else {
                toast.error(data.error || "Failed to provision tenant");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/tenants/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if (res.ok) {
                toast.success(`Tenant ${!currentStatus ? 'activated' : 'suspended'}`);
                fetchTenants();
            }
        } catch (error) {
            console.error("Failed to toggle status", error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tenant Management</h1>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed font-semibold max-w-xl">
                        Orchestrate your multi-tenant ecosystem. Provision new bureaus, monitor health metrics, and control infrastructure access.
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-[1.5rem] shadow-xl shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} className="mr-2" />
                    Provision New Tenant
                </button>
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by identity, endpoint, or email..."
                        className="w-full pl-14 pr-6 py-4.5 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="flex items-center justify-center px-8 py-4 bg-white border border-gray-100 text-gray-700 text-sm font-bold rounded-[1.5rem] hover:bg-gray-50 shadow-sm transition-all active:scale-95">
                    <Filter size={18} className="mr-2" />
                    Advanced Controls
                </button>
            </div>

            {/* Tenants Table */}
            <div className="bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 rounded-[2.5rem] overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-80 space-y-4">
                        <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={3} />
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Compiling registry...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Tenant Identity</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Plan & Volume</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Health Status</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Onboarded</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Management</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {tenants.length > 0 ? tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-indigo-50/30 transition-all group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-14 w-14 flex-shrink-0 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                                                    {tenant.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{tenant.name}</div>
                                                    <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                        {tenant.slug}.notary.ai
                                                        <ExternalLink size={10} className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col gap-2">
                                                <span className={`inline-flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-black border-2 ${
                                                    tenant.subscriptionPlan === 'ENTERPRISE' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                    tenant.subscriptionPlan === 'PROFESSIONAL' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    'bg-gray-50 text-gray-700 border-gray-100'
                                                } uppercase tracking-tight`}>
                                                    {tenant.subscriptionPlan}
                                                </span>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <span className="flex items-center"><User size={10} className="mr-1" /> {tenant._count.users}</span>
                                                    <span className="h-1 w-1 bg-gray-300 rounded-full" />
                                                    <span className="flex items-center"><Plus size={10} className="mr-1" /> {tenant._count.documents} Docs</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            {tenant.isActive ? (
                                                <div className="flex items-center text-green-600 text-[10px] font-black uppercase tracking-widest">
                                                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                                                    Active Burearu
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-red-500 text-[10px] font-black uppercase tracking-widest">
                                                    <div className="h-2 w-2 bg-red-500 rounded-full mr-2" />
                                                    Traffic Locked
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center text-xs text-gray-500 font-bold gap-2">
                                                <Calendar size={14} className="text-indigo-400" />
                                                {new Date(tenant.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => toggleStatus(tenant.id, tenant.isActive)}
                                                    className={`p-2.5 rounded-2xl transition-all shadow-sm ${
                                                        tenant.isActive 
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white shadow-red-100' 
                                                            : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white shadow-green-100'
                                                    }`}
                                                >
                                                    {tenant.isActive ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                                                </button>
                                                <button className="p-2.5 bg-gray-50 text-gray-600 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm shadow-gray-100">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <Building2 size={64} className="opacity-10" />
                                                <p className="text-xl font-black uppercase tracking-widest">Registry Empty</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination Component */}
            {!loading && tenants.length > 0 && (
                <div className="flex items-center justify-between px-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Node <span className="text-indigo-600">{page}</span> of <span className="text-indigo-600">{Math.ceil(total/20)}</span> • Total Registry: {total}
                    </p>
                    <div className="flex gap-3">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-90"
                        >
                            <ChevronLeft size={20} strokeWidth={3} />
                        </button>
                        <button 
                            disabled={page * 20 >= total}
                            onClick={() => setPage(p => p + 1)}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-90"
                        >
                            <ChevronRight size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            )}

            {/* Provision Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Provision Tenant</h2>
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Initialize New Notary Bureau</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all">
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleProvision} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Organization Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Building2 size={14} /> Organization Meta
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 ml-1">Bureau Name</label>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="Elite Notary Services"
                                                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold"
                                                value={formData.name}
                                                onChange={(e) => {
                                                    const name = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        name,
                                                        slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')
                                                    }));
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 ml-1">Traffic Endpoint (Slug)</label>
                                            <div className="relative">
                                                <input 
                                                    required
                                                    type="text" 
                                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold pr-20"
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400 lowercase italic">.notary.ai</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 ml-1">Service Tier</label>
                                            <select 
                                                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                                value={formData.subscriptionPlan}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subscriptionPlan: e.target.value }))}
                                            >
                                                <option value="FREE">Standard Bureau (FREE)</option>
                                                <option value="STARTER">Starter Bureau ($29)</option>
                                                <option value="PROFESSIONAL">Pro Bureau ($99)</option>
                                                <option value="ENTERPRISE">Enterprise Global ($299)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Lock size={14} /> Root Administrator
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 ml-1">First Name</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="Jane"
                                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold"
                                                    value={formData.admin.firstName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, admin: { ...prev.admin, firstName: e.target.value } }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 ml-1">Last Name</label>
                                                <input 
                                                    required
                                                    type="text" 
                                                    placeholder="Doe"
                                                    className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold"
                                                    value={formData.admin.lastName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, admin: { ...prev.admin, lastName: e.target.value } }))}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 ml-1">Admin Email</label>
                                            <input 
                                                required
                                                type="email" 
                                                placeholder="admin@bureau.com"
                                                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold"
                                                value={formData.admin.email}
                                                onChange={(e) => setFormData(prev => ({ ...prev, admin: { ...prev.admin, email: e.target.value } }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5 ml-1">Access Key (Password)</label>
                                            <input 
                                                required
                                                type="password" 
                                                placeholder="••••••••"
                                                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold"
                                                value={formData.admin.password}
                                                onChange={(e) => setFormData(prev => ({ ...prev, admin: { ...prev.admin, password: e.target.value } }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all"
                                >
                                    Abort
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-[2] px-8 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Authorize & Deploy"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

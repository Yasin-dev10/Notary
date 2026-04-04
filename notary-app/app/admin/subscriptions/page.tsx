"use client";

import { 
    CreditCard, 
    Search, 
    TrendingUp, 
    Users, 
    Zap, 
    Crown, 
    ShieldCheck, 
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle2,
    ArrowUpRight,
    DollarSign,
    MoreVertical
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    subscriptionPlan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
    isActive: boolean;
    _count: {
        users: number;
        documents: number;
    };
}

const PLAN_DATA = {
    FREE: { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', price: 0, features: 'Basic Features' },
    STARTER: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', price: 29, features: 'Up to 5 Users' },
    PROFESSIONAL: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', price: 99, features: 'Unlimited Users' },
    ENTERPRISE: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', price: 299, features: 'Custom White-labeling' }
};

export default function SubscriptionsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tenants?search=${search}&page=${page}`);
            const data = await res.json();
            setTenants(data.tenants);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch tenants", error);
            toast.error("Failed to load subscription data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, [page, search]);

    const updatePlan = async (id: string, newPlan: string) => {
        setIsUpdating(id);
        try {
            const res = await fetch(`/api/admin/tenants/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionPlan: newPlan }),
            });
            
            if (res.ok) {
                toast.success("Subscription plan updated successfully");
                fetchTenants();
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("Failed to update plan", error);
            toast.error("Failed to update subscription plan");
        } finally {
            setIsUpdating(null);
        }
    };

    const stats = [
        { name: 'Total Monthly MRR', value: `$${tenants.reduce((acc, t) => acc + PLAN_DATA[t.subscriptionPlan].price, 0).toLocaleString()}`, icon: DollarSign, trend: '+12.5%', color: 'text-green-600', bg: 'bg-green-50' },
        { name: 'Active Subscriptions', value: tenants.length.toString(), icon: Zap, trend: '+4.3%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { name: 'Professional Plan', value: tenants.filter(t => t.subscriptionPlan === 'PROFESSIONAL').length.toString(), icon: Crown, trend: '+8.1%', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { name: 'Enterprise Clients', value: tenants.filter(t => t.subscriptionPlan === 'ENTERPRISE').length.toString(), icon: ShieldCheck, trend: '+2.4%', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Subscription Plans</h1>
                    <p className="mt-2 text-base text-gray-500 font-medium max-w-2xl leading-relaxed">
                        Manage global platform revenue, modify tenant billing tiers, and monitor subscription health across your entire ecosystem.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center px-5 py-2.5 bg-white border border-gray-100 text-gray-700 text-sm font-bold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95">
                        <ArrowUpRight size={18} className="mr-2 text-indigo-500" />
                        Export Report
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon size={80} />
                        </div>
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-sm font-bold text-gray-500 mb-1">{stat.name}</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                            <span className="text-xs font-bold text-green-500 pb-1 flex items-center">
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pricing Tiers (Static Display) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(PLAN_DATA).map(([plan, data]) => (
                    <div key={plan} className={`p-5 rounded-3xl border-2 ${data.border} ${data.bg} relative overflow-hidden group`}>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${data.color} mb-2`}>{plan}</div>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-2xl font-black text-gray-900">${data.price}</span>
                            <span className="text-xs font-bold text-gray-500">/mo</span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-4">{data.features}</p>
                        <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                            <div className={`h-full ${data.color.replace('text', 'bg')} w-1/3`}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white shadow-xl shadow-gray-200/50 border border-gray-100 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find a tenant subscription..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-semibold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center px-6 py-3 bg-gray-50 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-100 transition-all">
                            <Filter size={18} className="mr-2" />
                            Active Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-80 space-y-4">
                            <Loader2 className="animate-spin text-indigo-600" size={48} strokeWidth={3} />
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Hydrating table...</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                                <tr className="bg-gray-50/30">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Tenant</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Current Tier</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Usage Stats</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Platform Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-wider">Modify Plan</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {tenants.length > 0 ? tenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-indigo-50/30 transition-all group">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform`}>
                                                    {tenant.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{tenant.name}</div>
                                                    <div className="text-xs text-gray-400 font-medium">{tenant.slug}.notary.ai</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border-2 ${PLAN_DATA[tenant.subscriptionPlan].bg} ${PLAN_DATA[tenant.subscriptionPlan].color} ${PLAN_DATA[tenant.subscriptionPlan].border} uppercase tracking-wider shadow-sm`}>
                                                <TrendingUp size={12} className="mr-2" />
                                                {tenant.subscriptionPlan}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={14} className="text-gray-400" />
                                                    {tenant._count.users}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <CreditCard size={14} className="text-gray-400" />
                                                    {tenant._count.documents}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            {tenant.isActive ? (
                                                <div className="flex items-center text-green-600 text-xs font-black uppercase tracking-wider">
                                                    <CheckCircle2 size={16} className="mr-1.5" />
                                                    Active
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-gray-400 text-xs font-black uppercase tracking-wider">
                                                    Suspended
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <select 
                                                    value={tenant.subscriptionPlan}
                                                    disabled={isUpdating === tenant.id}
                                                    onChange={(e) => updatePlan(tenant.id, e.target.value)}
                                                    className="text-xs font-bold bg-gray-50 border-none rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 text-gray-700 transition-all cursor-pointer hover:bg-white hover:shadow-sm disabled:opacity-50"
                                                >
                                                    <option value="FREE">FREE</option>
                                                    <option value="STARTER">STARTER</option>
                                                    <option value="PROFESSIONAL">PROFESSIONAL</option>
                                                    <option value="ENTERPRISE">ENTERPRISE</option>
                                                </select>
                                                {isUpdating === tenant.id && <Loader2 className="animate-spin text-indigo-600 ml-2" size={16} />}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-25">
                                                <CreditCard size={64} className="mb-4" />
                                                <p className="text-xl font-black uppercase tracking-widest">No Subscriptions Found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!loading && tenants.length > 0 && (
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-indigo-600">{tenants.length}</span> of <span className="text-indigo-600">{total}</span> Global Tenants
                        </p>
                        <div className="flex gap-3">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 hover:shadow-md disabled:opacity-40 disabled:hover:shadow-none transition-all active:scale-90"
                            >
                                <ChevronLeft size={20} strokeWidth={3} />
                            </button>
                            <button 
                                disabled={page * 20 >= total}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2.5 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 hover:shadow-md disabled:opacity-40 disabled:hover:shadow-none transition-all active:scale-90"
                            >
                                <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { 
    Settings, 
    Save, 
    Shield, 
    Globe, 
    Mail, 
    Phone, 
    Bell, 
    Database, 
    Cloud, 
    Layout, 
    Lock,
    RefreshCcw,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function GlobalSettings() {
    const [saving, setSaving] = useState(false);
    
    // Sample configuration categories
    const categories = [
        { name: "General Settings", icon: Settings, count: 4, active: true },
        { name: "Commission & Billing", icon: Globe, count: 2, active: false },
        { name: "Email & Notifications", icon: Mail, count: 6, active: false },
        { name: "Platform Appearance", icon: Layout, count: 3, active: false },
        { name: "Security & Auth", icon: Lock, count: 5, active: false },
        { name: "API & Webhooks", icon: Database, count: 4, active: false },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            setSaving(false);
            toast.success("Global settings updated successfully!");
        }, 1500);
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Configuration</h1>
                    <p className="mt-2 text-sm text-gray-500 font-medium leading-relaxed">
                        Control global platform parameters, system-wide behavior, and integration settings.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-50 shadow-sm transition-all">
                        <RefreshCcw size={18} className="mr-2" />
                        Reset Defaults
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                        {saving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                        Save Changes
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Categories */}
                <aside className="lg:w-72 flex flex-col gap-4">
                    {categories.map((category) => (
                        <button
                            key={category.name}
                            className={`flex items-center justify-between px-6 py-4 rounded-3xl transition-all duration-300 ${
                                category.active 
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50" 
                                    : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <category.icon size={20} className={category.active ? "text-indigo-200" : "text-gray-400"} />
                                <span className="text-sm font-bold">{category.name}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                category.active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                            }`}>
                                {category.count}
                            </span>
                        </button>
                    ))}
                </aside>

                {/* Main Settings Form */}
                <div className="flex-1 space-y-8">
                    {/* General Settings Card */}
                    <div className="bg-white px-8 py-10 shadow-sm border border-gray-100 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                            <Shield size={180} />
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Globe size={20} />
                            </span>
                            Platform Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Platform Name</label>
                                <input 
                                    type="text" 
                                    defaultValue="NotaryPro Platform"
                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Primary Support Email</label>
                                <input 
                                    type="email" 
                                    defaultValue="support@notarypro.so"
                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Verification Domain</label>
                                <div className="flex items-center gap-3">
                                    <span className="px-5 py-)4 bg-gray-100 border border-gray-200 rounded-2xl text-sm font-bold text-gray-500">https://</span>
                                    <input 
                                        type="text" 
                                        defaultValue="verify.notarypro.so"
                                        className="flex-1 px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium pl-1 italic">Used for global QR code verification redirects.</p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Maintenance Mode</label>
                                <div className="flex items-center justify-between px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                                    <span className="text-sm font-bold text-gray-600">Offline status</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Settings Card */}
                    <div className="bg-white px-8 py-10 shadow-sm border border-gray-100 rounded-[2.5rem] relative overflow-hidden group">
                        <h3 className="text-xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                            <span className="p-2 bg-green-50 text-green-600 rounded-xl">
                                <Cloud size={20} />
                            </span>
                            SaaS Economics & Billing
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Global Default Commission (%)</label>
                                <input 
                                    type="number" 
                                    defaultValue="15"
                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                                />
                                <p className="text-[10px] text-gray-400 font-medium pl-1 italic">Applied to all document notarization fees by default.</p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Currency Code</label>
                                <select className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none">
                                    <option>USD - United States Dollar</option>
                                    <option>SOS - Somali Shilling</option>
                                    <option>EUR - Euro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure Card */}
                    <div className="bg-indigo-900 text-white px-8 py-10 shadow-2xl shadow-indigo-100 rounded-[2.5rem] relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity text-indigo-100">
                            <Database size={150} />
                        </div>
                        
                        <h3 className="text-xl font-extrabold mb-8 flex items-center gap-3">
                            <span className="p-2 bg-white/10 text-indigo-300 rounded-xl">
                                <Cloud size={20} />
                            </span>
                            Global Infrastructure
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl">
                                        <RefreshCcw size={20} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Auto-Deployment Updates</p>
                                        <p className="text-xs text-indigo-300 font-medium italic">Push changes to all tenants instantly</p>
                                    </div>
                                </div>
                                <button className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-900">
                                    Trigger Global Sync
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl">
                                        <Database size={20} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Database Cleanup Service</p>
                                        <p className="text-xs text-indigo-300 font-medium italic">Weekly purge of deleted records</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 text-xs font-bold rounded-xl border border-green-500/30">
                                    <CheckCircle2 size={12} className="mr-2" />
                                    Active (Next run in 2d)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

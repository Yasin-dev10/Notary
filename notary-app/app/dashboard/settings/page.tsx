"use client";

import { useSession } from "next-auth/react";
import { Topbar } from "@/components/layout/Topbar";
import {
    Building2,
    User,
    Shield,
    Bell,
    Palette,
    Save,
    CheckCircle,
    Loader2,
    Globe,
    ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const plans = [
    { id: "FREE", label: "Free", price: "$0", features: ["5 clients", "10 appointments/mo", "Basic reports"] },
    { id: "STARTER", label: "Starter", price: "$80", features: ["100 clients", "Unlimited appointments", "Email notifications"] },
    { id: "PROFESSIONAL", label: "Professional", price: "$150", features: ["Unlimited clients", "Priority support", "Advanced analytics", "Custom branding"] },
    { id: "ENTERPRISE", label: "Enterprise", price: "$250", features: ["White-label", "SLA", "Dedicated support", "API access"] },
];

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const [activeTab, setActiveTab] = useState("organization");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [orgData, setOrgData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        logoUrl: "",
        themeColor: "#6366f1",
        customDomain: "",
        slug: "",
        subscriptionPlan: "FREE",
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    setOrgData({
                        name: data.name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        logoUrl: data.logoUrl || "",
                        themeColor: data.themeColor || "#6366f1",
                        customDomain: data.customDomain || "",
                        slug: data.slug || "",
                        subscriptionPlan: data.subscriptionPlan || "FREE",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchSettings();
        }
    }, [session]);

    const tabs = [
        { id: "organization", label: "Organization", icon: Building2 },
        { id: "profile", label: "Your Profile", icon: User },
        { id: "security", label: "Security", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "billing", label: "Billing & Plan", icon: Palette },
    ];

    const handleSaveOrg = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orgData),
            });

            if (res.ok) {
                toast.success("Settings updated successfully");
                // Update session to reflect brand changes immediately
                await updateSession({
                    ...session,
                    user: {
                        ...session?.user,
                        tenantName: orgData.name,
                        tenantLogoUrl: orgData.logoUrl,
                    }
                });
            } else {
                toast.error("Failed to update settings");
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpgrade = async (planId: string) => {
        if (orgData.subscriptionPlan === planId) return;

        setIsSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...orgData, subscriptionPlan: planId }),
            });

            if (res.ok) {
                toast.success(`Plan updated to ${planId}`);
                setOrgData({ ...orgData, subscriptionPlan: planId });
                // Update session
                await updateSession({
                    ...session,
                    user: {
                        ...session?.user,
                        subscriptionPlan: planId,
                    }
                });
            } else {
                toast.error("Failed to update plan");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <Topbar title="Settings" subtitle="Manage your organization and account" />
            <div className="p-6">
                <div className="flex gap-6">
                    {/* Sidebar tabs */}
                    <div className="w-52 flex-shrink-0 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    id={`settings-tab-${tab.id}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/8"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="glass-card p-12 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                                <p className="text-slate-400">Loading your settings...</p>
                            </div>
                        ) : (
                            <>
                                {/* Organization */}
                                {activeTab === "organization" && (
                                    <div className="glass-card p-6 space-y-6">
                                        <div>
                                            <h3 className="section-title mb-4 flex items-center gap-2">
                                                <Building2 className="w-4 h-4" /> Organization Settings
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="label">Organization Name</label>
                                                        <input
                                                            value={orgData.name}
                                                            onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                                                            className="input-field"
                                                            placeholder="Company Name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="label">Workspace Slug</label>
                                                        <input value={orgData.slug} className="input-field opacity-60 cursor-not-allowed" readOnly />
                                                        <p className="text-[10px] text-slate-500 mt-1">Slug is used for your internal workspace URL and cannot be changed.</p>
                                                    </div>
                                                    <div>
                                                        <label className="label">Contact Email</label>
                                                        <input
                                                            type="email"
                                                            value={orgData.email}
                                                            onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                                                            placeholder="contact@company.com"
                                                            className="input-field"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="label">Phone Number</label>
                                                        <input
                                                            type="tel"
                                                            value={orgData.phone}
                                                            onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                                                            placeholder="+1 (555) 000-0000"
                                                            className="input-field"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="label">Address</label>
                                                        <textarea
                                                            rows={3}
                                                            value={orgData.address}
                                                            onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                                                            placeholder="123 Main St, City, State 12345"
                                                            className="input-field resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-white/5 pt-6">
                                            <h3 className="section-title mb-4 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-indigo-400" /> White-labeling & Domains
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="label">Custom Domain</label>
                                                        <div className="relative">
                                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                            <input
                                                                value={orgData.customDomain}
                                                                onChange={(e) => setOrgData({ ...orgData, customDomain: e.target.value })}
                                                                className="input-field pl-10"
                                                                placeholder="notary.yourdomain.com"
                                                            />
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 mt-1">
                                                            Point your CNAME record to <code className="text-indigo-400">app.notary-system.com</code>
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="label flex items-center justify-between">
                                                            Booking Portal URL
                                                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">Public</span>
                                                        </label>
                                                        <div className="relative group">
                                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                            <input
                                                                 readOnly
                                                                 value={`${typeof window !== 'undefined' ? window.location.origin : ''}/book/${orgData.slug}`}
                                                                 className="input-field pl-10 pr-20 bg-indigo-500/5 border-indigo-500/20 text-indigo-300 font-mono text-xs cursor-default"
                                                            />
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    navigator.clipboard.writeText(`${window.location.origin}/book/${orgData.slug}`);
                                                                    toast.success("Link copied to clipboard");
                                                                }}
                                                                className="absolute right-2 top-1.5 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white rounded-lg transition-all"
                                                            >
                                                                Copy Link
                                                            </button>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 mt-1">Share this link with your clients to allow online bookings.</p>
                                                    </div>
                                                    <div>
                                                        <label className="label">Primary Theme Color</label>
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="color"
                                                                value={orgData.themeColor}
                                                                onChange={(e) => setOrgData({ ...orgData, themeColor: e.target.value })}
                                                                className="w-12 h-10 rounded-xl border border-white/10 bg-transparent cursor-pointer"
                                                            />
                                                            <input
                                                                value={orgData.themeColor}
                                                                onChange={(e) => setOrgData({ ...orgData, themeColor: e.target.value })}
                                                                className="input-field max-w-[120px] font-mono text-center"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="label">Company Logo (URL)</label>
                                                        <div className="flex items-start gap-4">
                                                            <div className="flex-1">
                                                                <div className="relative">
                                                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                                    <input
                                                                        value={orgData.logoUrl}
                                                                        onChange={(e) => setOrgData({ ...orgData, logoUrl: e.target.value })}
                                                                        placeholder="https://..."
                                                                        className="input-field pl-10"
                                                                    />
                                                                </div>
                                                                <p className="text-[10px] text-slate-500 mt-1">Recommended: PNG or SVG with transparent background.</p>
                                                            </div>
                                                            <div className="w-20 h-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {orgData.logoUrl ? (
                                                                    <img src={orgData.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain p-2" />
                                                                ) : (
                                                                    <div className="text-slate-600 flex flex-col items-center">
                                                                        <ImageIcon className="w-6 h-6 mb-1" />
                                                                        <span className="text-[8px] font-medium">PREVIEW</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                id="save-org-btn"
                                                onClick={handleSaveOrg}
                                                disabled={isSaving}
                                                className={`btn-primary ${isSaving ? "opacity-70 cursor-not-allowed" : ""}`}
                                            >
                                                {isSaving ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                                ) : (
                                                    <><Save className="w-4 h-4" /> Save Organization Settings</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Profile */}
                                {activeTab === "profile" && (
                                    <div className="glass-card p-6 space-y-6">
                                        <h3 className="section-title mb-4">Your Profile</h3>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold border border-white/10">
                                                {session?.user?.firstName?.[0]}{session?.user?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{session?.user?.firstName} {session?.user?.lastName}</p>
                                                <p className="text-sm text-slate-400">{session?.user?.email}</p>
                                                <span className="badge-blue mt-1 inline-flex">{session?.user?.role?.replace("_", " ")}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 max-w-md">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label">First Name</label>
                                                    <input defaultValue={session?.user?.firstName} className="input-field" />
                                                </div>
                                                <div>
                                                    <label className="label">Last Name</label>
                                                    <input defaultValue={session?.user?.lastName} className="input-field" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="label">Email</label>
                                                <input type="email" defaultValue={session?.user?.email} className="input-field" readOnly />
                                            </div>
                                        </div>

                                        <button id="save-profile-btn" className="btn-primary">
                                            <Save className="w-4 h-4" /> Save Changes
                                        </button>
                                    </div>
                                )}

                                {/* Security */}
                                {activeTab === "security" && (
                                    <div className="glass-card p-6 space-y-6 max-w-md">
                                        <h3 className="section-title mb-4">Change Password</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="label">Current Password</label>
                                                <input type="password" placeholder="••••••••" className="input-field" />
                                            </div>
                                            <div>
                                                <label className="label">New Password</label>
                                                <input type="password" placeholder="At least 8 characters" className="input-field" />
                                            </div>
                                            <div>
                                                <label className="label">Confirm New Password</label>
                                                <input type="password" placeholder="Repeat new password" className="input-field" />
                                            </div>
                                        </div>
                                        <button id="change-password-btn" className="btn-primary">
                                            <Shield className="w-4 h-4" />
                                            Update Password
                                        </button>
                                    </div>
                                )}

                                {/* Billing */}
                                {activeTab === "billing" && (
                                    <div className="space-y-5">
                                        <h3 className="section-title">Subscription Plans</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {plans.map((plan) => (
                                                <div
                                                    key={plan.id}
                                                    id={`plan-${plan.id.toLowerCase()}`}
                                                    className={`glass-card p-5 cursor-pointer transition-all hover:border-indigo-500/30 ${plan.id === "PROFESSIONAL" ? "border-indigo-500/40 bg-indigo-600/5" : ""
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="font-semibold text-white">{plan.label}</p>
                                                            <p className="text-2xl font-bold text-indigo-400 mt-1">
                                                                {plan.price}
                                                                {plan.price !== "Custom" && <span className="text-sm text-slate-500 font-normal">/mo</span>}
                                                            </p>
                                                        </div>
                                                        {plan.id === "PROFESSIONAL" && (
                                                            <span className="badge-purple">Popular</span>
                                                        )}
                                                    </div>
                                                    <ul className="space-y-1.5">
                                                        {plan.features.map((f) => (
                                                            <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                                                                <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <button 
                                                        id={`select-plan-${plan.id.toLowerCase()}-btn`} 
                                                        onClick={() => handleUpgrade(plan.id)}
                                                        disabled={isSaving || orgData.subscriptionPlan === plan.id}
                                                        className={`w-full justify-center mt-4 text-xs ${
                                                            orgData.subscriptionPlan === plan.id 
                                                            ? "btn-primary !bg-emerald-600/20 !text-emerald-400 !border-emerald-500/30 cursor-default" 
                                                            : "btn-secondary"
                                                        }`}
                                                    >
                                                        {orgData.subscriptionPlan === plan.id ? (
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> Current Plan
                                                            </span>
                                                        ) : (
                                                            <span>{plan.id === "FREE" ? "Downgrade" : "Upgrade"}</span>
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notifications */}
                                {activeTab === "notifications" && (
                                    <div className="glass-card p-6 space-y-4 max-w-lg">
                                        <h3 className="section-title mb-4">Notification Preferences</h3>
                                        {[
                                            { id: "notif-new-appointment", label: "New appointment scheduled", description: "Get notified when a new appointment is booked" },
                                            { id: "notif-appointment-reminder", label: "Appointment reminders", description: "24 hours before each appointment" },
                                            { id: "notif-new-client", label: "New client added", description: "When a new client is created in your organization" },
                                            { id: "notif-payment", label: "Payment received", description: "When a transaction is marked as paid" },
                                            { id: "notif-doc-upload", label: "Document uploaded", description: "When a new document is uploaded" },
                                        ].map((n) => (
                                            <div key={n.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200">{n.label}</p>
                                                    <p className="text-xs text-slate-500">{n.description}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input id={n.id} type="checkbox" defaultChecked className="sr-only peer" />
                                                    <div className="w-10 h-5 bg-slate-700 peer-checked:bg-indigo-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                                                </label>
                                            </div>
                                        ))}
                                        <button id="save-notifications-btn" className="btn-primary">
                                            <Save className="w-4 h-4" /> Save Preferences
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Topbar } from "@/components/layout/Topbar";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    FileText,
    ChevronLeft,
    Hash
} from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
    PENDING: "badge-yellow",
    CONFIRMED: "badge-blue",
    COMPLETED: "badge-green",
    CANCELLED: "badge-red",
};

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const { id } = await params;

    const client: any = await prisma.client.findFirst({
        where: {
            id,
            tenantId: session.user.tenantId,
            deletedAt: null,
        },
        include: {
            appointments: {
                orderBy: { startTime: "desc" },
                take: 5,
            },
            documents: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
            transactions: {
                orderBy: { createdAt: "desc" },
                take: 5,
            }
        },
    });

    if (!client) return notFound();

    return (
        <div>
            <Topbar
                title={`${client.firstName} ${client.lastName}`}
                subtitle="Client Profile"
            />
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Back button */}
                <Link
                    href="/dashboard/clients"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Clients
                </Link>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column: Client Info */}
                    <div className="space-y-6 xl:col-span-1">
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold tracking-tight shadow-lg shadow-indigo-500/20 flex-shrink-0">
                                    {client.firstName[0]}{client.lastName[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        {client.firstName} {client.lastName}
                                    </h2>
                                    <p className="text-sm text-slate-400">
                                        Client since {format(new Date(client.createdAt), "MMM yyyy")}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Email</p>
                                        <p className="text-sm text-slate-200 break-all">
                                            {client.email || "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                                        <p className="text-sm text-slate-200">
                                            {client.phone || "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Address</p>
                                        <p className="text-sm text-slate-200">
                                            {[client.address, client.city, client.state, client.zipCode].filter(Boolean).join(", ") || "—"}
                                        </p>
                                    </div>
                                </div>
                                {client.dateOfBirth && (
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-400 mb-0.5">Date of Birth</p>
                                            <p className="text-sm text-slate-200">
                                                {format(new Date(client.dateOfBirth), "MMMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {(client.idType || client.idNumber) && (
                                    <div className="flex items-start gap-3">
                                        <Hash className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-400 mb-0.5">ID Info</p>
                                            <p className="text-sm text-slate-200">
                                                {client.idType || "ID"}: {client.idNumber || "—"}
                                            </p>
                                            {client.idExpiryDate && (
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Expires: {format(new Date(client.idExpiryDate), "MMM d, yyyy")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {client.notes && (
                                <div className="mt-6 pt-6 border-t border-white/8">
                                    <p className="text-xs text-slate-400 mb-2">Notes</p>
                                    <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-lg leading-relaxed">
                                        {client.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Activity Tabs / Lists */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Appointments */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-400" />
                                    <h3 className="text-sm font-semibold text-white">Recent Appointments</h3>
                                </div>
                                <Link
                                    href="/dashboard/appointments"
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                                >
                                    View all →
                                </Link>
                            </div>

                            {client.appointments.length === 0 ? (
                                <div className="text-center py-8 bg-white/3 rounded-xl">
                                    <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 text-sm">No appointments found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {client.appointments?.map((apt: any) => (
                                        <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 rounded-xl bg-white/3 hover:bg-white/6 transition-colors">
                                            <div className="hidden sm:block flex-shrink-0 w-12 text-center">
                                                <p className="text-xs text-slate-500 font-medium uppercase">
                                                    {format(new Date(apt.startTime), "MMM")}
                                                </p>
                                                <p className="text-xl font-bold text-white leading-none">
                                                    {format(new Date(apt.startTime), "d")}
                                                </p>
                                            </div>
                                            <div className="hidden sm:block w-px h-10 bg-white/10 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-200 truncate">
                                                    {apt.title}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {format(new Date(apt.startTime), "h:mm a")}
                                                </p>
                                            </div>
                                            <span className={`self-start sm:self-auto ${statusColors[apt.status] || "badge-blue"}`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Documents */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-400" />
                                    <h3 className="text-sm font-semibold text-white">Recent Documents</h3>
                                </div>
                                <Link
                                    href="/dashboard/documents"
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                                >
                                    View all →
                                </Link>
                            </div>

                            {client.documents.length === 0 ? (
                                <div className="text-center py-8 bg-white/3 rounded-xl">
                                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-400 text-sm">No documents found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {client.documents?.map((doc: any) => (
                                        <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-white/3 hover:bg-white/6 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex flex-shrink-0 items-center justify-center">
                                                    <FileText className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200 truncate">
                                                        {doc.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {format(new Date(doc.createdAt), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="badge-purple self-start sm:self-auto">
                                                {doc.status.replace("_", " ")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

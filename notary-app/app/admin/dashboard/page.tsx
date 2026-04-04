"use client";

import { 
    Users, 
    Building2, 
    FileText, 
    TrendingUp, 
    Clock, 
    CheckCircle2, 
    AlertTriangle, 
    Server,
    Globe,
    Shield,
    Activity
} from "lucide-react";
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";

// Mock data for the dashboard
const stats = [
    { name: 'Total Tenants', value: '42', icon: Building2, change: '+12%', changeType: 'increase', color: 'bg-blue-100 text-blue-600' },
    { name: 'Active Users', value: '2,401', icon: Users, change: '+18.1%', changeType: 'increase', color: 'bg-green-100 text-green-600' },
    { name: 'Total Documents', value: '12,543', icon: FileText, change: '+24.5%', changeType: 'increase', color: 'bg-indigo-100 text-indigo-600' },
    { name: 'System Revenue', value: '$45,210', icon: TrendingUp, change: '+10.2%', changeType: 'increase', color: 'bg-purple-100 text-purple-600' },
];

const revenueData = [
    { month: 'Oct', revenue: 4000, tenants: 24 },
    { month: 'Nov', revenue: 3000, tenants: 28 },
    { month: 'Dec', revenue: 5000, tenants: 32 },
    { month: 'Jan', revenue: 4500, tenants: 35 },
    { month: 'Feb', revenue: 6000, tenants: 38 },
    { month: 'Mar', revenue: 8500, tenants: 42 },
];

const systemHealth = [
    { name: 'API Services', status: 'Operational', latency: '45ms', icon: Globe, color: 'text-green-500' },
    { name: 'Database', status: 'Operational', latency: '12ms', icon: Server, color: 'text-green-500' },
    { name: 'File Storage (S3)', status: 'Operational', latency: '120ms', icon: FileText, color: 'text-green-500' },
    { name: 'Auth System', status: 'Operational', latency: '22ms', icon: Shield, color: 'text-green-500' },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Platform Overview</h1>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed max-w-2xl">
                        Monitor global platform performance, tenant health, and system-wide metrics across all notary offices.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center px-4 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-100 shadow-sm animate-pulse">
                        <CheckCircle2 size={16} className="mr-2" />
                        All Systems Operational
                    </span>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div 
                        key={item.name} 
                        className="relative overflow-hidden bg-white/70 backdrop-blur-sm px-6 pt-6 pb-6 shadow-sm border border-gray-100 rounded-3xl transition-all duration-300 hover:shadow-lg hover:border-indigo-200"
                    >
                        <dt>
                            <div className={`absolute rounded-2xl p-3 ${item.color}`}>
                                <item.icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <p className="ml-16 text-sm font-semibold text-gray-500 uppercase tracking-wider">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex flex-col">
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
                            <p className={`mt-1 flex items-center text-sm font-medium ${
                                item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {item.changeType === 'increase' ? (
                                    <TrendingUp className="mr-1 h-4 w-4" />
                                ) : (
                                    <AlertTriangle className="mr-1 h-4 w-4" />
                                )}
                                {item.change}
                                <span className="ml-2 text-gray-400 font-normal italic">vs last month</span>
                            </p>
                        </dd>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Revenue Growth Chart */}
                <div className="lg:col-span-2 bg-white px-8 py-8 shadow-sm border border-gray-100 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Platform Revenue Growth</h3>
                            <p className="text-sm text-gray-500">Monthly subscription income across all tenants</p>
                        </div>
                        <select className="text-sm bg-gray-50 border-gray-200 rounded-xl px-4 py-2 font-medium focus:ring-indigo-500">
                            <option>Last 6 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="month" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fill: '#9ca3af'}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fill: '#9ca3af'}}
                                    dx={-10}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                        padding: '12px'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#6366f1" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white px-8 py-8 shadow-sm border border-gray-100 rounded-3xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Global System Health</h3>
                    <div className="space-y-6">
                        {systemHealth.map((service) => (
                            <div key={service.name} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors duration-200">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                                        <service.icon className={`h-6 w-6 ${service.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{service.name}</p>
                                        <p className="text-xs text-gray-500 font-medium">Latency: {service.latency}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${service.color}`}>{service.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <button className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all duration-300 flex items-center justify-center gap-2">
                            <Activity size={18} />
                            View Full System Logs
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Global Activity */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Recent Global Activity</h3>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tenant</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                                T{i}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">City Notary Office {i}</div>
                                                <div className="text-xs text-gray-500">city-notary-{i}.notarypro.so</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                                        Subscription Upgraded to Premium
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                        {i * 10} minutes ago
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                                            Success
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

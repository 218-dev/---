
import React from 'react';
import { Contract, ContractStatus, ContractTypeDefinition } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ReportsPageProps {
    contracts: Contract[];
    contractTypes: ContractTypeDefinition[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between hover:shadow-md transition-all">
        <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">{title}</p>
            <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace('800', '100').replace('600', '100')} ${color}`}>
            <i className={`bi ${icon} text-xl`}></i>
        </div>
    </div>
);

const ReportsPage: React.FC<ReportsPageProps> = ({ contracts, contractTypes }) => {
    const contractsByType = contractTypes.map(typeDef => ({
        name: typeDef.name,
        count: contracts.filter(c => c.type === typeDef.name).length,
    })).sort((a, b) => b.count - a.count); // Sort by count

    const contractsByStatus = Object.values(ContractStatus).map(status => ({
        name: status,
        count: contracts.filter(c => c.status === status).length,
    }));

    const totalValue = contracts.reduce((sum, c) => sum + c.value, 0);
    
    const COLORS = ['#0f172a', '#d97706', '#475569', '#b45309', '#94a3b8', '#f59e0b'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-800">التقارير والتحليلات</h1>
                    <p className="text-slate-500 text-sm mt-1">بيانات تفصيلية عن أداء المكتب وحركة العقود</p>
                 </div>
                 <button className="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-50 transition-all shadow-sm text-sm flex items-center gap-2" onClick={() => window.print()}>
                    <i className="bi bi-printer"></i> طباعة التقرير
                 </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="إجمالي عدد العقود" 
                    value={contracts.length} 
                    icon="bi-files" 
                    color="text-slate-800" 
                />
                <StatCard 
                    title="القيمة المالية الإجمالية" 
                    value={`${totalValue.toLocaleString()} د.ل`} 
                    icon="bi-cash-coin" 
                    color="text-emerald-600" 
                />
                 <StatCard 
                    title="متوسط قيمة العقد" 
                    value={`${(totalValue / (contracts.length || 1)).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} د.ل`} 
                    icon="bi-calculator" 
                    color="text-amber-600" 
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <i className="bi bi-pie-chart-fill text-amber-600"></i>
                        توزيع العقود حسب الحالة
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={contractsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {contractsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', fontFamily: 'Tajawal', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Types Chart */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <i className="bi bi-bar-chart-fill text-slate-600"></i>
                        أكثر أنواع العقود استخداماً
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contractsByType.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#475569'}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', fontFamily: 'Tajawal' }} />
                                <Bar dataKey="count" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">تفاصيل حسب النوع</h2>
                    </div>
                    <table className="w-full text-sm text-right text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-bold">نوع العقد</th>
                                <th className="px-6 py-3 font-bold">العدد</th>
                                <th className="px-6 py-3 font-bold">النسبة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {contractsByType.map(item => (
                                <tr key={item.name} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-bold text-slate-800">{item.name}</td>
                                    <td className="px-6 py-3">{item.count}</td>
                                    <td className="px-6 py-3">
                                        {contracts.length > 0 
                                            ? Math.round((item.count / contracts.length) * 100) + '%' 
                                            : '0%'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">تفاصيل حسب الحالة</h2>
                    </div>
                     <table className="w-full text-sm text-right text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-bold">الحالة</th>
                                <th className="px-6 py-3 font-bold">العدد</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {contractsByStatus.map(item => (
                                <tr key={item.name} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-800">
                                        <span className={`inline-block w-2 h-2 rounded-full ml-2 ${
                                            item.name === ContractStatus.Final ? 'bg-emerald-500' :
                                            item.name === ContractStatus.Draft ? 'bg-amber-500' :
                                            item.name === ContractStatus.Expired ? 'bg-rose-500' : 'bg-slate-400'
                                        }`}></span>
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-3 font-mono font-bold">{item.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;

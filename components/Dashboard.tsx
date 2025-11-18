
import React from 'react';
import { Contract, ContractStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DashboardProps {
  contracts: Contract[];
}

const StatCard: React.FC<{ icon: string; title: string; value: string | number; colorClass?: string; bgClass?: string }> = ({ 
    icon, title, value, colorClass = 'text-slate-700', bgClass = 'bg-slate-100' 
}) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
        <div>
            <p className="text-slate-500 text-sm font-bold mb-1">{title}</p>
            <h3 className={`text-3xl font-bold ${colorClass}`}>{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${bgClass} ${colorClass}`}>
            <i className={`bi ${icon} text-2xl`}></i>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ contracts }) => {
  const totalContracts = contracts.length;
  const contractsThisMonth = contracts.filter(c => {
    const creationDate = new Date(c.creationDate);
    const now = new Date();
    return creationDate.getMonth() === now.getMonth() && creationDate.getFullYear() === now.getFullYear();
  }).length;

  const expiringSoon = contracts.filter(c => {
    if (!c.endDate || c.status !== ContractStatus.Final) return false;
    const endDate = new Date(c.endDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return endDate > now && endDate <= thirtyDaysFromNow;
  }).length;
  
  const typeCount: Record<string, number> = {};
  contracts.forEach(c => {
      typeCount[c.type] = (typeCount[c.type] || 0) + 1;
  });

  const contractsByType = Object.keys(typeCount).map(type => ({
      name: type,
      value: typeCount[type],
  }));

  // Slate & Gold Palette for Chart
  const COLORS = ['#0f172a', '#334155', '#d97706', '#b45309', '#64748b', '#94a3b8'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">لوحة التحكم</h1>
            <p className="text-slate-500 mt-1">نظرة عامة على أداء المكتب والعقود</p>
        </div>
        <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm text-slate-600 font-bold flex items-center gap-2">
            <i className="bi bi-calendar3"></i>
            {new Date().toLocaleDateString('ar-LY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            icon="bi-files" 
            title="إجمالي العقود" 
            value={totalContracts} 
            colorClass="text-slate-800"
            bgClass="bg-slate-100"
        />
        <StatCard 
            icon="bi-calendar-check" 
            title="عقود هذا الشهر" 
            value={contractsThisMonth} 
            colorClass="text-amber-600"
            bgClass="bg-amber-50"
        />
        <StatCard 
            icon="bi-exclamation-diamond" 
            title="على وشك الانتهاء" 
            value={expiringSoon} 
            colorClass="text-rose-600" 
            bgClass="bg-rose-50"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <i className="bi bi-pie-chart-fill text-slate-400"></i>
                    توزيع العقود حسب النوع
                </h2>
            </div>
            <div className="p-6 flex-1 min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={contractsByType}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            fill="#8884d8"
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                        >
                            {contractsByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} stroke="#fff" />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{
                                borderRadius: '8px', 
                                border: '1px solid #e2e8f0', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontFamily: 'Tajawal'
                            }} 
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Recent Contracts */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <i className="bi bi-clock-history text-slate-400"></i>
                    آخر الإضافات
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[320px]">
                {contracts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-slate-400">
                        <i className="bi bi-inbox text-4xl mb-2 opacity-50"></i>
                        <p>لا توجد بيانات</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {contracts.slice(0, 6).map(c => (
                            <li key={c.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-700 transition-colors">
                                        <i className="bi bi-file-earmark-text text-lg"></i>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 truncate max-w-[140px]">{c.title}</p>
                                        <p className="text-xs text-slate-500">{c.creationDate}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 bg-slate-800 text-white rounded-md shadow-sm">{c.type}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="p-4 border-t border-slate-100 text-center">
                <button className="text-sm text-amber-600 font-bold hover:text-amber-700 hover:underline">عرض كل العقود</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

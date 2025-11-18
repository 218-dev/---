import React from 'react';
import { Contract } from '../types';

interface ContractDetailsModalProps {
  contract: Contract;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number | string[]; icon?: string; isTag?: boolean }> = ({ label, value, icon, isTag }) => (
    <div className="group">
        <dt className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            {icon && <i className={`bi ${icon} text-slate-400 group-hover:text-amber-600 transition-colors`}></i>}
            {label}
        </dt>
        <dd className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/50 min-h-[40px] flex items-center">
            {isTag && Array.isArray(value) ? (
                <div className="flex flex-wrap gap-1">
                 {value.map(v => <span key={v} className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] font-medium">{v}</span>)}
                </div>
            ) : (
                <span className="truncate w-full block" title={String(value)}>{value || '-'}</span>
            )}
        </dd>
    </div>
);

const SectionHeader: React.FC<{ title: string; icon: string; colorClass: string; bgClass: string }> = ({ title, icon, colorClass, bgClass }) => (
    <h3 className={`flex items-center gap-2 text-lg font-bold ${colorClass} pb-3 border-b border-slate-100 mb-5`}>
        <span className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center shadow-sm`}>
            <i className={`bi ${icon}`}></i>
        </span>
        {title}
    </h3>
);

const PartyCard: React.FC<{ title: string; party: Contract['party1']; color: 'emerald' | 'amber' }> = ({ title, party, color }) => {
    const theme = color === 'emerald' 
        ? { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-800', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' }
        : { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800', iconBg: 'bg-amber-100', iconText: 'text-amber-600' };

    return (
        <div className={`${theme.bg} p-5 rounded-xl border ${theme.border} shadow-sm h-full`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${theme.iconBg} ${theme.iconText} flex items-center justify-center shadow-sm`}>
                    <i className="bi bi-person-vcard-fill text-xl"></i>
                </div>
                <div>
                    <h4 className={`font-bold ${theme.text} text-base`}>{title}</h4>
                    <span className="text-xs font-bold opacity-75">{party.type}</span>
                </div>
            </div>
            <div className="space-y-3">
                <div className="bg-white/60 p-3 rounded-lg border border-white/50">
                    <p className="text-xs font-bold text-slate-500 mb-0.5">الاسم الكامل</p>
                    <p className="text-sm font-bold text-slate-900">{party.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                     <div className="bg-white/60 p-3 rounded-lg border border-white/50">
                        <p className="text-xs font-bold text-slate-500 mb-0.5">نوع الهوية</p>
                        <p className="text-sm font-bold text-slate-900">{party.idType}</p>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg border border-white/50">
                        <p className="text-xs font-bold text-slate-500 mb-0.5">رقم الهوية</p>
                        <p className="text-sm font-bold text-slate-900 font-mono">{party.idNumber}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({ contract, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 flex justify-center items-start sm:items-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                <i className="bi bi-file-text-fill text-2xl"></i>
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800">تفاصيل العقد</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-500">رقم مرجعي:</span>
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">{contract.id}</span>
                </div>
             </div>
          </div>
          <div className="flex gap-2">
            {contract.file && (
                <a href={contract.file.content} download={contract.file.name} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors shadow-sm">
                    <i className="bi bi-download"></i>
                    تحميل النسخة
                </a>
            )}
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm">
                <i className="bi bi-x-lg text-lg"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-white">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <SectionHeader title="معلومات العقد الأساسية" icon="bi-info-circle-fill" colorClass="text-indigo-700" bgClass="bg-indigo-100 text-indigo-600" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                             <DetailItem label="عنوان العقد" value={contract.title} icon="bi-type-h1" />
                        </div>
                         <DetailItem label="القيمة الإجمالية" value={`${contract.value.toLocaleString()} د.ل`} icon="bi-cash-stack" />
                         <DetailItem label="نوع العقد" value={contract.type} icon="bi-folder" />
                         <DetailItem label="تاريخ التحرير" value={contract.creationDate} icon="bi-calendar-event" />
                         <DetailItem label="الحالة الحالية" value={contract.status} icon="bi-activity" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <PartyCard title="الطرف الأول" party={contract.party1} color="emerald" />
                {contract.party2 ? (
                    <PartyCard title="الطرف الثاني" party={contract.party2} color="amber" />
                ) : (
                    <div className="bg-slate-50 p-5 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center h-full text-slate-400 min-h-[200px]">
                        <i className="bi bi-person-x-fill text-4xl mb-2 opacity-50"></i>
                        <p className="font-bold text-sm">لا يوجد طرف ثاني</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div>
                    <SectionHeader title="التواريخ والمدة" icon="bi-calendar-range-fill" colorClass="text-teal-700" bgClass="bg-teal-100 text-teal-600" />
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="تاريخ البداية" value={contract.startDate} icon="bi-calendar-check" />
                        <DetailItem label="تاريخ النهاية" value={contract.endDate} icon="bi-calendar-x" />
                    </div>
                 </div>
                 <div>
                    <SectionHeader title="بيانات الأرشفة" icon="bi-archive-fill" colorClass="text-slate-700" bgClass="bg-slate-100 text-slate-600" />
                    <div className="grid grid-cols-1 gap-4">
                        <DetailItem label="محرر العقد" value={contract.editorName} icon="bi-pen" />
                        <DetailItem label="كلمات مفتاحية" value={contract.keywords} isTag={true} icon="bi-tags" />
                    </div>
                 </div>
            </div>

            {contract.notes && (
                <div className="mt-8">
                     <SectionHeader title="ملاحظات إضافية" icon="bi-sticky-fill" colorClass="text-amber-700" bgClass="bg-amber-100 text-amber-600" />
                     <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-slate-700 text-base font-medium leading-relaxed font-naskh">
                        {contract.notes}
                     </div>
                </div>
            )}

            {contract.file && (
                <div className="mt-8 bg-slate-900 rounded-xl p-1 overflow-hidden shadow-lg">
                     <div className="bg-slate-800/50 p-3 flex justify-between items-center border-b border-slate-700">
                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                            <i className="bi bi-paperclip text-amber-500"></i>
                            مرفقات العقد
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">{contract.file.name}</span>
                     </div>
                     <div className="bg-slate-900 p-4 flex items-center justify-center">
                        <a 
                            href={contract.file.content} 
                            download={contract.file.name}
                            className="flex flex-col items-center gap-3 py-6 px-10 rounded-lg border border-slate-700 hover:bg-slate-800 hover:border-amber-500/50 transition-all group"
                        >
                            <i className="bi bi-file-earmark-pdf-fill text-4xl text-slate-600 group-hover:text-amber-500 transition-colors"></i>
                            <span className="text-slate-300 font-bold text-sm group-hover:text-white">تحميل المستند الأصلي</span>
                        </a>
                     </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default ContractDetailsModal;
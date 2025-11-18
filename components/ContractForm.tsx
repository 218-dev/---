import React, { useState } from 'react';
import { Contract, ContractStatus, PartyType, IdType, Party, ContractTypeDefinition } from '../types';

interface ContractFormProps {
  contract: Contract | null;
  onSave: (contract: Contract) => void;
  onClose: () => void;
  currentUser: any;
  contractTypes: ContractTypeDefinition[];
  setContractTypes: React.Dispatch<React.SetStateAction<ContractTypeDefinition[]>>;
}

// Defined outside component to prevent re-creation on render
const inputClasses = "peer block w-full px-3 py-2.5 pr-10 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 sm:text-sm transition-all text-slate-800 font-medium placeholder-slate-400";
const labelClasses = "block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide";
const sectionHeaderClasses = "text-lg font-bold text-slate-800 pb-3 border-b border-slate-200 mb-5 flex items-center gap-2";
const iconClasses = "bi absolute right-3 top-2.5 text-lg text-slate-400 peer-focus:text-amber-600 transition-colors pointer-events-none";

// Extracted Sub-component
const PartyFields: React.FC<{
    party: Party, 
    partyKey: 'party1'|'party2', 
    title: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: string, partyKey: 'party1'|'party2') => void
}> = ({party, partyKey, title, onChange}) => (
    <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 mb-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <i className="bi bi-person-vcard-fill text-lg"></i>
        </div>
        <h4 className="font-bold text-slate-800 text-base">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
            <label className={labelClasses}>الاسم الكامل / اسم الجهة</label>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="أدخل الاسم كما في الهوية" 
                    value={party.name} 
                    onChange={(e) => onChange(e, 'name', partyKey)} 
                    className={inputClasses} 
                    required 
                />
                <i className={`${iconClasses} bi-person`}></i>
            </div>
        </div>
        <div>
            <label className={labelClasses}>الصفة القانونية</label>
            <div className="relative">
                <select 
                    value={party.type} 
                    onChange={(e) => onChange(e, 'type', partyKey)} 
                    className={inputClasses}
                >
                    {Object.values(PartyType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <i className={`${iconClasses} bi-briefcase`}></i>
            </div>
        </div>
        <div>
            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                    <label className={labelClasses}>النوع</label>
                    <div className="relative">
                        <select 
                            value={party.idType} 
                            onChange={(e) => onChange(e, 'idType', partyKey)} 
                            className={`${inputClasses} px-1 pr-8 text-xs`}
                        >
                            {Object.values(IdType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <i className={`${iconClasses} bi-card-text text-base`}></i>
                    </div>
                </div>
                <div className="col-span-2">
                    <label className={labelClasses}>رقم الإثبات</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="رقم الهوية/السجل" 
                            value={party.idNumber} 
                            onChange={(e) => onChange(e, 'idNumber', partyKey)} 
                            className={inputClasses} 
                        />
                        <i className={`${iconClasses} bi-123`}></i>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
);

const ContractForm: React.FC<ContractFormProps> = ({ contract, onSave, onClose, currentUser, contractTypes, setContractTypes }) => {
  const [hasSecondParty, setHasSecondParty] = useState(!!contract?.party2);
  
  const [formData, setFormData] = useState<Omit<Contract, 'id'>>(
    contract ? { ...contract } : {
      title: '',
      type: contractTypes.length > 0 ? contractTypes[0].name : '',
      party1: { name: '', type: PartyType.Individual, idNumber: '', idType: IdType.IdCard },
      party2: { name: '', type: PartyType.Individual, idNumber: '', idType: IdType.IdCard },
      creationDate: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: '',
      value: 0,
      status: ContractStatus.Draft,
      editorName: currentUser?.name || 'فتحي عبد الجواد',
      keywords: [],
      notes: '',
      isArchived: false,
    }
  );
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, field?: string, party?: 'party1' | 'party2') => {
    const { name, value } = e.target;
    if (party && field) {
        setFormData(prev => ({ ...prev, [party]: { ...prev[party] as Party, [field]: value } }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const keywords = e.target.value.split(',').map(k => k.trim());
      setFormData(prev => ({...prev, keywords}));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedType = contractTypes.find(t => t.name === formData.type);
    let fileData;
    
    if (contract?.file) {
        fileData = contract.file;
    } else if (selectedType) {
        fileData = selectedType.file;
    }
    
    const submissionData = { ...formData };
    if (!hasSecondParty) {
        delete submissionData.party2;
    }

    const finalContractData = { ...submissionData, file: fileData };
    onSave(contract ? { ...finalContractData, id: contract.id } : finalContractData as Contract);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex justify-center items-start sm:items-center z-50 p-0 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-slate-200 min-h-screen sm:min-h-0 sm:max-h-[95vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-500 flex items-center justify-center shadow-md">
                <i className={`bi ${contract ? 'bi-pencil-square' : 'bi-file-earmark-plus-fill'} text-2xl`}></i>
             </div>
             <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{contract ? 'تعديل بيانات العقد' : 'إنشاء عقد جديد'}</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">يرجى تعبئة كافة الحقول القانونية بدقة لضمان صحة الأرشفة</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm">
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>
        
        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white custom-scrollbar">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-8 space-y-8">
                  
                  <section>
                      <h3 className={sectionHeaderClasses}><i className="bi bi-info-square-fill text-slate-400"></i> البيانات الأساسية</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className={labelClasses}>عنوان العقد</label>
                            <div className="relative">
                                <input type="text" name="title" placeholder="مثال: عقد بيع عقار سكني بمنطقة..." value={formData.title} onChange={handleChange} className={`${inputClasses} text-lg font-bold`} required />
                                <i className={`${iconClasses} bi-type-h1`}></i>
                            </div>
                        </div>
                        
                        <div className="md:col-span-1">
                            <label className={labelClasses}>نوع العقد</label>
                            {contractTypes.length === 0 ? (
                                <div className="text-rose-600 text-sm font-bold border border-rose-200 bg-rose-50 p-2 rounded flex items-center gap-2">
                                    <i className="bi bi-exclamation-circle"></i>
                                    يجب إضافة أنواع عقود من الإعدادات أولاً
                                </div>
                            ) : (
                                <div className="relative">
                                    <select name="type" value={formData.type} onChange={handleChange} className={inputClasses} required>
                                        <option value="" disabled>اختر النوع...</option>
                                        {contractTypes.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                    </select>
                                    <i className={`${iconClasses} bi-folder`}></i>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-1">
                             <label className={labelClasses}>القيمة الإجمالية (د.ل)</label>
                             <div className="relative">
                                <input type="number" name="value" value={formData.value} onChange={handleChange} className={`${inputClasses} pl-12 font-mono text-lg`} />
                                {/* Currency label positioned absolute left */}
                                <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold bg-slate-100 px-1.5 rounded">د.ل</span>
                                {/* Icon positioned absolute right */}
                                <i className="bi bi-cash absolute right-3 top-2.5 text-lg text-slate-400 peer-focus:text-amber-600 transition-colors pointer-events-none"></i>
                             </div>
                        </div>
                      </div>
                  </section>

                  <section>
                      <div className="flex flex-wrap justify-between items-center border-b border-slate-200 mb-5 pb-3 gap-2">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><i className="bi bi-people-fill text-slate-400"></i> أطراف العقد</h3>
                        <label className="inline-flex items-center cursor-pointer group bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-all">
                            <input 
                                type="checkbox" 
                                checked={hasSecondParty} 
                                onChange={(e) => setHasSecondParty(e.target.checked)} 
                                className="sr-only peer" 
                            />
                            <div className="relative w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                            <span className="mr-3 text-xs font-bold text-slate-700 group-hover:text-amber-700 transition-colors uppercase">تفعيل طرف ثاني</span>
                        </label>
                      </div>
                      
                      <div className="space-y-6">
                        <PartyFields party={formData.party1} partyKey="party1" title="الطرف الأول" onChange={handleChange} />
                        {hasSecondParty && formData.party2 && (
                            <PartyFields party={formData.party2} partyKey="party2" title="الطرف الثاني" onChange={handleChange} />
                        )}
                      </div>
                  </section>

                  <section>
                      <h3 className={sectionHeaderClasses}><i className="bi bi-calendar-range-fill text-slate-400"></i> التواريخ والحالة</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className={labelClasses}>تاريخ التحرير</label>
                            <div className="relative">
                                <input type="date" name="creationDate" value={formData.creationDate} onChange={handleChange} className={inputClasses} />
                                <i className={`${iconClasses} bi-calendar-event`}></i>
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>بداية العقد</label>
                            <div className="relative">
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClasses} />
                                <i className={`${iconClasses} bi-calendar-check`}></i>
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>نهاية العقد</label>
                            <div className="relative">
                                <input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} className={inputClasses} />
                                <i className={`${iconClasses} bi-calendar-x`}></i>
                            </div>
                        </div>
                      </div>
                  </section>
                  
                  <section>
                      <h3 className={sectionHeaderClasses}><i className="bi bi-paperclip text-slate-400"></i> الملاحظات ونسخة العقد</h3>
                      <div className="grid grid-cols-1 gap-6">
                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                                <i className="bi bi-info-circle-fill text-amber-600 text-xl"></i>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">سيتم إرفاق نسخة العقد تلقائياً</p>
                                    <p className="text-xs text-slate-500">سيتم استخدام نموذج العقد المرتبط بالنوع المختار ({formData.type || 'لم يتم الاختيار'}) عند الحفظ.</p>
                                </div>
                            </div>
                         </div>
                         <div>
                            <label className={labelClasses}>كلمات مفتاحية للبحث</label>
                            <div className="relative">
                                <input type="text" placeholder="اكتب الكلمة وافصل بفاصلة (مثال: بيع, عقار, طرابلس)..." defaultValue={formData.keywords.join(', ')} onChange={handleKeywordsChange} className={inputClasses} />
                                <i className={`${iconClasses} bi-tags`}></i>
                            </div>
                         </div>
                         <div>
                            <label className={labelClasses}>ملاحظات إضافية</label>
                            <div className="relative">
                                <textarea name="notes" value={formData.notes} onChange={handleChange} className={`${inputClasses} min-h-[100px] font-naskh text-lg`} rows={3} placeholder="أي تفاصيل إضافية غير مذكورة أعلاه..."></textarea>
                                <i className={`${iconClasses} bi-sticky`}></i>
                            </div>
                         </div>
                      </div>
                  </section>
              </div>

              {/* Sidebar Column: Summary & Actions */}
              <div className="lg:col-span-4">
                  <div className="lg:sticky lg:top-6 space-y-6">
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-3 flex items-center gap-2">
                            <i className="bi bi-list-check text-amber-600"></i> ملخص الإجراء
                          </h4>
                          <div className="space-y-4 text-sm">
                              <div className="flex justify-between items-center">
                                  <span className="text-slate-500 font-bold text-xs uppercase">المحرر المسؤول</span>
                                  <span className="font-bold text-slate-800">{formData.editorName}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                  <span className="text-slate-500 font-bold text-xs uppercase">حالة العقد</span>
                                  <div className="relative w-32">
                                    <select 
                                        value={formData.status} 
                                        onChange={(e) => setFormData({...formData, status: e.target.value as ContractStatus})}
                                        className="w-full text-xs font-bold border-slate-300 rounded-md bg-white py-1.5 pr-6 pl-2 focus:ring-amber-500 shadow-sm appearance-none border"
                                    >
                                        {Object.values(ContractStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <i className="bi bi-chevron-down absolute right-2 top-2 text-[10px] text-slate-500 pointer-events-none"></i>
                                  </div>
                              </div>
                              <div className="pt-4 border-t border-slate-200">
                                  <label className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.isArchived}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isArchived: e.target.checked }))}
                                        className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-600 border-slate-300"
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-slate-800">أرشفة فورية</span>
                                        <span className="block text-xs text-slate-500">نقل العقد مباشرة للأرشيف بعد الحفظ</span>
                                    </div>
                                  </label>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 pt-2 border-t border-slate-100 sm:border-0 sm:pt-0 bg-white sm:bg-transparent sticky bottom-0 p-4 sm:p-0 shadow-upper sm:shadow-none z-20">
                        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all flex justify-center items-center gap-3 group transform active:scale-95">
                            <i className="bi bi-check-circle-fill text-xl text-emerald-400 group-hover:text-emerald-300 transition-colors"></i>
                            <span>حفظ البيانات وإصدار الفاتورة</span>
                        </button>
                        <button type="button" onClick={onClose} className="w-full bg-white border border-slate-300 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                            إلغاء الأمر
                        </button>
                      </div>
                  </div>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractForm;
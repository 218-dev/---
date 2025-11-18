import React, { useState, useMemo } from 'react';
import { Contract, ContractStatus, User, ContractTypeDefinition } from '../types';
import ContractForm from './ContractForm';
import ContractDetailsModal from './ContractDetailsModal';
import InvoiceModal from './InvoiceModal';

interface ContractsPageProps {
  contracts: Contract[];
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
  addAuditLog: (action: string) => void;
  currentUser: User;
  contractTypes: ContractTypeDefinition[];
  setContractTypes: React.Dispatch<React.SetStateAction<ContractTypeDefinition[]>>;
}

const ContractsPage: React.FC<ContractsPageProps> = ({ contracts, setContracts, addAuditLog, currentUser, contractTypes, setContractTypes }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [detailsContract, setDetailsContract] = useState<Contract | null>(null);
  
  const [invoiceContract, setInvoiceContract] = useState<Contract | null>(null);

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    partyName: '',
    idNumber: '',
    dateFrom: '',
    dateTo: '',
    showArchived: false,
  });

  const handleAddContract = () => {
    setEditingContract(null);
    setIsFormOpen(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setIsFormOpen(true);
  };

  const handleViewDetails = (contract: Contract) => {
    setDetailsContract(contract);
  };
  
  const handleDeleteContract = (id: number, title: string) => {
      if(confirm(`هل أنت متأكد من حذف العقد: ${title}؟`)) {
          setContracts(contracts.filter(c => c.id !== id));
          addAuditLog(`حذف عقد: ${title}`);
      }
  }

  const handleSaveContract = (contract: Contract) => {
    if (editingContract) {
      setContracts(contracts.map(c => (c.id === contract.id ? contract : c)));
      addAuditLog(`تعديل عقد: ${contract.title}`);
      setIsFormOpen(false);
      setEditingContract(null);
      
      // Optional: Show success modal even on edit if desired, currently only on create for "invoice" flow
      // setInvoiceContract(contract); 
    } else {
      const newContract = { ...contract, id: Date.now() }; 
      setContracts([newContract, ...contracts]);
      addAuditLog(`إضافة عقد جديد: ${contract.title}`);
      setIsFormOpen(false);
      
      setInvoiceContract(newContract);
    }
  };
  
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
        // General Search (Title or ID)
        const matchesSearch = searchTerm === '' || 
            contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(contract.id).includes(searchTerm);

        // Basic Filters
        const matchesType = filters.type === '' || contract.type === filters.type;
        const matchesStatus = filters.status === '' || contract.status === filters.status;
        const matchesArchived = filters.showArchived ? true : !contract.isArchived;

        // Advanced Filters
        const matchesPartyName = filters.partyName === '' || 
            contract.party1.name.toLowerCase().includes(filters.partyName.toLowerCase()) ||
            (contract.party2?.name.toLowerCase().includes(filters.partyName.toLowerCase()) ?? false);

        const matchesIdNumber = filters.idNumber === '' ||
            contract.party1.idNumber.includes(filters.idNumber) ||
            (contract.party2?.idNumber.includes(filters.idNumber) ?? false);

        const matchesDateFrom = filters.dateFrom === '' || contract.creationDate >= filters.dateFrom;
        const matchesDateTo = filters.dateTo === '' || contract.creationDate <= filters.dateTo;

        return matchesSearch && matchesType && matchesStatus && matchesArchived && matchesPartyName && matchesIdNumber && matchesDateFrom && matchesDateTo;
    });
  }, [contracts, searchTerm, filters]);

  // Corrected for RTL: pr-10, right-3
  const inputClasses = "peer w-full px-3 py-2.5 pr-10 bg-white border border-slate-300 rounded-md focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all text-sm font-medium placeholder-slate-400";
  const labelClasses = "block text-xs font-bold text-slate-600 mb-1.5";
  const iconClasses = "bi absolute right-3 top-2.5 text-slate-400 peer-focus:text-amber-600 transition-colors pointer-events-none";

  const getStatusBadge = (status: ContractStatus) => {
      switch (status) {
          case ContractStatus.Final:
              return <span className="px-3 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">نهائي</span>;
          case ContractStatus.Draft:
              return <span className="px-3 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">مسودة</span>;
          case ContractStatus.Expired:
              return <span className="px-3 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap">منتهي</span>;
          case ContractStatus.Canceled:
              return <span className="px-3 py-1 rounded text-xs font-bold bg-slate-200 text-slate-600 border border-slate-300 whitespace-nowrap">ملغي</span>;
          default:
              return <span className="px-3 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700 whitespace-nowrap">غير معروف</span>;
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">إدارة العقود</h1>
            <p className="text-slate-500 text-sm mt-1">سجل العقود والأرشيف المركزي</p>
        </div>
        {currentUser.role !== 'مساعد إداري' && (
            <button
            onClick={handleAddContract}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all"
            >
            <i className="bi bi-plus-lg text-lg"></i>
            <span>إضافة عقد جديد</span>
            </button>
        )}
      </div>

      {/* Filters Card */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <i className="bi bi-funnel-fill text-amber-600"></i>
                  خيارات البحث والتصفية
              </h3>
              <button 
                onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
                className={`text-sm font-bold flex items-center gap-1 transition-colors ${isAdvancedSearchOpen ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                  {isAdvancedSearchOpen ? 'إخفاء البحث المتقدم' : 'بحث متقدم'}
                  <i className={`bi ${isAdvancedSearchOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                 <label className={labelClasses}>بحث عام (العنوان / الرقم)</label>
                 <div className="relative">
                    <input 
                        type="text" 
                        placeholder="بحث بالعنوان أو رقم العقد..."
                        className={inputClasses}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className={`${iconClasses} bi-search`}></i>
                 </div>
              </div>
              <div className="md:col-span-3">
                <label className={labelClasses}>نوع العقد</label>
                <div className="relative">
                    <select 
                        className={inputClasses}
                        value={filters.type}
                        onChange={(e) => setFilters(f => ({...f, type: e.target.value}))}
                    >
                        <option value="">عرض الكل</option>
                        {contractTypes.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                    <i className={`${iconClasses} bi-folder`}></i>
                </div>
              </div>
              <div className="md:col-span-3">
                <label className={labelClasses}>حالة العقد</label>
                <div className="relative">
                    <select 
                        className={inputClasses}
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({...f, status: e.target.value}))}
                    >
                        <option value="">عرض الكل</option>
                        {Object.values(ContractStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <i className={`${iconClasses} bi-activity`}></i>
                </div>
              </div>
              <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition-colors justify-center h-[42px]">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-600 border-slate-300"
                        checked={filters.showArchived}
                        onChange={(e) => setFilters(f => ({ ...f, showArchived: e.target.checked }))}
                    />
                    <span className="text-xs font-bold text-slate-700">الأرشيف</span>
                  </label>
              </div>
          </div>

          {isAdvancedSearchOpen && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                      <label className={labelClasses}>اسم أحد الأطراف</label>
                      <div className="relative">
                        <input 
                            type="text" 
                            className={inputClasses} 
                            placeholder="اسم الطرف الأول أو الثاني"
                            value={filters.partyName}
                            onChange={(e) => setFilters(f => ({...f, partyName: e.target.value}))}
                        />
                        <i className={`${iconClasses} bi-person`}></i>
                      </div>
                  </div>
                  <div>
                      <label className={labelClasses}>رقم الهوية / السجل</label>
                      <div className="relative">
                        <input 
                            type="text" 
                            className={inputClasses} 
                            placeholder="رقم الهوية..."
                            value={filters.idNumber}
                            onChange={(e) => setFilters(f => ({...f, idNumber: e.target.value}))}
                        />
                        <i className={`${iconClasses} bi-card-text`}></i>
                      </div>
                  </div>
                  <div>
                      <label className={labelClasses}>تاريخ التحرير (من)</label>
                      <div className="relative">
                        <input 
                            type="date" 
                            className={inputClasses} 
                            value={filters.dateFrom}
                            onChange={(e) => setFilters(f => ({...f, dateFrom: e.target.value}))}
                        />
                        <i className={`${iconClasses} bi-calendar`}></i>
                      </div>
                  </div>
                  <div>
                      <label className={labelClasses}>تاريخ التحرير (إلى)</label>
                      <div className="relative">
                        <input 
                            type="date" 
                            className={inputClasses} 
                            value={filters.dateTo}
                            onChange={(e) => setFilters(f => ({...f, dateTo: e.target.value}))}
                        />
                        <i className={`${iconClasses} bi-calendar`}></i>
                      </div>
                  </div>
              </div>
          )}
      </div>
      
      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-right min-w-[800px]">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase text-xs font-bold">
                <tr>
                <th scope="col" className="px-6 py-4">#</th>
                <th scope="col" className="px-6 py-4">عنوان العقد</th>
                <th scope="col" className="px-6 py-4">النوع</th>
                <th scope="col" className="px-6 py-4">تاريخ التحرير</th>
                <th scope="col" className="px-6 py-4">الحالة</th>
                <th scope="col" className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredContracts.map((contract, index) => (
                <tr key={contract.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-slate-500 font-bold">{index + 1}</td>
                    <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-base">{contract.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{contract.party1.name}</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {contract.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {new Date(contract.creationDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                        {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                            <button onClick={() => handleViewDetails(contract)} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-r-md hover:bg-slate-50 hover:text-amber-600 focus:z-10 focus:ring-1 focus:ring-amber-600 focus:text-amber-600 transition-all" title="عرض التفاصيل">
                                <i className="bi bi-eye-fill"></i>
                            </button>
                            {currentUser.role !== 'مساعد إداري' && (
                                <button onClick={() => handleEditContract(contract)} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border-t border-b border-slate-200 hover:bg-slate-50 hover:text-blue-600 focus:z-10 focus:ring-1 focus:ring-blue-600 focus:text-blue-600 transition-all" title="تعديل">
                                    <i className="bi bi-pencil-fill"></i>
                                </button>
                            )}
                             {currentUser.role === 'مدير النظام' && (
                                <button onClick={() => handleDeleteContract(contract.id, contract.title)} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-l-md hover:bg-rose-50 hover:text-rose-600 focus:z-10 focus:ring-1 focus:ring-rose-600 focus:text-rose-600 transition-all" title="حذف">
                                    <i className="bi bi-trash-fill"></i>
                                </button>
                             )}
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        {filteredContracts.length === 0 && (
            <div className="text-center p-16 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                    <i className="bi bi-folder-x text-4xl text-slate-300"></i>
                </div>
                <h3 className="text-xl text-slate-800 font-bold mb-2">لا توجد عقود</h3>
                <p className="text-slate-500 text-sm max-w-md">لم يتم العثور على أي عقود تطابق معايير البحث الحالية. حاول تغيير الفلاتر أو إضافة عقد جديد.</p>
            </div>
        )}
      </div>

      {isFormOpen && (
        <ContractForm
          contract={editingContract}
          onSave={handleSaveContract}
          onClose={() => setIsFormOpen(false)}
          currentUser={currentUser}
          contractTypes={contractTypes}
          setContractTypes={setContractTypes}
        />
      )}
      {detailsContract && (
        <ContractDetailsModal
            contract={detailsContract}
            onClose={() => setDetailsContract(null)}
        />
      )}
      {invoiceContract && (
        <InvoiceModal
            contract={invoiceContract}
            onClose={() => setInvoiceContract(null)}
        />
      )}
    </div>
  );
};

export default ContractsPage;
import React, { useState } from 'react';
import { Contract } from '../types';

interface InvoiceModalProps {
  contract: Contract;
  onClose: () => void;
}

type PrintMode = 'none' | 'invoice' | 'file';

const InvoiceModal: React.FC<InvoiceModalProps> = ({ contract, onClose }) => {
  const [printMode, setPrintMode] = useState<PrintMode>('none');

  const handlePrintInvoice = () => {
    setPrintMode('invoice');
    // Small delay to allow the view to update before the print dialog takes over
    setTimeout(() => {
        window.print();
    }, 300);
  };

  const handlePrintFile = () => {
    if (!contract.file) return;
    setPrintMode('file');
    setTimeout(() => {
        window.print();
    }, 300);
  };

  const handleBack = () => {
      setPrintMode('none');
  }

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex justify-center items-center z-50 p-0 sm:p-4 backdrop-blur-md print:p-0 print:bg-white print:block print:relative overflow-y-auto" id="invoice-overlay">
      
      {/* Success Screen UI (Visible only when printMode is 'none') */}
      <div className={`bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all p-8 text-center space-y-6 print:hidden ${printMode !== 'none' ? 'hidden' : 'block'}`}>
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <i className="bi bi-check-lg text-5xl text-emerald-600"></i>
          </div>
          
          <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">تم حفظ العقد بنجاح</h2>
              <p className="text-slate-500 text-sm px-6">تمت عملية الأرشفة بنجاح وحفظ البيانات في قاعدة البيانات المحلية.</p>
              <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block min-w-[200px]">
                  <p className="text-slate-900 font-bold text-lg">{contract.title}</p>
                  <p className="text-xs text-slate-500 font-mono">REF: {contract.id}</p>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
              <button 
                onClick={handlePrintInvoice}
                className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-3 group"
              >
                  <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                     <i className="bi bi-receipt-cutoff text-xl text-amber-500"></i>
                  </span>
                  <span>طباعة إيصال توثيق عقد</span>
              </button>
              
              {contract.file && (
                  <button 
                    onClick={handlePrintFile}
                    className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-4 px-6 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center justify-center gap-3 group"
                  >
                       <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                          <i className="bi bi-file-earmark-pdf text-xl text-blue-600"></i>
                       </span>
                      <span>طباعة نسخة العقد المرفقة</span>
                  </button>
              )}
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm mt-6 flex items-center justify-center gap-2 mx-auto transition-colors"
          >
              <i className="bi bi-arrow-right"></i>
              العودة لقائمة العقود
          </button>
      </div>


      {/* Printable Container (This is what gets printed) */}
      <div id="invoice-modal" className={`bg-white rounded-none shadow-none w-full max-w-4xl mx-auto ${printMode === 'none' ? 'hidden' : 'block'} print:block`}>
            
            {/* INVOICE DOCUMENT */}
            <div className={`p-12 print:p-[10mm] relative z-10 flex flex-col justify-between min-h-[297mm] ${printMode === 'file' ? 'hidden print:hidden' : 'block'}`}>
                <div>
                    {/* Header */}
                    <div className="text-center border-b-2 border-slate-900 pb-6 mb-10 print:border-black">
                        <div className="flex justify-between items-start">
                             <div className="text-right w-32 pt-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">رقم الترخيص</p>
                                <p className="font-mono font-bold text-slate-900 text-xs">LIC-9821-LY</p>
                             </div>
                             <div className="flex-1">
                                <h1 className="text-4xl font-bold mb-1 font-reem-ink text-slate-900 print:text-black">محرر عقود</h1>
                                <h2 className="text-5xl font-bold mb-4 font-reem-ink text-amber-600 print:text-black">فتحي عبد الجواد</h2>
                                <div className="inline-flex gap-8 text-sm font-bold text-slate-600 print:text-black border-t border-b border-slate-100 py-2 px-8 mt-2">
                                    <span>توثيق عقود</span>
                                    <span>•</span>
                                    <span>استشارات قانونية</span>
                                    <span>•</span>
                                    <span>أرشفة إلكترونية</span>
                                </div>
                             </div>
                             <div className="text-left w-32 pt-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">التاريخ</p>
                                <p className="font-mono font-bold text-slate-900 text-xs">{new Date().toLocaleDateString('en-GB')}</p>
                             </div>
                        </div>
                    </div>

                    {/* Meta Info Row */}
                    <div className="flex justify-between items-end mb-8 bg-slate-50 p-5 rounded-lg border border-slate-100 print:bg-transparent print:p-0 print:border-0">
                        <div>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1 font-bold">رقم المرجع (Reference)</p>
                            <p className="font-bold text-3xl font-mono text-slate-900">#{contract.id}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1 font-bold">تاريخ تحرير العقد</p>
                            <p className="font-bold text-xl font-mono text-slate-900">{new Date(contract.creationDate).toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>

                    {/* Main Details */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden mb-10 print:border-black print:rounded-none">
                        <div className="bg-slate-900 text-white p-3 print:bg-black print:text-white">
                             <h3 className="font-bold text-sm flex items-center gap-2 justify-center">
                                إيصال توثيق عقد رسمي
                             </h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-y-8 gap-x-12 text-sm">
                            <div className="col-span-2 pb-6 border-b border-dashed border-slate-200 print:border-gray-400">
                                <span className="block text-slate-500 text-xs font-bold uppercase mb-2">عنوان وموضوع العقد</span>
                                <span className="font-bold text-2xl text-slate-900 leading-relaxed">{contract.title}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 text-xs font-bold uppercase mb-1">نوع العقد</span>
                                <span className="font-bold text-lg text-slate-900">{contract.type}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 text-xs font-bold uppercase mb-1">القيمة المالية</span>
                                <span className="font-bold text-lg text-slate-900 font-mono">{contract.value.toLocaleString()} د.ل</span>
                            </div>
                        </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 print:bg-transparent print:border-0 print:p-0">
                            <h4 className="font-bold border-b-2 border-slate-200 mb-3 pb-1 text-slate-800 text-sm uppercase">الطرف الأول</h4>
                            <p className="font-bold text-lg mb-1 text-slate-900">{contract.party1.name}</p>
                            <p className="text-sm text-slate-600 font-mono flex items-center gap-2">
                                <span className="bg-slate-200 px-1.5 rounded text-[10px] font-bold print:hidden">{contract.party1.idType}</span>
                                {contract.party1.idNumber}
                            </p>
                        </div>
                        {contract.party2 ? (
                            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 print:bg-transparent print:border-0 print:p-0">
                                <h4 className="font-bold border-b-2 border-slate-200 mb-3 pb-1 text-slate-800 text-sm uppercase">الطرف الثاني</h4>
                                <p className="font-bold text-lg mb-1 text-slate-900">{contract.party2.name}</p>
                                <p className="text-sm text-slate-600 font-mono flex items-center gap-2">
                                     <span className="bg-slate-200 px-1.5 rounded text-[10px] font-bold print:hidden">{contract.party2.idType}</span>
                                     {contract.party2.idNumber}
                                </p>
                            </div>
                        ) : (
                            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 print:bg-transparent print:border-0 print:p-0 flex items-center justify-center">
                                <span className="text-slate-400 text-xs font-bold uppercase">لا يوجد طرف ثاني</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Signature Area */}
                <div className="flex justify-between mt-8 pt-8 border-t-2 border-slate-900 print:border-black align-bottom">
                    <div className="text-center w-1/3">
                        <p className="font-bold mb-8 text-slate-500 text-xs uppercase tracking-widest">توقيع المحرر</p>
                        {/* Empty space for signature */}
                        <div className="h-20 border-b border-dashed border-slate-400 mb-2 w-3/4 mx-auto"></div>
                        <p className="font-reem-ink text-xl text-slate-900">فتحي عبد الجواد</p>
                    </div>
                    <div className="text-center w-1/3">
                        <p className="font-bold mb-4 text-slate-500 text-xs uppercase tracking-widest">الختم الرسمي</p>
                        {/* Empty Circle for Stamp */}
                        <div className="w-32 h-32 border-4 border-slate-300 border-double rounded-full mx-auto flex items-center justify-center text-slate-300 print:border-gray-400 print:text-gray-300">
                            <span className="block text-[10px] font-bold opacity-50">ختم المكتب</span>
                        </div>
                    </div>
                </div>
                
                <div className="text-center mt-8 text-[10px] text-slate-400 font-mono print:text-black print:mt-4">
                    <p>تم إصدار هذا المستند إلكترونياً من منظومة الأرشفة الإلكترونية.</p>
                    <p dir="ltr">System ID: {contract.id}</p>
                </div>
            </div>
            
            {/* ATTACHMENT SECTION (Only visible when printMode is 'file') */}
            {contract.file && (
                <div className={`w-full h-screen bg-white p-0 print:p-0 print:h-screen print:w-full flex items-center justify-center ${printMode === 'invoice' ? 'hidden print:hidden' : 'block'}`}>
                    {contract.file.type.startsWith('image/') ? (
                        <img 
                            src={contract.file.content} 
                            alt="نسخة العقد" 
                            className="max-w-full max-h-full object-contain print:w-full print:h-full" 
                        />
                    ) : (
                        <embed 
                            src={contract.file.content}
                            type={contract.file.type}
                            className="w-full h-full print:w-full print:h-full"
                        />
                    )}
                </div>
            )}

             {/* Back Button (Visible when viewing the printable version on screen) */}
             <div className="fixed top-6 left-6 print:hidden z-50">
                <button 
                    onClick={handleBack} 
                    className="bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-slate-700 transition-all flex items-center gap-2 font-bold"
                >
                    <i className="bi bi-arrow-right"></i>
                    <span>العودة</span>
                </button>
             </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
import React, { useState } from 'react';
import { User, AuditLogEntry, ContractTypeDefinition } from '../types';
import { createBackup, restoreBackup } from '../utils/storage';

type SettingsTab = 'users' | 'audit' | 'general' | 'backup';

interface SettingsPageProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    auditLog: AuditLogEntry[];
    addAuditLog: (action: string) => void;
    currentUser: User;
    contractTypes: ContractTypeDefinition[];
    setContractTypes: React.Dispatch<React.SetStateAction<ContractTypeDefinition[]>>;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const SettingsPage: React.FC<SettingsPageProps> = ({ 
    users, setUsers, 
    auditLog, addAuditLog, currentUser,
    contractTypes, setContractTypes 
}) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('users');
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    
    // Contract Type Form State
    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeFile, setNewTypeFile] = useState<File | null>(null);

    // New User Form State
    const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
        name: '',
        phone: '',
        password: '',
        role: 'محرر عقود',
        status: 'نشط'
    });

    // Backup State
    const [isRestoring, setIsRestoring] = useState(false);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if(newUser.name && newUser.phone && newUser.password) {
            const userToAdd: User = { ...newUser, id: Date.now() };
            setUsers([...users, userToAdd]);
            addAuditLog(`إضافة مستخدم جديد: ${newUser.name}`);
            setIsUserFormOpen(false);
            setNewUser({ name: '', phone: '', password: '', role: 'محرر عقود', status: 'نشط' });
        }
    };

    const handleDeleteUser = (id: number, name: string) => {
        if (confirm(`هل أنت متأكد من حذف المستخدم ${name}؟`)) {
            setUsers(users.filter(u => u.id !== id));
            addAuditLog(`حذف مستخدم: ${name}`);
        }
    };

    const handleAddType = async (e: React.FormEvent) => {
        e.preventDefault();
        if(newTypeName && newTypeFile) {
            if(contractTypes.some(t => t.name === newTypeName)) {
                alert('هذا النوع موجود مسبقاً');
                return;
            }

            try {
                const base64 = await fileToBase64(newTypeFile);
                const newType: ContractTypeDefinition = {
                    name: newTypeName,
                    file: {
                        name: newTypeFile.name,
                        content: base64,
                        type: newTypeFile.type
                    }
                };

                setContractTypes([...contractTypes, newType]);
                setNewTypeName('');
                setNewTypeFile(null);
                addAuditLog(`إضافة نوع عقد جديد: ${newTypeName}`);
            } catch (error) {
                console.error("Error reading file", error);
                alert("حدث خطأ أثناء قراءة الملف");
            }
        }
    };

    const handleDeleteType = (typeName: string) => {
        if(confirm(`حذف نوع العقد "${typeName}"؟`)) {
            setContractTypes(contractTypes.filter(t => t.name !== typeName));
            addAuditLog(`حذف نوع عقد: ${typeName}`);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            setNewTypeFile(e.target.files[0]);
        }
    }

    const handleDownloadBackup = async () => {
        try {
            const json = await createBackup();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `archive_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addAuditLog('تنزيل نسخة احتياطية كاملة');
        } catch (e) {
            alert('حدث خطأ أثناء إنشاء النسخة الاحتياطية');
            console.error(e);
        }
    };

    const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (confirm('تحذير: استعادة النسخة الاحتياطية ستمسح جميع البيانات الحالية وتستبدلها بالبيانات الموجودة في الملف. هل أنت متأكد؟')) {
            setIsRestoring(true);
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const json = event.target?.result as string;
                    const success = await restoreBackup(json);
                    if (success) {
                        alert('تمت استعادة البيانات بنجاح. سيتم إعادة تحميل الصفحة.');
                        window.location.reload();
                    } else {
                        alert('حدث خطأ أثناء استعادة البيانات. يرجى التأكد من صحة الملف.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('ملف النسخة الاحتياطية غير صالح.');
                } finally {
                    setIsRestoring(false);
                }
            };
            reader.readAsText(file);
        } else {
            e.target.value = ''; // Reset input
        }
    };

    const TabButton: React.FC<{tab: SettingsTab; label: string; icon: string}> = ({ tab, label, icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 md:px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab 
                ? 'border-amber-600 text-amber-700 bg-amber-50' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
        >
            <i className={`bi ${icon}`}></i>
            <span>{label}</span>
        </button>
    );

    // Corrected for RTL: pr-10, right-3
    const inputClasses = "peer w-full px-4 py-2 pr-10 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-sm placeholder-slate-400";
    const iconClasses = "bi absolute right-3 top-2.5 text-slate-400 peer-focus:text-amber-600 transition-colors pointer-events-none";

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">إعدادات النظام</h1>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar">
                    <TabButton tab="users" label="إدارة المستخدمين" icon="bi-people-fill" />
                    <TabButton tab="audit" label="سجل التدقيق" icon="bi-clock-history" />
                    {currentUser.role === 'مدير النظام' && <TabButton tab="general" label="إعدادات عامة" icon="bi-gear-fill" />}
                    {currentUser.role === 'مدير النظام' && <TabButton tab="backup" label="النسخ الاحتياطي" icon="bi-hdd-network-fill" />}
                </div>
                
                <div className="p-4 md:p-8 min-h-[400px]">
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">قائمة المستخدمين</h3>
                                {currentUser.role === 'مدير النظام' && (
                                    <button 
                                        onClick={() => setIsUserFormOpen(true)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2"
                                    >
                                        <i className="bi bi-person-plus-fill"></i>
                                        <span className="hidden sm:inline">إضافة مستخدم</span>
                                        <span className="sm:hidden">إضافة</span>
                                    </button>
                                )}
                            </div>
                            
                            {isUserFormOpen && (
                                <div className="mb-8 p-6 border border-slate-200 bg-slate-50 rounded-lg">
                                    <h4 className="font-bold mb-4 text-slate-800">بيانات المستخدم الجديد</h4>
                                    <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="relative">
                                            <input type="text" placeholder="الاسم الكامل" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className={inputClasses} required />
                                            <i className={`${iconClasses} bi-person`}></i>
                                        </div>
                                        <div className="relative">
                                            <input type="text" placeholder="رقم الهاتف (للدخول)" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className={inputClasses} required />
                                            <i className={`${iconClasses} bi-phone`}></i>
                                        </div>
                                        <div className="relative">
                                            <input type="text" placeholder="كلمة المرور" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className={inputClasses} required />
                                            <i className={`${iconClasses} bi-key`}></i>
                                        </div>
                                        <div className="relative">
                                            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})} className={inputClasses}>
                                                <option value="مدير النظام">مدير النظام</option>
                                                <option value="محرر عقود">محرر عقود</option>
                                                <option value="مساعد إداري">مساعد إداري</option>
                                            </select>
                                            <i className={`${iconClasses} bi-person-badge`}></i>
                                        </div>
                                        <div className="relative">
                                            <select value={newUser.status} onChange={e => setNewUser({...newUser, status: e.target.value as any})} className={inputClasses}>
                                                <option value="نشط">نشط</option>
                                                <option value="غير نشط">غير نشط</option>
                                            </select>
                                            <i className={`${iconClasses} bi-toggle-on`}></i>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-md font-bold w-full hover:bg-amber-700">حفظ</button>
                                            <button type="button" onClick={() => setIsUserFormOpen(false)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md font-bold hover:bg-slate-50">إلغاء</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full text-sm text-right min-w-[600px]">
                                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3 font-bold">الاسم</th>
                                            <th className="px-6 py-3 font-bold">رقم الهاتف</th>
                                            <th className="px-6 py-3 font-bold">الدور</th>
                                            <th className="px-6 py-3 font-bold">الحالة</th>
                                            <th className="px-6 py-3 font-bold">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {users.map(user => (
                                            <tr key={user.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                                                <td className="px-6 py-4 text-slate-600 font-mono">{user.phone}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium text-xs">{user.role}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                                                        user.status === 'نشط' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-500'
                                                    }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {currentUser.role === 'مدير النظام' && user.id !== currentUser.id && (
                                                        <button onClick={() => handleDeleteUser(user.id, user.name)} className="text-rose-500 hover:text-rose-700 transition-colors" title="حذف"><i className="bi bi-trash-fill"></i></button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                         <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-sm text-right min-w-[600px]">
                                <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-6 py-3">التوقيت</th>
                                        <th className="px-6 py-3">المستخدم</th>
                                        <th className="px-6 py-3">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {auditLog.length === 0 ? (
                                        <tr><td colSpan={3} className="p-8 text-center text-slate-400">لا يوجد سجل نشاطات حتى الآن</td></tr>
                                    ) : (
                                        auditLog.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-mono text-slate-600 text-xs" dir="ltr">{log.timestamp}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800">{log.user}</td>
                                                <td className="px-6 py-4 text-slate-700">{log.action}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {activeTab === 'general' && (
                        <div className="max-w-3xl">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">إدارة أنواع العقود والنماذج</h3>
                            
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <i className="bi bi-plus-circle-fill text-amber-600"></i>
                                    إضافة نوع جديد ونموذج عقد
                                </h4>
                                <form onSubmit={handleAddType} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم نوع العقد (مثال: بيع عقار، تنازل)</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={newTypeName} 
                                                onChange={(e) => setNewTypeName(e.target.value)}
                                                placeholder="أدخل الاسم"
                                                className={inputClasses}
                                                required
                                            />
                                            <i className={`${iconClasses} bi-pen`}></i>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5">نسخة العقد الفارغة (النموذج)</label>
                                        <div className="relative border border-slate-300 rounded-md bg-white p-2 flex items-center peer focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-600">
                                            <i className="bi bi-file-earmark-arrow-up text-slate-400 text-lg ml-auto mr-2"></i>
                                            <input 
                                                type="file"
                                                onChange={handleFileChange}
                                                accept="image/*,.pdf"
                                                className="block w-full text-sm text-slate-500
                                                file:ml-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-xs file:font-bold
                                                file:bg-amber-50 file:text-amber-700
                                                hover:file:bg-amber-100"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">يرجى رفع صورة أو ملف PDF لنموذج العقد الفارغ ليتم طباعته عند الإنشاء.</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <button type="submit" className="bg-slate-900 text-white w-full py-2.5 rounded-md font-bold hover:bg-slate-800 shadow-sm transition-colors flex items-center justify-center gap-2">
                                            <i className="bi bi-save"></i>
                                            حفظ النوع والنموذج
                                        </button>
                                    </div>
                                </form>
                            </div>
                            
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wide">الأنواع الحالية</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {contractTypes.length === 0 && (
                                        <div className="col-span-1 text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                                            لا توجد أنواع عقود مضافة حالياً. يرجى إضافة أنواع لكي يعمل النظام.
                                        </div>
                                    )}
                                    {contractTypes.map(typeDef => (
                                        <div key={typeDef.name} className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-slate-100 text-slate-600 flex items-center justify-center">
                                                    <i className="bi bi-file-text"></i>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{typeDef.name}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <i className="bi bi-paperclip"></i>
                                                        {typeDef.file.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteType(typeDef.name)}
                                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                title="حذف"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'backup' && (
                        <div className="max-w-2xl">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">النسخ الاحتياطي والاستعادة</h3>
                            
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <i className="bi bi-cloud-download-fill text-2xl"></i>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-slate-800 mb-2">تصدير نسخة احتياطية</h4>
                                            <p className="text-sm text-slate-600 mb-4">
                                                قم بتحميل نسخة كاملة من قاعدة البيانات (العقود، المستخدمين، الإعدادات، الصور) كملف واحد. 
                                                يفضل القيام بهذه العملية دورياً.
                                            </p>
                                            <button 
                                                onClick={handleDownloadBackup}
                                                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                                            >
                                                <i className="bi bi-download"></i>
                                                تحميل ملف النسخة الاحتياطية
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                            <i className="bi bi-cloud-upload-fill text-2xl"></i>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-slate-800 mb-2">استعادة نسخة سابقة</h4>
                                            <p className="text-sm text-slate-600 mb-4">
                                                استرجاع النظام لحالة سابقة باستخدام ملف نسخة احتياطية.
                                                <span className="block text-rose-600 font-bold mt-1">تنبيه: هذه العملية ستقوم بمسح جميع البيانات الحالية واستبدالها!</span>
                                            </p>
                                            <label className={`inline-flex bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-900 transition-colors shadow-sm items-center gap-2 cursor-pointer ${isRestoring ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <i className={`bi ${isRestoring ? 'bi-arrow-repeat animate-spin' : 'bi-upload'}`}></i>
                                                <span>{isRestoring ? 'جاري الاستعادة...' : 'اختيار ملف للاستعادة'}</span>
                                                <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" disabled={isRestoring} />
                                            </label>
                                        </div>
                                    </div>
                                    {/* Caution Stripe */}
                                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 rotate-45"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
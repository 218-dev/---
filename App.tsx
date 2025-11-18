
import React, { useState, useEffect, useRef } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ContractsPage from './components/ContractsPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import { Contract, Page, User, AuditLogEntry, ContractTypeDefinition } from './types';
import { INITIAL_CONTRACTS, INITIAL_USERS, DEFAULT_CONTRACT_TYPES } from './constants';
import Header from './components/Header';
import { loadData, saveData, initDB } from './utils/storage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const isInitialLoadComplete = useRef(false);
  
  // Core System Data State
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [contractTypes, setContractTypes] = useState<ContractTypeDefinition[]>([]);

  // Initial Data Load
  useEffect(() => {
    const initSystem = async () => {
        try {
            console.log("Initializing System...");
            await initDB();

            // Load all data in parallel
            const [loadedContracts, loadedUsers, loadedAudit, loadedTypes] = await Promise.all([
                loadData('contracts', INITIAL_CONTRACTS),
                loadData('users', INITIAL_USERS),
                loadData('audit_log', [] as AuditLogEntry[]),
                loadData('contract_types', DEFAULT_CONTRACT_TYPES)
            ]);

            setContracts(loadedContracts);
            setUsers(loadedUsers);
            setAuditLog(loadedAudit);
            setContractTypes(loadedTypes);
            
            // Mark initial load as complete so we can start saving changes
            isInitialLoadComplete.current = true;
            console.log("System Loaded Successfully.");

        } catch (error) {
            console.error("Failed to load system data", error);
            alert("حدث خطأ أثناء تحميل البيانات. يرجى تحديث الصفحة.");
        } finally {
            setIsLoading(false);
        }
    };
    initSystem();
  }, []);

  // Auto-Save Effects - Protected by isInitialLoadComplete
  useEffect(() => {
    if (!isLoading && isInitialLoadComplete.current) {
        saveData('contracts', contracts, setSaveStatus);
    }
  }, [contracts, isLoading]);

  useEffect(() => {
    if (!isLoading && isInitialLoadComplete.current) {
        saveData('users', users, setSaveStatus);
    }
  }, [users, isLoading]);

  useEffect(() => {
    if (!isLoading && isInitialLoadComplete.current) {
        saveData('audit_log', auditLog, setSaveStatus);
    }
  }, [auditLog, isLoading]);

  useEffect(() => {
    if (!isLoading && isInitialLoadComplete.current) {
        saveData('contract_types', contractTypes, setSaveStatus);
    }
  }, [contractTypes, isLoading]);

  const addAuditLog = (action: string, userName?: string) => {
    const newLog: AuditLogEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('ar-LY'),
      user: userName || currentUser?.name || 'غير معروف',
      action: action
    };
    setAuditLog(prev => [newLog, ...prev]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    addAuditLog('تسجيل الدخول', user.name);
  };
  
  const handleLogout = () => {
    if (currentUser) {
        addAuditLog('تسجيل الخروج');
    }
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard contracts={contracts} />;
      case 'contracts':
        return (
            <ContractsPage 
                contracts={contracts} 
                setContracts={setContracts} 
                addAuditLog={addAuditLog}
                currentUser={currentUser}
                contractTypes={contractTypes}
                setContractTypes={setContractTypes}
            />
        );
      case 'reports':
        return <ReportsPage contracts={contracts} contractTypes={contractTypes} />;
      case 'settings':
        return (
            <SettingsPage 
                users={users} 
                setUsers={setUsers} 
                auditLog={auditLog} 
                addAuditLog={addAuditLog}
                currentUser={currentUser}
                contractTypes={contractTypes}
                setContractTypes={setContractTypes}
            />
        );
      default:
        return <Dashboard contracts={contracts} />;
    }
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4 font-sans">
              <div className="relative">
                 <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                 <div className="absolute top-0 left-0 w-16 h-16 border-4 border-slate-700 border-b-transparent rounded-full animate-pulse"></div>
              </div>
              <div className="text-center">
                  <h3 className="font-bold text-xl font-reem-ink text-amber-500 mb-1">محرر عقود</h3>
                  <p className="text-sm text-slate-400">جاري تحميل قاعدة البيانات والموارد...</p>
              </div>
          </div>
      );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-900 flex flex-col">
      <Header 
        userName={currentUser.name} 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto">
            {renderPage()}
        </div>
      </main>
      
      <footer className="bg-slate-900 text-slate-300 border-t-4 border-amber-600 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
                {/* Office Info */}
                <div>
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                         <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-amber-500">
                             <i className="bi bi-pen-fill text-xl"></i>
                         </div>
                         <div>
                             <h3 className="text-white font-bold text-lg font-reem-ink leading-none">محرر عقود</h3>
                             <span className="text-xs text-slate-400">فتحي عبد الجواد</span>
                         </div>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-4 font-lateef text-xl">
                        منظومة أرشفة إلكترونية متكاملة لتوثيق وإدارة العقود الرسمية بمهنية وأمان عالي، مع ضمان حفظ الحقوق وسهولة الاسترجاع.
                    </p>
                </div>

                {/* Quick Links / System Status */}
                <div className="flex flex-col items-center md:items-start md:pr-8">
                    <h3 className="text-white font-bold text-lg mb-4 relative inline-block">
                        حالة النظام
                        <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-amber-600 rounded-full"></span>
                    </h3>
                    <div className="text-sm text-slate-400 space-y-3 w-full max-w-xs">
                        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-800">
                            <span className="flex items-center gap-2"><i className="bi bi-shield-check text-emerald-500"></i> الأمان</span>
                            <span className="text-emerald-500 font-bold text-xs">محمي</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-800">
                            <span className="flex items-center gap-2"><i className="bi bi-database-check text-blue-500"></i> قاعدة البيانات</span>
                            <span className="text-blue-500 font-bold text-xs">متصلة (SQLite)</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-slate-800">
                            <span className="flex items-center gap-2"><i className="bi bi-hdd-network text-amber-500"></i> التخزين</span>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                    saveStatus === 'saving' ? 'bg-amber-500 animate-ping' : 
                                    saveStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}></span>
                                <span className={`${
                                    saveStatus === 'saving' ? 'text-amber-500' : 
                                    saveStatus === 'error' ? 'text-rose-500' : 'text-emerald-500'
                                } font-bold text-xs`}>
                                    {saveStatus === 'saving' ? 'جاري الحفظ...' : 
                                     saveStatus === 'error' ? 'خطأ في الحفظ' : 'تم الحفظ'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Developer Info */}
                <div className="flex flex-col items-center md:items-end">
                    <h3 className="text-white font-bold text-lg mb-4 relative inline-block">
                        الدعم الفني والتطوير
                        <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-amber-600 rounded-full"></span>
                    </h3>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700 shadow-lg w-full max-w-xs">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700">
                            <span className="text-slate-400 text-xs font-bold uppercase">تنفيذ وبرمجة</span>
                            <i className="bi bi-code-slash text-amber-500 text-lg"></i>
                        </div>
                        <div className="text-center mb-4">
                            <p className="text-2xl font-bold text-white tracking-wider font-reem-ink">3bdo</p>
                            <p className="text-xs text-slate-500">Full Stack Developer</p>
                        </div>
                        <a href="tel:0928102731" className="flex items-center justify-center gap-2 bg-amber-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20">
                            <i className="bi bi-telephone-fill animate-tada"></i>
                            <span dir="ltr">092-8102731</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-slate-800 mt-10 pt-6 text-center flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500 font-medium">
                <p>© {new Date().getFullYear()} جميع الحقوق محفوظة لمكتب محرر عقود فتحي عبد الجواد.</p>
                <p className="flex items-center gap-1">
                    Made with <i className="bi bi-heart-fill text-rose-600 animate-pulse"></i> in Libya
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

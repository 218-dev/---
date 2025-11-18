
import React, { useState } from 'react';
import { Page } from '../types';

interface HeaderProps {
    userName: string;
    onNavigate: (page: Page) => void;
    currentPage: Page;
    onLogout: () => void;
}

const NavItem: React.FC<{ 
    page: Page; 
    label: string; 
    icon: string; 
    currentPage: Page; 
    onClick: (page: Page) => void 
}> = ({ page, label, icon, currentPage, onClick }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onClick(page)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-bold ${
                isActive 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
        >
            <i className={`bi ${icon} text-lg`}></i>
            <span>{label}</span>
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ userName, onNavigate, currentPage, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavClick = (page: Page) => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-amber-900/20">
                             <i className="bi bi-pen-fill text-xl"></i>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold font-reem-ink text-amber-500 leading-none">محرر عقود</h1>
                            <h2 className="text-sm font-bold text-slate-300 leading-none mt-1">فتحي عبد الجواد</h2>
                        </div>
                        <div className="sm:hidden">
                            <h1 className="text-lg font-bold font-reem-ink text-amber-500">محرر عقود</h1>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        <NavItem page="dashboard" label="لوحة التحكم" icon="bi-speedometer2" currentPage={currentPage} onClick={handleNavClick} />
                        <NavItem page="contracts" label="إدارة العقود" icon="bi-journal-text" currentPage={currentPage} onClick={handleNavClick} />
                        <NavItem page="reports" label="التقارير" icon="bi-graph-up-arrow" currentPage={currentPage} onClick={handleNavClick} />
                        <NavItem page="settings" label="الإعدادات" icon="bi-sliders" currentPage={currentPage} onClick={handleNavClick} />
                    </nav>

                    {/* User Profile & Logout (Desktop) */}
                    <div className="hidden md:flex items-center gap-4 border-r border-slate-700 pr-4 mr-2">
                        <div className="text-left hidden lg:block">
                            <p className="text-sm font-bold text-white">{userName}</p>
                            <p className="text-xs text-emerald-400 font-medium flex items-center justify-end gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                متصل
                            </p>
                        </div>
                        <button 
                            onClick={onLogout}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors" 
                            title="تسجيل الخروج"
                        >
                            <i className="bi bi-box-arrow-left text-xl"></i>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                    >
                        <i className={`bi ${isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'} text-2xl`}></i>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-800 border-t border-slate-700 animate-in slide-in-from-top-5 duration-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <button 
                            onClick={() => handleNavClick('dashboard')} 
                            className={`block w-full text-right px-3 py-2 rounded-md text-base font-bold ${currentPage === 'dashboard' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <i className="bi bi-speedometer2 ml-2"></i> لوحة التحكم
                        </button>
                        <button 
                            onClick={() => handleNavClick('contracts')} 
                            className={`block w-full text-right px-3 py-2 rounded-md text-base font-bold ${currentPage === 'contracts' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <i className="bi bi-journal-text ml-2"></i> إدارة العقود
                        </button>
                        <button 
                            onClick={() => handleNavClick('reports')} 
                            className={`block w-full text-right px-3 py-2 rounded-md text-base font-bold ${currentPage === 'reports' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <i className="bi bi-graph-up-arrow ml-2"></i> التقارير
                        </button>
                        <button 
                            onClick={() => handleNavClick('settings')} 
                            className={`block w-full text-right px-3 py-2 rounded-md text-base font-bold ${currentPage === 'settings' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <i className="bi bi-sliders ml-2"></i> الإعدادات
                        </button>
                        
                        <div className="border-t border-slate-700 my-2 pt-2">
                            <div className="flex items-center px-3 py-2">
                                <div className="ml-3">
                                    <div className="text-base font-medium leading-none text-white">{userName}</div>
                                    <div className="text-sm font-medium leading-none text-slate-400 mt-1">مدير النظام</div>
                                </div>
                            </div>
                            <button 
                                onClick={onLogout}
                                className="block w-full text-right px-3 py-2 rounded-md text-base font-bold text-rose-400 hover:bg-slate-700 hover:text-rose-300"
                            >
                                <i className="bi bi-box-arrow-left ml-2"></i> تسجيل الخروج
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;

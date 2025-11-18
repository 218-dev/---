import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  users: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users }) => {
  const [selectedPhone, setSelectedPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const activeUsers = users.filter(u => u.status === 'نشط');

  // Set initial selected user if available
  useEffect(() => {
      if (activeUsers.length > 0 && !selectedPhone) {
          setSelectedPhone(activeUsers[0].phone);
      }
  }, [activeUsers, selectedPhone]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.phone === selectedPhone && u.password === password && u.status === 'نشط');
    if (user) {
      setError('');
      onLogin(user);
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  // Keypad handlers
  const handleNumClick = (num: string) => {
    if (password.length < 20) {
        setPassword(prev => prev + num);
        setError('');
    }
  };

  const handleBackspace = () => {
      setPassword(prev => prev.slice(0, -1));
  };

  // Corrected for RTL: pr-10, right-3
  const inputClasses = "peer w-full py-2.5 px-4 pr-10 bg-slate-50 border border-slate-300 rounded-lg focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all text-slate-900 placeholder-slate-400 outline-none appearance-none text-center font-bold tracking-wider text-sm";
  const iconClasses = "bi absolute right-3 top-3 text-slate-400 peer-focus:text-amber-600 transition-colors pointer-events-none text-base";

  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col justify-center items-center font-sans relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-900 shadow-2xl z-0"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl z-0"></div>
      
      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        <div className="bg-slate-900 p-5 text-center border-b-4 border-amber-600 shrink-0">
             <h1 className="text-2xl font-bold text-slate-200 mb-0.5 font-reem-ink">محرر عقود</h1>
             <h2 className="text-3xl font-bold text-amber-500 font-reem-ink">فتحي عبد الجواد</h2>
        </div>
        
        <div className="p-5 flex-1 flex flex-col justify-center">
            <h3 className="text-base font-bold text-center mb-4 text-slate-800 flex items-center justify-center gap-2">
                <i className="bi bi-shield-lock-fill text-amber-600"></i>
                تسجيل الدخول
            </h3>
            <form onSubmit={handleLogin} className="space-y-3">
            <div>
                <div className="relative">
                     <select
                        value={selectedPhone}
                        onChange={(e) => setSelectedPhone(e.target.value)}
                        className={inputClasses}
                        required
                     >
                        {activeUsers.length === 0 && <option value="" disabled>لا يوجد مستخدمين</option>}
                        {activeUsers.map(user => (
                            <option key={user.id} value={user.phone}>
                                {user.name}
                            </option>
                        ))}
                     </select>
                    <i className={`${iconClasses} bi-person-badge`}></i>
                    <i className="bi bi-chevron-down absolute left-3 top-3.5 text-[10px] text-slate-500 pointer-events-none"></i>
                </div>
            </div>
            <div>
                <div className="relative">
                  <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClasses}
                      placeholder="كلمة المرور"
                      dir="ltr"
                      readOnly 
                  />
                  <i className={`${iconClasses} bi-lock`}></i>
                </div>
            </div>

            {/* Numeric Keypad - Compact */}
            <div className="grid grid-cols-3 gap-1.5 mt-1" dir="ltr">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => handleNumClick(num.toString())}
                        className="h-10 bg-slate-100 rounded font-bold text-lg text-slate-700 hover:bg-slate-200 hover:text-amber-600 transition-colors shadow-sm border border-slate-200 active:scale-95 active:bg-slate-300"
                    >
                        {num}
                    </button>
                ))}
                <div className="h-10"></div> {/* Spacer */}
                <button
                    type="button"
                    onClick={() => handleNumClick('0')}
                    className="h-10 bg-slate-100 rounded font-bold text-lg text-slate-700 hover:bg-slate-200 hover:text-amber-600 transition-colors shadow-sm border border-slate-200 active:scale-95 active:bg-slate-300"
                >
                    0
                </button>
                <button
                    type="button"
                    onClick={handleBackspace}
                    className="h-10 bg-rose-50 rounded font-bold text-lg text-rose-600 hover:bg-rose-100 transition-colors shadow-sm border border-rose-100 active:scale-95 active:bg-rose-200 flex items-center justify-center"
                >
                    <i className="bi bi-backspace"></i>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-2 text-xs rounded flex items-center gap-2 justify-center font-bold animate-pulse">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>{error}</span>
                </div>
            )}
            <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 mt-2 active:scale-95 border-b-4 border-slate-950 active:border-b-0 active:translate-y-1"
            >
                <span>دخول للنظام</span>
                <i className="bi bi-box-arrow-in-left"></i>
            </button>
            </form>
        </div>
        <div className="bg-slate-50 p-2 text-center border-t border-slate-100 shrink-0">
            <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                تصميم وتنفيذ <span className="font-bold text-slate-600">3bdo</span> 
                <span dir="ltr" className="text-amber-600 font-mono">092-8102731</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
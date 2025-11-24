import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, ShoppingCart, Package, History, Settings } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
  const navItems = [
    { id: 'cashier', label: '收银台', icon: ShoppingCart },
    { id: 'inventory', label: '商品库', icon: Package },
    { id: 'history', label: '销售记录', icon: History },
    { id: 'stats', label: '经营分析', icon: LayoutDashboard },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Header - Modern & Clean */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg transform hover:scale-105 transition-transform duration-200">
            C
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">CloudCashier</h1>
            <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">云收银 AI</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          系统运行中
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>

      {/* Navigation Bar - Floating style on Mobile, Clean on Desktop */}
      <nav className="bg-white border-t border-slate-200 shrink-0 pb-safe safe-area-bottom z-20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ViewState)}
                className={`group flex flex-col items-center justify-center w-14 sm:w-16 h-full transition-all duration-300 relative`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <span className="absolute top-2 w-12 h-12 bg-indigo-50 rounded-2xl -z-10 transition-all duration-300 animate-in zoom-in-90" />
                )}
                
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'text-indigo-600 -translate-y-1' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold transition-all duration-300 ${isActive ? 'text-indigo-600 opacity-100' : 'text-slate-400 opacity-0 h-0 overflow-hidden group-hover:opacity-70 group-hover:h-auto'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
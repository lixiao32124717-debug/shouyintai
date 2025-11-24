import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CashierView } from './components/CashierView';
import { InventoryView } from './components/InventoryView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { Product, Transaction, ViewState, AppSettings } from './types';
import { getProducts, saveProduct, deleteProduct, getTransactions, saveTransaction, getSettings, initSupabase } from './services/db';
import { History, FileJson, Clock, CreditCard, QrCode, Banknote, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('cashier');
  const [isLoading, setIsLoading] = useState(true);
  
  // App State
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Initialization
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      // Init Cloud if enabled
      initSupabase(settings);
      
      // Fetch Data
      const [loadedProducts, loadedTransactions] = await Promise.all([
        getProducts(settings),
        getTransactions(settings)
      ]);

      setProducts(loadedProducts);
      setTransactions(loadedTransactions);
      setIsLoading(false);
    };

    initData();
  }, [settings.useCloud, settings.supabaseUrl, settings.supabaseKey]); // Re-run when settings change

  const handleSettingsUpdate = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // Effect will trigger reload
  };

  const handleCompleteTransaction = async (transaction: Transaction) => {
    // Optimistic update
    setTransactions(prev => [transaction, ...prev]);
    await saveTransaction(settings, transaction);
  };

  const handleAddProduct = async (product: Product) => {
    // Optimistic update
    setProducts(prev => [...prev, product]);
    await saveProduct(settings, product);
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await deleteProduct(settings, id);
  };

  const handleUpdateProduct = async (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    await saveProduct(settings, product);
  };

  // Simple View for History (Inline for simplicity)
  const HistoryView = () => (
    <div className="h-full bg-slate-50 p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">销售记录</h2>
          <p className="text-slate-500 mt-1">查看所有历史交易详情</p>
        </div>
        
        <button 
          className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-indigo-600 transition-all shadow-sm font-medium text-sm"
          onClick={() => {
             const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions));
             const downloadAnchorNode = document.createElement('a');
             downloadAnchorNode.setAttribute("href",     dataStr);
             downloadAnchorNode.setAttribute("download", "sales_history.json");
             document.body.appendChild(downloadAnchorNode);
             downloadAnchorNode.click();
             downloadAnchorNode.remove();
          }}
        >
          <FileJson size={18} />
          导出数据 (JSON)
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">交易时间</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">商品明细</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">支付方式</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">总金额</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                      <Clock size={14} className="text-slate-400" />
                      {new Date(t.timestamp).toLocaleString('zh-CN')}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      {t.items.map((i, idx) => (
                        <span key={idx} className="text-sm text-slate-800">
                          {i.name} <span className="text-slate-400">x{i.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-5">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border
                       ${t.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                         t.paymentMethod === 'qr' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-violet-50 text-violet-700 border-violet-100'}
                     `}>
                       {t.paymentMethod === 'cash' ? <Banknote size={12} /> : t.paymentMethod === 'qr' ? <QrCode size={12} /> : <CreditCard size={12} />}
                       {t.paymentMethod === 'cash' ? '现金' : t.paymentMethod === 'qr' ? '扫码' : '刷卡'}
                     </span>
                  </td>
                  <td className="p-5 text-right">
                    <span className="font-bold text-slate-900 text-lg">¥{t.totalAmount.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                       <History size={40} className="opacity-30" />
                       <p>暂无销售记录</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
        <Loader2 size={48} className="animate-spin text-indigo-600" />
        <p className="font-medium animate-pulse">正在同步数据...</p>
      </div>
    );
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {currentView === 'cashier' && (
        <CashierView products={products} onCompleteTransaction={handleCompleteTransaction} />
      )}
      {currentView === 'inventory' && (
        <InventoryView 
          products={products} 
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateProduct={handleUpdateProduct}
        />
      )}
      {currentView === 'stats' && (
        <StatsView transactions={transactions} products={products} />
      )}
      {currentView === 'history' && <HistoryView />}
      {currentView === 'settings' && (
        <SettingsView settings={settings} onSave={handleSettingsUpdate} />
      )}
    </Layout>
  );
};

export default App;
import React, { useState, useMemo } from 'react';
import { Product, CartItem, Transaction } from '../types';
import { Plus, Minus, Trash2, Search, CreditCard, Banknote, QrCode, ShoppingBag } from 'lucide-react';

interface CashierViewProps {
  products: Product[];
  onCompleteTransaction: (transaction: Transaction) => void;
}

// Helper to generate a consistent color based on string
const stringToColor = (str: string) => {
  const colors = [
    'bg-red-100 text-red-600', 'bg-orange-100 text-orange-600', 'bg-amber-100 text-amber-600',
    'bg-green-100 text-green-600', 'bg-emerald-100 text-emerald-600', 'bg-teal-100 text-teal-600',
    'bg-cyan-100 text-cyan-600', 'bg-sky-100 text-sky-600', 'bg-blue-100 text-blue-600',
    'bg-indigo-100 text-indigo-600', 'bg-violet-100 text-violet-600', 'bg-purple-100 text-purple-600',
    'bg-fuchsia-100 text-fuchsia-600', 'bg-pink-100 text-pink-600', 'bg-rose-100 text-rose-600'
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const CashierView: React.FC<CashierViewProps> = ({ products, onCompleteTransaction }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['全部', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === '全部' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartProfit = cart.reduce((sum, item) => sum + ((item.price - item.cost) * item.quantity), 0);

  const handleCheckout = (method: 'cash' | 'card' | 'qr') => {
    if (cart.length === 0) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      items: [...cart],
      totalAmount: cartTotal,
      totalProfit: cartProfit,
      paymentMethod: method,
    };

    onCompleteTransaction(transaction);
    setCart([]);
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-50">
      {/* Left Side: Product Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Search & Filter Header */}
        <div className="bg-white/80 backdrop-blur-sm p-4 z-10 space-y-4 sticky top-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="搜索商品..."
              className="w-full pl-11 pr-4 py-3 bg-slate-100 border-transparent border-2 focus:bg-white focus:border-indigo-500 rounded-xl outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${selectedCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group bg-white p-3 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)] border border-slate-100 hover:border-indigo-200 transition-all duration-300 flex flex-col items-start text-left relative overflow-hidden active:scale-95"
              >
                <div className={`w-full aspect-[4/3] rounded-xl mb-3 flex items-center justify-center text-3xl font-bold transition-colors ${stringToColor(product.name)}`}>
                  {product.name.charAt(0)}
                </div>
                <h3 className="font-bold text-slate-700 line-clamp-1 w-full group-hover:text-indigo-700 transition-colors">{product.name}</h3>
                <p className="text-slate-400 text-xs mb-2">{product.category}</p>
                <div className="w-full flex items-center justify-between mt-auto">
                  <p className="text-lg font-extrabold text-indigo-600">¥{product.price.toFixed(2)}</p>
                  <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                    <Plus size={18} strokeWidth={3} />
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-fade-in">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="opacity-50" />
              </div>
              <p className="font-medium">未找到相关商品</p>
              <button onClick={() => {setSearchQuery(''); setSelectedCategory('全部')}} className="mt-2 text-indigo-500 text-sm hover:underline">
                清除筛选
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Cart Sidebar */}
      <div className="w-full md:w-[400px] bg-white flex flex-col shadow-2xl z-30 h-[50%] md:h-full relative">
        {/* Cart Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" size={22} />
            <h2 className="font-bold text-lg text-slate-800">当前订单</h2>
          </div>
          <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
            {cart.reduce((acc, item) => acc + item.quantity, 0)} 件商品
          </span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
                <ShoppingBag size={40} className="text-slate-300" />
              </div>
              <p className="font-medium">购物车还是空的</p>
              <p className="text-xs text-slate-400 max-w-[200px] text-center">点击左侧商品列表添加商品到订单中</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="group bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all flex flex-col gap-2">
                <div className="flex justify-between items-start">
                   <div>
                      <h4 className="font-bold text-slate-800">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">单价 ¥{item.price.toFixed(2)}</p>
                   </div>
                   <div className="text-right">
                      <span className="font-bold text-indigo-600">
                        ¥{(item.price * item.quantity).toFixed(2)}
                      </span>
                   </div>
                </div>
                
                <div className="flex items-center justify-between mt-1 bg-slate-50 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-md bg-white shadow text-slate-600 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                  >
                    {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                  </button>
                  <span className="font-bold text-slate-700 text-sm">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-md bg-white shadow text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Section */}
        <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] z-10">
          <div className="flex justify-between items-end mb-6">
            <span className="text-slate-500 text-sm font-medium">订单总计</span>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">¥{cartTotal.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <button 
              disabled={cart.length === 0}
              onClick={() => handleCheckout('cash')}
              className="group flex flex-col items-center justify-center py-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-200 disabled:opacity-50 disabled:hover:shadow-none transition-all duration-300"
            >
              <Banknote size={24} className="mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">现金支付</span>
            </button>
            <button 
              disabled={cart.length === 0}
              onClick={() => handleCheckout('qr')}
              className="group flex flex-col items-center justify-center py-3.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:hover:shadow-none transition-all duration-300"
            >
              <QrCode size={24} className="mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">扫码支付</span>
            </button>
            <button 
              disabled={cart.length === 0}
              onClick={() => handleCheckout('card')}
              className="group flex flex-col items-center justify-center py-3.5 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-500 hover:text-white hover:border-violet-500 hover:shadow-lg hover:shadow-violet-200 disabled:opacity-50 disabled:hover:shadow-none transition-all duration-300"
            >
              <CreditCard size={24} className="mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">刷卡支付</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
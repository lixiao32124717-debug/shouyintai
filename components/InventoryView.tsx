import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Edit2, Trash2, X, Check, Tag } from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (p: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  products, onAddProduct, onDeleteProduct, onUpdateProduct 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('');

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setName(product.name);
      setPrice(product.price.toString());
      setCost(product.cost.toString());
      setCategory(product.category);
    } else {
      setEditingId(null);
      setName('');
      setPrice('');
      setCost('');
      setCategory('饮品');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: editingId || Date.now().toString(),
      name,
      price: parseFloat(price) || 0,
      cost: parseFloat(cost) || 0,
      category,
    };

    if (editingId) {
      onUpdateProduct(newProduct);
    } else {
      onAddProduct(newProduct);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col p-4 md:p-8 overflow-hidden">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">商品库存</h2>
          <p className="text-slate-500 mt-1">管理您的产品目录和定价策略</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 font-semibold"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">添加商品</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-5 font-bold text-slate-600 border-b border-slate-200 text-sm uppercase tracking-wider">商品名称</th>
                <th className="p-5 font-bold text-slate-600 border-b border-slate-200 text-sm uppercase tracking-wider">分类</th>
                <th className="p-5 font-bold text-slate-600 border-b border-slate-200 text-sm uppercase tracking-wider">销售价格</th>
                <th className="p-5 font-bold text-slate-600 border-b border-slate-200 text-sm uppercase tracking-wider">成本价格</th>
                <th className="p-5 font-bold text-slate-600 border-b border-slate-200 text-sm uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product, idx) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5 font-semibold text-slate-800">{product.name}</td>
                  <td className="p-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                      <Tag size={12} />
                      {product.category}
                    </span>
                  </td>
                  <td className="p-5 font-medium text-indigo-600">¥{product.price.toFixed(2)}</td>
                  <td className="p-5 text-slate-500 font-mono text-sm">¥{product.cost.toFixed(2)}</td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(product)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                         <Plus size={32} className="opacity-30" />
                      </div>
                      <p>库存空空如也</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in transform transition-all scale-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-xl text-slate-800">
                {editingId ? '编辑商品' : '新增商品'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">商品名称</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="例如：拿铁咖啡"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">销售价格</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">¥</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">成本价格</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">¥</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={cost}
                      onChange={e => setCost(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">分类</label>
                <input
                  required
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                  list="categories"
                  placeholder="选择或输入分类"
                />
                <datalist id="categories">
                  <option value="饮品" />
                  <option value="食品" />
                  <option value="零食" />
                  <option value="服务" />
                </datalist>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold flex justify-center items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  <Check size={20} />
                  保存商品
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { Transaction, Product } from '../types';
import { generateBusinessInsight } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Sparkles, TrendingUp, DollarSign, ShoppingBag, ArrowRight } from 'lucide-react';

interface StatsViewProps {
  transactions: Transaction[];
  products: Product[];
}

export const StatsView: React.FC<StatsViewProps> = ({ transactions, products }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Calculate high-level stats
  const stats = useMemo(() => {
    const totalRev = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const totalProf = transactions.reduce((acc, t) => acc + t.totalProfit, 0);
    const count = transactions.length;
    return { totalRev, totalProf, count };
  }, [transactions]);

  // Prepare chart data (Last 7 days)
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    return last7Days.map(date => {
      const dayStart = date.getTime();
      const dayEnd = dayStart + 86400000;
      const dayTrans = transactions.filter(t => t.timestamp >= dayStart && t.timestamp < dayEnd);
      
      return {
        name: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        revenue: dayTrans.reduce((acc, t) => acc + t.totalAmount, 0),
        profit: dayTrans.reduce((acc, t) => acc + t.totalProfit, 0),
      };
    });
  }, [transactions]);

  const handleGenerateInsight = async () => {
    setIsLoadingAi(true);
    setAiInsight(null);
    const insight = await generateBusinessInsight(transactions, products);
    setAiInsight(insight);
    setIsLoadingAi(false);
  };

  return (
    <div className="h-full bg-slate-50 p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">经营仪表盘</h2>
        <p className="text-slate-500 mt-1">实时查看您的业务表现</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">总收入</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">¥{stats.totalRev.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">总利润</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">¥{stats.totalProf.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 shadow-inner">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">订单数</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.count}</p>
          </div>
        </div>
      </div>

      {/* AI Insight Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-8 text-white mb-8 shadow-xl shadow-indigo-200 relative overflow-hidden">
        {/* Decorational circles */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10 gap-4">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-300 fill-yellow-300" />
              AI 智能商业顾问
            </h3>
            <p className="text-indigo-100 mt-2 max-w-xl leading-relaxed opacity-90">
              基于 Gemini AI 模型，深度分析您的销售数据，为您提供每日经营洞察和增长建议。
            </p>
          </div>
          <button
            onClick={handleGenerateInsight}
            disabled={isLoadingAi}
            className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100 flex items-center gap-2 whitespace-nowrap"
          >
            {isLoadingAi ? (
              <>
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                正在分析数据...
              </>
            ) : (
              <>
                生成今日报告
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {aiInsight && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-fade-in relative z-10 shadow-inner">
            <div className="prose prose-invert prose-lg max-w-none">
              {aiInsight.split('\n').map((line, i) => (
                <p key={i} className="mb-3 last:mb-0 text-indigo-50 font-medium leading-relaxed">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
          <div className="mb-6 flex items-center gap-2">
             <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
             <h4 className="font-bold text-slate-800 text-lg">近7日收入趋势</h4>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} tickFormatter={(val) => `¥${val}`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }} 
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} name="收入" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
          <div className="mb-6 flex items-center gap-2">
             <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
             <h4 className="font-bold text-slate-800 text-lg">近7日利润趋势</h4>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} tickFormatter={(val) => `¥${val}`} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{r: 6, strokeWidth: 4, stroke: '#fff', fill: '#10b981'}} 
                  activeDot={{r: 8, strokeWidth: 0, fill: '#10b981'}}
                  name="利润" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
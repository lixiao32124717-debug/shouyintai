import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { saveSettings, initSupabase } from '../services/db';
import { Save, Cloud, CloudOff, Database, CheckCircle, AlertCircle } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings: initialSettings, onSave }) => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (field: keyof AppSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setStatus('idle');
  };

  const handleSave = () => {
    saveSettings(settings);
    if (settings.useCloud) {
      const success = initSupabase(settings);
      setStatus(success ? 'success' : 'error');
    } else {
      setStatus('success');
    }
    onSave(settings);
  };

  return (
    <div className="h-full bg-slate-50 p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">系统设置</h2>
        <p className="text-slate-500 mt-1">配置云端同步与数据存储</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Database size={20} className="text-indigo-600" />
              云端数据库连接
            </h3>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${settings.useCloud ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {settings.useCloud ? <Cloud size={12} /> : <CloudOff size={12} />}
              {settings.useCloud ? '云端模式' : '本地模式'}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold">启用云端同步</label>
              <button 
                onClick={() => handleChange('useCloud', !settings.useCloud)}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${settings.useCloud ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${settings.useCloud ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {settings.useCloud && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Supabase Project URL</label>
                  <input
                    type="text"
                    value={settings.supabaseUrl}
                    onChange={e => handleChange('supabaseUrl', e.target.value)}
                    placeholder="https://xyz.supabase.co"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Supabase Anon Key</label>
                  <input
                    type="password"
                    value={settings.supabaseKey}
                    onChange={e => handleChange('supabaseKey', e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                <Save size={20} />
                保存配置
              </button>
              
              {status === 'success' && (
                <div className="mt-3 flex items-center justify-center gap-2 text-green-600 text-sm font-bold animate-fade-in">
                  <CheckCircle size={16} /> 配置已保存
                </div>
              )}
              {status === 'error' && (
                <div className="mt-3 flex items-center justify-center gap-2 text-red-500 text-sm font-bold animate-fade-in">
                  <AlertCircle size={16} /> 连接失败，请检查 URL 和 Key
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-blue-900">
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <AlertCircle size={20} />
              如何实现多端同步？
            </h4>
            <p className="text-sm leading-relaxed opacity-80 mb-4">
              为了在手机和电脑之间同步数据，你需要一个云端数据库。我们支持 <strong>Supabase</strong>（免费、快速）。
            </p>
            <ol className="list-decimal list-inside text-sm space-y-2 font-medium opacity-90">
              <li>访问 <a href="https://supabase.com" target="_blank" className="underline hover:text-blue-600">Supabase.com</a> 并注册账号。</li>
              <li>创建一个新项目（Project）。</li>
              <li>在项目设置 (Project Settings) &rarr; API 中找到 <code>URL</code> 和 <code>anon public key</code>。</li>
              <li>将它们复制到左侧的输入框中并开启“启用云端同步”。</li>
              <li><strong>重要：</strong>在 Supabase 的 SQL Editor 中运行下方的建表代码。</li>
            </ol>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-slate-300 font-mono text-xs overflow-hidden relative group">
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-400">SQL Code</span>
             </div>
             <pre className="overflow-x-auto custom-scrollbar">
{`-- 创建商品表
create table products (
  id text primary key,
  name text,
  price numeric,
  cost numeric,
  category text
);

-- 创建交易表
create table transactions (
  id text primary key,
  timestamp bigint,
  items jsonb,
  "totalAmount" numeric,
  "totalProfit" numeric,
  "paymentMethod" text
);

-- 允许公开读写 (仅用于演示，生产环境请设置 RLS)
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table transactions;`}
             </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
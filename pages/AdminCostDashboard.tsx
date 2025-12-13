import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface CostRow {
  d: string;
  service: 'llm' | 'embedding' | 'tts' | 'stt' | string;
  requests: number;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
}

export const AdminCostDashboard: React.FC = () => {
  const { language } = useLanguage();
  const [rows, setRows] = useState<CostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('vision_coach_token') || '';
        const api = import.meta.env.VITE_API_URL;
        const res = await fetch(`${api}/api/admin/cost-summary`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed');
        setRows(data.rows || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = rows.reduce(
    (acc, r) => {
      acc.requests += r.requests;
      acc.tokens_in += r.tokens_in;
      acc.tokens_out += r.tokens_out;
      acc.cost_usd += r.cost_usd;
      return acc;
    },
    { requests: 0, tokens_in: 0, tokens_out: 0, cost_usd: 0 }
  );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{language === 'vi' ? 'Tổng quan chi phí & hiệu năng (30 ngày)' : 'Cost & Performance Overview (30 days)'}</h1>
      {loading && <div className="text-gray-500">{language === 'vi' ? 'Đang tải...' : 'Loading...'}</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500">{language === 'vi' ? 'Lượt gọi' : 'Requests'}</div>
              <div className="text-lg font-bold">{total.requests.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500">Tokens In</div>
              <div className="text-lg font-bold">{total.tokens_in.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500">Tokens Out</div>
              <div className="text-lg font-bold">{total.tokens_out.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500">Cost (USD)</div>
              <div className="text-lg font-bold">${total.cost_usd.toFixed(4)}</div>
            </div>
          </div>
          <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Service</th>
                  <th className="px-3 py-2 text-right">Requests</th>
                  <th className="px-3 py-2 text-right">Tokens In</th>
                  <th className="px-3 py-2 text-right">Tokens Out</th>
                  <th className="px-3 py-2 text-right">Cost (USD)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} className={idx % 2 ? 'bg-white dark:bg-gray-900' : ''}>
                    <td className="px-3 py-2">{r.d}</td>
                    <td className="px-3 py-2">{r.service}</td>
                    <td className="px-3 py-2 text-right">{r.requests.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{r.tokens_in.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{r.tokens_out.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">${r.cost_usd.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}


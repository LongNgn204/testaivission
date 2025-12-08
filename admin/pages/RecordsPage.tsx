/**
 * Records Page - Health records management with Excel export
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Filter, Download, Trash2, Eye, RefreshCw,
    ChevronLeft, ChevronRight, FileSpreadsheet, X, Calendar
} from 'lucide-react';
import { adminApi, TestRecord } from '../services/adminApi';
import { useAdmin } from '../index';

export const RecordsPage: React.FC = () => {
    const { user } = useAdmin();
    const [records, setRecords] = useState<TestRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 20;

    // Filters
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<TestRecord | null>(null);

    useEffect(() => {
        if (user?.token) {
            adminApi.setToken(user.token);
            loadRecords();
        }
    }, [user?.token, page]);

    const loadRecords = async () => {
        setIsLoading(true);
        const offset = (page - 1) * pageSize;
        const { records: data, total: t } = await adminApi.getRecords(1000, 0);
        setRecords(data);
        setTotal(t);
        setIsLoading(false);
    };

    // Filtered records
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            if (search) {
                const s = search.toLowerCase();
                if (!r.userName?.toLowerCase().includes(s) &&
                    !r.userId.toLowerCase().includes(s) &&
                    !r.testType.toLowerCase().includes(s)) {
                    return false;
                }
            }
            if (typeFilter !== 'all' && r.testType !== typeFilter) return false;
            if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
            return true;
        });
    }, [records, search, typeFilter, severityFilter]);

    // Paginated records
    const paginatedRecords = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredRecords.slice(start, start + pageSize);
    }, [filteredRecords, page]);

    const totalPages = Math.ceil(filteredRecords.length / pageSize);

    const testTypeLabels: Record<string, string> = {
        snellen: 'Thị lực',
        colorblind: 'Mù màu',
        astigmatism: 'Loạn thị',
        amsler: 'Amsler',
        duochrome: 'Duochrome',
    };

    const severityColors: Record<string, string> = {
        HIGH: 'bg-red-100 text-red-700 border-red-200',
        MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        LOW: 'bg-blue-100 text-blue-700 border-blue-200',
        NORMAL: 'bg-green-100 text-green-700 border-green-200',
    };

    const severityLabels: Record<string, string> = {
        HIGH: 'Cần khám',
        MEDIUM: 'Chú ý',
        LOW: 'Nhẹ',
        NORMAL: 'Bình thường',
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Lọc
                        </button>
                        <button
                            onClick={() => adminApi.exportToExcel(filteredRecords)}
                            disabled={filteredRecords.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-500 hover:to-emerald-500 disabled:opacity-50"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Xuất Excel
                        </button>
                        <button
                            onClick={loadRecords}
                            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        >
                            <option value="all">Tất cả loại test</option>
                            {Object.entries(testTypeLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        <select
                            value={severityFilter}
                            onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        >
                            <option value="all">Tất cả mức độ</option>
                            {Object.entries(severityLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        {(typeFilter !== 'all' || severityFilter !== 'all') && (
                            <button
                                onClick={() => { setTypeFilter('all'); setSeverityFilter('all'); }}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Người dùng</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Loại test</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mức độ</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Phân tích</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ngày</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                        <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-indigo-500" />
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-slate-800">{r.userName || 'N/A'}</p>
                                                <p className="text-xs text-slate-400">{r.userId}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                                                {testTypeLabels[r.testType] || r.testType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${severityColors[r.severity || 'NORMAL']}`}>
                                                {severityLabels[r.severity || 'NORMAL']}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-slate-600 max-w-xs truncate">{r.aiAnalysis}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500">
                                            {new Date(r.timestamp).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedRecord(r)}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                        Hiển thị {paginatedRecords.length} / {filteredRecords.length} hồ sơ
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-slate-600">
                            Trang {page} / {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRecord(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Chi tiết hồ sơ</h3>
                            <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Người dùng</p>
                                <p className="font-medium text-slate-800">{selectedRecord.userName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Loại test</p>
                                <p className="font-medium text-slate-800">{testTypeLabels[selectedRecord.testType]}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Mức độ</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${severityColors[selectedRecord.severity || 'NORMAL']}`}>
                                    {severityLabels[selectedRecord.severity || 'NORMAL']}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Phân tích AI</p>
                                <p className="text-slate-800">{selectedRecord.aiAnalysis}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Ngày kiểm tra</p>
                                <p className="text-slate-800">{new Date(selectedRecord.timestamp).toLocaleString('vi-VN')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Dữ liệu test (JSON)</p>
                                <pre className="mt-1 p-3 bg-slate-100 rounded-lg text-xs overflow-x-auto">
                                    {JSON.stringify(selectedRecord.testData, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecordsPage;

/**
 * =================================================================
 * 📊 AI Report Verifier - Kiểm tra tất cả báo cáo AI
 * =================================================================
 *
 * CHỨC NĂNG:
 * - Xác minh tính chính xác của tất cả AI reports
 * - Kiểm tra các trường bắt buộc (summary, recommendations, severity, confidence)
 * - Hiển thị thống kê và lỗi
 * - Được gọi từ Dashboard hoặc History page
 *
 * CÁCH DÙNG:
 * <AIReportVerifier history={testHistory} />
 */
import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Loader, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { StoredTestResult } from '../types';
import { AIService } from '../services/aiService';

interface VerificationResult {
    verified: number;
    errors: string[];
    isLoading: boolean;
}

export const AIReportVerifier: React.FC<{ history: StoredTestResult[] }> = ({ history }) => {
    const { t, language } = useLanguage();
    const [result, setResult] = useState<VerificationResult>({
        verified: 0,
        errors: [],
        isLoading: false,
    });

    const verifyReports = async () => {
        setResult(prev => ({ ...prev, isLoading: true }));
        try {
            const aiService = new AIService();
            const verification = await aiService.verifyAllReports(history, language);
            setResult({
                verified: verification.verified,
                errors: verification.errors,
                isLoading: false,
            });
        } catch (error) {
            console.error('Verification error:', error);
            setResult({
                verified: 0,
                errors: [language === 'vi' ? 'Lỗi khi kiểm tra báo cáo' : 'Error verifying reports'],
                isLoading: false,
            });
        }
    };

    useEffect(() => {
        if (history.length > 0) {
            verifyReports();
        }
    }, [history]);

    if (history.length === 0) {
        return null;
    }

    const totalReports = history.length;
    const successRate = totalReports > 0 ? (result.verified / totalReports) * 100 : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {language === 'vi' ? '📊 Kiểm tra Báo cáo AI' : '📊 AI Report Verification'}
                </h3>
                <button
                    onClick={verifyReports}
                    disabled={result.isLoading}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title={language === 'vi' ? 'Kiểm tra lại' : 'Verify again'}
                >
                    <RefreshCw size={20} className={result.isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {result.isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader size={24} className="animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {language === 'vi' ? 'Đang kiểm tra...' : 'Verifying...'}
                    </span>
                </div>
            ) : (
                <>
                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {language === 'vi' ? 'Xác minh' : 'Verified'}
                            </p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {result.verified}/{totalReports}
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {language === 'vi' ? 'Tỷ lệ' : 'Success Rate'}
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {successRate.toFixed(0)}%
                            </p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {language === 'vi' ? 'Lỗi' : 'Errors'}
                            </p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {result.errors.length}
                            </p>
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        result.errors.length === 0
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                    }`}>
                        {result.errors.length === 0 ? (
                            <>
                                <CheckCircle size={20} />
                                <span className="font-medium">
                                    {language === 'vi' ? 'Tất cả báo cáo hợp lệ' : 'All reports are valid'}
                                </span>
                            </>
                        ) : (
                            <>
                                <AlertTriangle size={20} />
                                <span className="font-medium">
                                    {language === 'vi' ? `${result.errors.length} báo cáo có vấn đề` : `${result.errors.length} reports have issues`}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Error List */}
                    {result.errors.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                            {result.errors.map((error, idx) => (
                                <div
                                    key={idx}
                                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 text-sm text-red-700 dark:text-red-300"
                                >
                                    ⚠️ {error}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};


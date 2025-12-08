/**
 * =================================================================
 * 🏥 HealthProfile - Comprehensive Health Records Dashboard
 * =================================================================
 *
 * A dashboard showing:
 * - User health profile overview
 * - Summary of detected issues from all tests
 * - AI analysis results and recommendations
 * - Trends and progress over time
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye, Activity, AlertTriangle, CheckCircle2, Clock,
    TrendingUp, TrendingDown, Heart, FileText, Calendar,
    ChevronRight, Shield, Brain, Sparkles, Download, RefreshCw
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { getTestHistory } from '../services/authService';
import { StoredTestResult, TestType } from '../types';

const storageService = new StorageService();

// Types for health profile data
interface IssueItem {
    id: string;
    type: 'warning' | 'info' | 'success';
    testType: TestType;
    title: string;
    description: string;
    date: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface HealthSummary {
    overallStatus: 'GOOD' | 'ATTENTION' | 'CONCERN';
    totalTests: number;
    issuesDetected: number;
    lastTestDate: string | null;
    testsByType: Record<TestType, number>;
    recentIssues: IssueItem[];
    aiRecommendations: string[];
}

// Helper to analyze test results
const analyzeTestResult = (result: StoredTestResult, language: string): IssueItem | null => {
    const testType = result.testType;
    const data = result.resultData;

    switch (testType) {
        case 'snellen': {
            const score = (data as any)?.score || '';
            if (score !== '20/20' && score !== '20/25') {
                return {
                    id: result.id,
                    type: 'warning',
                    testType,
                    title: language === 'vi' ? 'Thị lực cần chú ý' : 'Vision needs attention',
                    description: language === 'vi'
                        ? `Kết quả Snellen: ${score}. Có thể cần điều chỉnh kính.`
                        : `Snellen result: ${score}. May need glasses adjustment.`,
                    date: result.date,
                    severity: score.includes('20/40') || score.includes('20/50') ? 'HIGH' : 'MEDIUM',
                };
            }
            break;
        }
        case 'colorblind': {
            const accuracy = (data as any)?.accuracy || 100;
            if (accuracy < 80) {
                return {
                    id: result.id,
                    type: 'warning',
                    testType,
                    title: language === 'vi' ? 'Khiếm khuyết màu sắc' : 'Color vision deficiency',
                    description: language === 'vi'
                        ? `Độ chính xác: ${accuracy}%. Có thể có một số khó khăn phân biệt màu.`
                        : `Accuracy: ${accuracy}%. May have some difficulty distinguishing colors.`,
                    date: result.date,
                    severity: accuracy < 60 ? 'HIGH' : 'MEDIUM',
                };
            }
            break;
        }
        case 'astigmatism': {
            const severity = (data as any)?.overallSeverity;
            if (severity && severity !== 'NONE') {
                return {
                    id: result.id,
                    type: 'warning',
                    testType,
                    title: language === 'vi' ? 'Phát hiện loạn thị' : 'Astigmatism detected',
                    description: language === 'vi'
                        ? `Mức độ: ${severity}. Nên khám bác sĩ để được tư vấn.`
                        : `Severity: ${severity}. Consider consulting an eye doctor.`,
                    date: result.date,
                    severity: severity === 'SEVERE' ? 'HIGH' : severity === 'MODERATE' ? 'MEDIUM' : 'LOW',
                };
            }
            break;
        }
        case 'amsler': {
            const issueDetected = (data as any)?.issueDetected;
            if (issueDetected) {
                return {
                    id: result.id,
                    type: 'warning',
                    testType,
                    title: language === 'vi' ? 'Vấn đề điểm vàng/võng mạc' : 'Macula/Retina issue',
                    description: language === 'vi'
                        ? 'Phát hiện biến dạng trong lưới Amsler. Nên khám chuyên khoa ngay.'
                        : 'Distortion detected in Amsler grid. Seek specialist examination soon.',
                    date: result.date,
                    severity: 'HIGH',
                };
            }
            break;
        }
        case 'duochrome': {
            const overallResult = (data as any)?.overallResult;
            if (overallResult && overallResult !== 'normal') {
                return {
                    id: result.id,
                    type: 'info',
                    testType,
                    title: language === 'vi' ? 'Độ cận/viễn thị' : 'Myopia/Hyperopia',
                    description: language === 'vi'
                        ? `Kết quả: ${overallResult}. Kiểm tra lại kính hiện tại.`
                        : `Result: ${overallResult}. Check current glasses prescription.`,
                    date: result.date,
                    severity: 'LOW',
                };
            }
            break;
        }
    }
    return null;
};

// Generate AI recommendations based on issues
const generateRecommendations = (issues: IssueItem[], totalTests: number, language: string): string[] => {
    const recommendations: string[] = [];

    if (issues.length === 0 && totalTests > 0) {
        recommendations.push(
            language === 'vi'
                ? '✅ Sức khỏe thị lực của bạn đang tốt! Tiếp tục duy trì thói quen kiểm tra định kỳ.'
                : '✅ Your vision health is good! Continue with regular check-ups.'
        );
    }

    const hasHighSeverity = issues.some(i => i.severity === 'HIGH');
    if (hasHighSeverity) {
        recommendations.push(
            language === 'vi'
                ? '⚠️ Phát hiện vấn đề nghiêm trọng - khuyến nghị đến gặp bác sĩ nhãn khoa trong tuần này.'
                : '⚠️ Serious issue detected - recommend seeing an ophthalmologist this week.'
        );
    }

    const amslerIssues = issues.filter(i => i.testType === 'amsler');
    if (amslerIssues.length > 0) {
        recommendations.push(
            language === 'vi'
                ? '🔴 Vấn đề võng mạc cần được kiểm tra chuyên sâu. Đây là ưu tiên cao.'
                : '🔴 Retinal issues need in-depth examination. This is high priority.'
        );
    }

    if (totalTests < 3) {
        recommendations.push(
            language === 'vi'
                ? '📋 Hãy hoàn thành thêm bài test để có đánh giá toàn diện hơn.'
                : '📋 Complete more tests for a more comprehensive assessment.'
        );
    }

    const colorblindIssues = issues.filter(i => i.testType === 'colorblind');
    if (colorblindIssues.length > 0) {
        recommendations.push(
            language === 'vi'
                ? '🎨 Khiếm khuyết màu sắc là bẩm sinh và không chữa được, nhưng có thể điều chỉnh bằng kính lọc màu đặc biệt.'
                : '🎨 Color blindness is congenital and not curable, but can be adjusted with special filter glasses.'
        );
    }

    recommendations.push(
        language === 'vi'
            ? '👁️ Nghỉ mắt 20 phút sau mỗi 2 giờ làm việc với màn hình.'
            : '👁️ Rest your eyes for 20 minutes after every 2 hours of screen work.'
    );

    return recommendations;
};

export const HealthProfile: React.FC = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { user } = useUser();

    const [history, setHistory] = useState<StoredTestResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load test history
    useEffect(() => {
        const loadHistory = async () => {
            setIsLoading(true);
            try {
                const res = await getTestHistory('', 100, 0);
                if (res.success && res.history) {
                    const mapped = res.history.map((item: any) => ({
                        id: item.id,
                        testType: item.testType as TestType,
                        date: new Date(item.timestamp || Date.now()).toISOString(),
                        resultData: item.testData,
                        report: {
                            id: `report_${item.id}`,
                            testType: item.testType as TestType,
                            timestamp: new Date(item.timestamp || Date.now()).toISOString(),
                            summary: item.report?.summary || '',
                            recommendations: item.report?.recommendations || [],
                            severity: item.report?.severity || 'LOW',
                        },
                    }));
                    setHistory(mapped);
                } else {
                    // Fallback to local
                    setHistory(storageService.getTestHistory());
                }
            } catch (err) {
                setHistory(storageService.getTestHistory());
            } finally {
                setIsLoading(false);
            }
        };
        loadHistory();
    }, []);

    // Compute health summary
    const healthSummary = useMemo((): HealthSummary => {
        const issues: IssueItem[] = [];
        const testsByType: Record<TestType, number> = {
            snellen: 0, colorblind: 0, astigmatism: 0, amsler: 0, duochrome: 0
        };

        // Analyze each result
        history.forEach(result => {
            testsByType[result.testType] = (testsByType[result.testType] || 0) + 1;
            const issue = analyzeTestResult(result, language);
            if (issue) {
                issues.push(issue);
            }
        });

        // Sort issues by severity and date
        issues.sort((a, b) => {
            const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
            if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                return severityOrder[a.severity] - severityOrder[b.severity];
            }
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // Determine overall status
        let overallStatus: HealthSummary['overallStatus'] = 'GOOD';
        if (issues.some(i => i.severity === 'HIGH')) {
            overallStatus = 'CONCERN';
        } else if (issues.some(i => i.severity === 'MEDIUM')) {
            overallStatus = 'ATTENTION';
        }

        // Last test date
        const sortedByDate = [...history].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastTestDate = sortedByDate[0]?.date || null;

        return {
            overallStatus,
            totalTests: history.length,
            issuesDetected: issues.length,
            lastTestDate,
            testsByType,
            recentIssues: issues.slice(0, 5),
            aiRecommendations: generateRecommendations(issues, history.length, language),
        };
    }, [history, language]);

    const statusColors = {
        GOOD: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        ATTENTION: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        CONCERN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    const statusText = {
        GOOD: language === 'vi' ? 'Tốt' : 'Good',
        ATTENTION: language === 'vi' ? 'Cần chú ý' : 'Needs Attention',
        CONCERN: language === 'vi' ? 'Cần khám' : 'Needs Check-up',
    };

    const severityColors = {
        HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        LOW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    };

    const testTypeLabels: Record<TestType, string> = {
        snellen: language === 'vi' ? 'Thị lực' : 'Visual Acuity',
        colorblind: language === 'vi' ? 'Mù màu' : 'Color Blind',
        astigmatism: language === 'vi' ? 'Loạn thị' : 'Astigmatism',
        amsler: language === 'vi' ? 'Lưới Amsler' : 'Amsler Grid',
        duochrome: language === 'vi' ? 'Duochrome' : 'Duochrome',
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto p-6 lg:p-12">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-200">
                        {language === 'vi' ? 'Hồ Sơ Sức Khỏe Thị Lực' : 'Vision Health Profile'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {user?.name || (language === 'vi' ? 'Người dùng' : 'User')} •
                        {language === 'vi' ? ' Cập nhật: ' : ' Updated: '}
                        {healthSummary.lastTestDate
                            ? new Date(healthSummary.lastTestDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')
                            : (language === 'vi' ? 'Chưa có dữ liệu' : 'No data')
                        }
                    </p>
                </div>
                <button
                    onClick={() => navigate('/home/history')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                    <FileText size={18} />
                    {language === 'vi' ? 'Xem chi tiết' : 'View Details'}
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Overall Status */}
                <div className="col-span-2 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${healthSummary.overallStatus === 'GOOD' ? 'bg-green-500' :
                                healthSummary.overallStatus === 'ATTENTION' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                            {healthSummary.overallStatus === 'GOOD' ?
                                <CheckCircle2 className="w-8 h-8 text-white" /> :
                                <AlertTriangle className="w-8 h-8 text-white" />
                            }
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {language === 'vi' ? 'Tình trạng chung' : 'Overall Status'}
                            </p>
                            <p className={`text-2xl font-bold ${healthSummary.overallStatus === 'GOOD' ? 'text-green-600 dark:text-green-400' :
                                    healthSummary.overallStatus === 'ATTENTION' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                                }`}>
                                {statusText[healthSummary.overallStatus]}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total Tests */}
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {language === 'vi' ? 'Tổng bài test' : 'Total Tests'}
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {healthSummary.totalTests}
                    </p>
                </div>

                {/* Issues Detected */}
                <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {language === 'vi' ? 'Vấn đề phát hiện' : 'Issues Detected'}
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {healthSummary.issuesDetected}
                    </p>
                </div>
            </div>

            {/* Test Type Breakdown */}
            <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-500" />
                    {language === 'vi' ? 'Số lượng theo loại test' : 'Tests by Type'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.entries(testTypeLabels).map(([key, label]) => {
                        const count = healthSummary.testsByType[key as TestType] || 0;
                        return (
                            <div key={key} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{count}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Issues List */}
            {healthSummary.recentIssues.length > 0 && (
                <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        {language === 'vi' ? 'Các vấn đề cần lưu ý' : 'Issues to Note'}
                    </h2>
                    <div className="space-y-3">
                        {healthSummary.recentIssues.map((issue) => (
                            <div
                                key={issue.id}
                                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${severityColors[issue.severity]}`}>
                                    {issue.severity}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                                            {issue.title}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            {testTypeLabels[issue.testType]}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {issue.description}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(issue.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Recommendations */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    {language === 'vi' ? 'Đề Xuất Từ AI' : 'AI Recommendations'}
                </h2>
                <ul className="space-y-3">
                    {healthSummary.aiRecommendations.map((rec, index) => (
                        <li
                            key={index}
                            className="p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300"
                        >
                            {rec}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Empty State */}
            {healthSummary.totalTests === 0 && (
                <div className="text-center py-16 mt-8 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'vi' ? 'Chưa có dữ liệu' : 'No Data Yet'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {language === 'vi'
                            ? 'Hoàn thành các bài kiểm tra để xây dựng hồ sơ sức khỏe của bạn.'
                            : 'Complete tests to build your health profile.'}
                    </p>
                    <button
                        onClick={() => navigate('/home')}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        {language === 'vi' ? 'Bắt Đầu Kiểm Tra' : 'Start Testing'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default HealthProfile;

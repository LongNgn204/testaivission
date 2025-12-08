/**
 * Admin API Service - Direct backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vision-coach-worker.stu72511407.workers.dev';

export interface TestRecord {
    id: string;
    userId: string;
    userName?: string;
    testType: string;
    testData: any;
    score?: number;
    result?: string;
    timestamp: string;
    aiAnalysis?: string;
    severity?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
}

export interface UserRecord {
    id: string;
    name: string;
    phone: string;
    age: number;
    created_at: string;
    last_login?: string;
    test_count: number;
}

export interface DashboardStats {
    totalUsers: number;
    totalTests: number;
    todayTests: number;
    activeUsers: number;
    highSeverityCount: number;
    testsByType: Record<string, number>;
    recentActivity: ActivityItem[];
}

export interface ActivityItem {
    id: string;
    type: 'test' | 'login' | 'signup';
    userId: string;
    userName?: string;
    description: string;
    timestamp: string;
}

class AdminApiService {
    private token: string = '';

    setToken(token: string) {
        this.token = token;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.json();
    }

    // Dashboard
    async getStats(): Promise<DashboardStats> {
        try {
            const [historyRes] = await Promise.all([
                this.request<any>('/api/tests/history?limit=1000'),
            ]);

            const records = historyRes.history || [];
            const userIds = new Set(records.map((r: any) => r.userId));
            const testsByType: Record<string, number> = {};
            let highCount = 0;
            const today = new Date().toDateString();
            let todayCount = 0;

            records.forEach((r: any) => {
                testsByType[r.testType] = (testsByType[r.testType] || 0) + 1;
                if (this.analyzeResult(r).severity === 'HIGH') highCount++;
                if (new Date(r.timestamp).toDateString() === today) todayCount++;
            });

            return {
                totalUsers: userIds.size,
                totalTests: records.length,
                todayTests: todayCount,
                activeUsers: Math.min(userIds.size, records.filter((r: any) =>
                    new Date(r.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length),
                highSeverityCount: highCount,
                testsByType,
                recentActivity: records.slice(0, 10).map((r: any) => ({
                    id: r.id,
                    type: 'test',
                    userId: r.userId,
                    description: `Completed ${r.testType} test`,
                    timestamp: r.timestamp,
                })),
            };
        } catch (error) {
            console.error('Failed to get stats:', error);
            return {
                totalUsers: 0,
                totalTests: 0,
                todayTests: 0,
                activeUsers: 0,
                highSeverityCount: 0,
                testsByType: {},
                recentActivity: [],
            };
        }
    }

    // Records
    async getRecords(limit = 100, offset = 0): Promise<{ records: TestRecord[]; total: number }> {
        try {
            const res = await this.request<any>(`/api/tests/history?limit=${limit}&offset=${offset}`);
            const records = (res.history || []).map((r: any) => ({
                ...r,
                ...this.analyzeResult(r),
            }));
            return { records, total: res.total || records.length };
        } catch (error) {
            // Fallback to localStorage
            const localData = localStorage.getItem('vision_test_history');
            if (localData) {
                const parsed = JSON.parse(localData);
                const records = parsed.map((r: any) => ({
                    id: r.id,
                    userId: 'local',
                    userName: 'Local User',
                    testType: r.testType,
                    testData: r.resultData,
                    timestamp: r.date,
                    ...this.analyzeResult({ testType: r.testType, testData: r.resultData }),
                }));
                return { records, total: records.length };
            }
            return { records: [], total: 0 };
        }
    }

    async deleteRecord(recordId: string): Promise<boolean> {
        try {
            await this.request(`/api/tests/${recordId}`, { method: 'DELETE' });
            return true;
        } catch {
            return false;
        }
    }

    // Analyze test result
    analyzeResult(record: any): { severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL'; aiAnalysis: string } {
        const data = record.testData || {};

        switch (record.testType) {
            case 'snellen': {
                const score = data?.score || '';
                if (score.includes('20/40') || score.includes('20/50') || score.includes('20/60')) {
                    return { severity: 'HIGH', aiAnalysis: `Thị lực yếu: ${score}. Cần khám chuyên khoa.` };
                } else if (score !== '20/20' && score !== '20/25' && score) {
                    return { severity: 'MEDIUM', aiAnalysis: `Thị lực: ${score}. Nên kiểm tra kính.` };
                }
                return { severity: 'NORMAL', aiAnalysis: `Thị lực tốt: ${score || 'N/A'}` };
            }
            case 'colorblind': {
                const accuracy = data?.accuracy || 100;
                if (accuracy < 60) {
                    return { severity: 'HIGH', aiAnalysis: `Khiếm khuyết màu nghiêm trọng: ${accuracy}%` };
                } else if (accuracy < 80) {
                    return { severity: 'MEDIUM', aiAnalysis: `Khiếm khuyết màu nhẹ: ${accuracy}%` };
                }
                return { severity: 'NORMAL', aiAnalysis: `Nhận dạng màu tốt: ${accuracy}%` };
            }
            case 'astigmatism': {
                const severity = data?.overallSeverity;
                if (severity === 'SEVERE') return { severity: 'HIGH', aiAnalysis: 'Loạn thị nặng. Cần khám ngay.' };
                if (severity === 'MODERATE') return { severity: 'MEDIUM', aiAnalysis: 'Loạn thị trung bình.' };
                if (severity === 'MILD') return { severity: 'LOW', aiAnalysis: 'Loạn thị nhẹ.' };
                return { severity: 'NORMAL', aiAnalysis: 'Không phát hiện loạn thị.' };
            }
            case 'amsler': {
                if (data?.issueDetected) return { severity: 'HIGH', aiAnalysis: 'Phát hiện vấn đề võng mạc. Ưu tiên khám!' };
                return { severity: 'NORMAL', aiAnalysis: 'Lưới Amsler bình thường.' };
            }
            case 'duochrome': {
                const result = data?.overallResult;
                if (result === 'myopic') return { severity: 'LOW', aiAnalysis: 'Xu hướng cận thị.' };
                if (result === 'hyperopic') return { severity: 'LOW', aiAnalysis: 'Xu hướng viễn thị.' };
                return { severity: 'NORMAL', aiAnalysis: 'Độ kính phù hợp.' };
            }
            default:
                return { severity: 'NORMAL', aiAnalysis: 'Không có phân tích.' };
        }
    }

    // Export to Excel
    exportToExcel(records: TestRecord[], filename = 'health_records') {
        const headers = ['ID', 'User ID', 'User Name', 'Test Type', 'Score', 'Result', 'Severity', 'AI Analysis', 'Date'];

        const rows = records.map(r => [
            r.id,
            r.userId,
            r.userName || 'N/A',
            r.testType,
            r.score ?? 'N/A',
            r.result || 'N/A',
            r.severity || 'NORMAL',
            r.aiAnalysis ? r.aiAnalysis.replace(/"/g, '""') : 'N/A',
            new Date(r.timestamp).toLocaleString(),
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => {
                const str = String(cell);
                return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
            }).join(','))
        ].join('\n');

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}

export const adminApi = new AdminApiService();
export default adminApi;

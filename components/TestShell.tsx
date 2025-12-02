/**
 * =================================================================
 * 🧪 TestShell - Vỏ bài test dùng chung (tiêu chuẩn UI/UX + hướng dẫn)
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Chuẩn hoá UI cho mọi bài test (tiêu đề, mô tả, thời lượng, cảnh báo an toàn, hướng dẫn).
 * - Bao bọc phần nội dung test cụ thể (children) để tái sử dụng.
 * - Cung cấp nút thoát (onExit) để rời test an toàn.
 *
 * CÁCH NHÚNG VÀO BÀI TEST KHÁC:
 * <TestShell
 *   title="Snellen Test"
 *   description="Kiểm tra thị lực qua chữ E xoay"
 *   estimatedTime={3}
 *   safetyNote="Không dùng khi đang lái xe"
 *   instructions={[t('ins1'), t('ins2')]}
 *   onExit={() => navigate('/home')}
 * >
 *   ...Nội dung test (câu hỏi, nút trả lời, tiến trình)...
 * </TestShell>
 */
import React from 'react';
import { Info, Clock, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TestShellProps {
    title: string;
    description: string;
    estimatedTime?: number;
    safetyNote?: string;
    instructions: string[];
    children: React.ReactNode;
    onExit?: () => void;
    rightActions?: React.ReactNode; // Tuỳ chọn: nút/indicator ở góc phải header
}

export const TestShell: React.FC<TestShellProps> = ({
    title,
    description,
    estimatedTime,
    safetyNote,
    instructions,
    children,
    onExit,
    rightActions,
}) => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-app-gradient dark:bg-background-dark">
            <div className="page-shell space-y-6">
                <div className="glass-elevated p-6 sm:p-8 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="chip w-fit text-xs">{t('general_instructions_title')}</p>
                            <h1 className="text-3xl font-bold text-text-main dark:text-text-dark mt-3">{title}</h1>
                            <p className="text-text-sub dark:text-slate-300">{description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {rightActions}
                            {onExit && (
                                <button
                                    onClick={onExit}
                                    className="rounded-full px-4 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-white/10 hover:bg-slate-800 transition-colors"
                                >
                                    {t('close_button')}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {estimatedTime && (
                            <div className="stat-pill">
                                <span className="flex items-center gap-2 text-xs">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {t('duration')}
                                </span>
                                <span className="text-xl font-semibold text-text-main dark:text-white">
                                    {estimatedTime} {t('minutes')}
                                </span>
                            </div>
                        )}
                        {safetyNote && (
                            <div className="stat-pill">
                                <span className="flex items-center gap-2 text-xs">
                                    <Shield className="w-4 h-4 text-secondary" />
                                    {t('warning') || 'Note'}
                                </span>
                                <span className="text-sm text-text-sub dark:text-slate-300">{safetyNote}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-elevated p-6 space-y-4">
                    <div className="flex items-center gap-2 text-text-main dark:text-white">
                        <Info className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">{t('general_instructions_title')}</h2>
                    </div>
                    <ul className="space-y-3 text-sm text-text-sub dark:text-slate-300">
                        {instructions.map((item, idx) => (
                            <li key={idx} className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-primary-muted text-primary-dark font-semibold flex items-center justify-center">
                                    {idx + 1}
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass-elevated p-6">{children}</div>
            </div>
        </div>
    );
};


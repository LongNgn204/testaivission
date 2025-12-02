import React from 'react';

// Card kính (glassmorphism) dùng chung cho dashboard/test
interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => (
    <div className={`glass-elevated ${className}`}>{children}</div>
);

// Thẻ thống kê nhỏ gọn (pill) hiển thị nhanh các chỉ số
export const StatPill: React.FC<{ label: string; value: React.ReactNode; helper?: React.ReactNode }> = ({ label, value, helper }) => (
    <div className="stat-pill">
        <span className="text-xs uppercase tracking-wide text-text-sub/80 dark:text-slate-300">{label}</span>
        <div className="text-2xl font-semibold text-text-main dark:text-white">{value}</div>
        {helper && <div className="text-xs text-text-sub/70 dark:text-slate-400">{helper}</div>}
    </div>
);

// Trạng thái trống hiển thị icon + nội dung ngắn gọn
export const EmptyState: React.FC<{ icon?: React.ElementType; title: string; description: string }> = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
        {Icon && <Icon className="w-10 h-10 text-primary/60" />}
        <div>
            <p className="text-lg font-semibold text-text-main dark:text-white">{title}</p>
            <p className="text-sm text-text-sub dark:text-slate-300 mt-1">{description}</p>
        </div>
    </div>
);

// Skeleton block đơn giản để tái sử dụng nhiều chiều cao
export const SkeletonBlock: React.FC<{ height?: string }> = ({ height = 'h-24' }) => (
    <div className={`skeleton ${height}`} />
);


import React from 'react';

// Khung trang chuẩn cho mọi màn hình nội dung lớn (giữ padding + nền đồng nhất)
interface PageShellProps {
    title: string;
    subtitle?: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({ title, subtitle, badge, actions, children }) => (
    <div className="min-h-screen bg-app-gradient dark:bg-background-dark">
        <div className="page-shell space-y-8">
            <section className="page-hero">
                <div className="flex flex-col gap-4">
                    {badge && <div className="chip w-fit">{badge}</div>}
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-text-main dark:text-text-dark">{title}</h1>
                        {subtitle && <p className="text-text-sub dark:text-slate-300">{subtitle}</p>}
                    </div>
                </div>
                {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </section>
            {children}
        </div>
    </div>
);


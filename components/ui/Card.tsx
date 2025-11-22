import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    glass?: boolean;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    glass = false,
    hover = false,
    padding = 'md',
    ...props
}) => {
    const paddingStyles = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const glassStyle = glass ? 'card-glass' : 'bg-white dark:bg-gray-800';
    const hoverStyle = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : '';

    return (
        <div
            className={`card ${glassStyle} ${paddingStyles[padding]} ${hoverStyle} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`mb-4 ${className}`} {...props}>
        {children}
    </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
    <h3 className={`text-lg font-bold text-gray-900 dark:text-white ${className}`} {...props}>
        {children}
    </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
    <div className={`mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between ${className}`} {...props}>
        {children}
    </div>
);

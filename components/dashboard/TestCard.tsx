import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronRightIcon } from '../ui/Icons';
import { Card } from '../ui/Card';

interface TestCardProps {
    test: {
        nameKey: string;
        descKey: string;
        path: string;
        icon: React.ElementType;
        color: string;
        bgColor: string;
    };
}

export const TestCard: React.FC<TestCardProps> = ({ test }) => {
    const { t } = useLanguage();
    const Icon = test.icon;

    return (
        <Link to={test.path} className="block group no-underline">
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-transparent hover:border-blue-100 dark:hover:border-blue-900">
                <div className="flex flex-col items-center text-center p-2">
                    <div className={`mb-4 p-4 rounded-2xl ${test.bgColor} dark:bg-gray-700 transition-transform group-hover:scale-110 duration-300`}>
                        <Icon className={test.color} size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                        {t(test.nameKey)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {t(test.descKey)}
                    </p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                        <ChevronRightIcon size={20} />
                    </div>
                </div>
            </Card>
        </Link>
    );
};

import React from 'react';
import { StoredTestResult } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { usePdfExport } from '../hooks/usePdfExport';
import { ReportDisplayContent } from './ReportDisplayContent';
import { X, Download, Share2 } from 'lucide-react';

export const ReportDetailModal: React.FC<{ storedResult: StoredTestResult, onClose: () => void }> = ({ storedResult, onClose }) => {
    const { t } = useLanguage();
    const { reportRef, exportToPdf, isExporting, sharePdf, isSharing } = usePdfExport();
    const canShare = navigator.share;

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-xl max-w-4xl w-full relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('report_details_title')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"><X size={24} /></button>
                </header>
                
                <main className="overflow-y-auto p-4 sm:p-6">
                    <div ref={reportRef}>
                        <ReportDisplayContent storedResult={storedResult} />
                    </div>
                </main>

                <footer className="p-4 border-t dark:border-gray-700 flex flex-col sm:flex-row gap-4 flex-shrink-0">
                    <button 
                        onClick={() => exportToPdf(`${storedResult.testType}-report-${storedResult.date.split('T')[0]}`)}
                        disabled={isExporting}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Download size={18}/>
                        {isExporting ? t('exporting_pdf') : t('export_pdf')}
                    </button>
                    {canShare && (
                        <button 
                            onClick={() => sharePdf(`${storedResult.testType}-report-${storedResult.date.split('T')[0]}`)}
                            disabled={isSharing}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <Share2 size={18}/>
                            {isSharing ? t('sharing_pdf') : t('share_report')}
                        </button>
                    )}
                    <button onClick={onClose} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">{t('close_button')}</button>
                </footer>
            </div>
        </div>
    );
};
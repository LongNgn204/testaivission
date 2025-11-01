import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const usePdfExport = () => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const generatePdfBlob = async (): Promise<Blob | null> => {
        if (!reportRef.current) return null;
        
        const isDarkMode = document.documentElement.classList.contains('dark');
        const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: isDarkMode ? '#030712' : '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        const pageHeight = pdf.internal.pageSize.getHeight();
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        let heightLeft = pdfHeight - pageHeight;

        while (heightLeft > 0) {
            position = -pageHeight * ((pdf.internal as any).getNumberOfPages());
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }
        
        return pdf.output('blob');
    };
    
    const exportToPdf = async (fileName: string) => {
        if (!reportRef.current || isExporting) return;
        setIsExporting(true);
        try {
            const blob = await generatePdfBlob();
            if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fileName}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Error exporting to PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const sharePdf = async (fileName: string) => {
        if (!navigator.share || isSharing) return;
        setIsSharing(true);
        try {
            const blob = await generatePdfBlob();
            if (blob) {
                const file = new File([blob], `${fileName}.pdf`, { type: 'application/pdf' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: fileName,
                        files: [file],
                    });
                } else {
                    // Fallback for browsers that can't share files
                    console.warn("This browser does not support sharing files. Falling back to download.");
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${fileName}.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            }
        } catch (error) {
            if ((error as DOMException).name !== 'AbortError') {
                 console.error("Error sharing PDF:", error);
            }
        } finally {
            setIsSharing(false);
        }
    };

    return { reportRef, exportToPdf, isExporting, sharePdf, isSharing };
};
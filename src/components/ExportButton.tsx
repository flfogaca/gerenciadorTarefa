import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { exportService } from '../services/exportService';

interface ExportButtonProps {
  title: string;
  data: any[];
  columns: string[];
  columnLabels?: Record<string, string>;
  variant?: 'default' | 'icon';
  onExportPDF?: () => void;
  onExportExcel?: () => void;
}

export function ExportButton({ 
  title, 
  data, 
  columns, 
  columnLabels,
  variant = 'default',
  onExportPDF,
  onExportExcel
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      exportService.exportToPDF(title, data, columns, columnLabels);
    }
    setIsOpen(false);
  };

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
    } else {
      exportService.exportToExcel(title, data, columns, columnLabels);
    }
    setIsOpen(false);
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Exportar"
        >
          <Download size={18} />
        </button>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-sm"
              >
                <FileText size={16} />
                Exportar PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-sm"
              >
                <FileSpreadsheet size={16} />
                Exportar Excel
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        <Download size={18} />
        Exportar
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-sm"
            >
              <FileText size={16} />
              Exportar PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-sm"
            >
              <FileSpreadsheet size={16} />
              Exportar Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
}


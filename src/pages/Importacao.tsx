import { useState } from 'react';
import { Upload, FileSpreadsheet, FileText, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import apiService from '../services/api';
import { showToast } from '../utils/toast';

type ImportType = 'projects' | 'tasks' | 'clients';

export default function Importacao() {
  const [importType, setImportType] = useState<ImportType>('projects');
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [columns, setColumns] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const modelFields: Record<ImportType, string[]> = {
    projects: ['name', 'description', 'clientId', 'managerId', 'status', 'size', 'budget', 'timeline'],
    tasks: ['title', 'description', 'projectId', 'assigneeId', 'reporterId', 'status', 'priority', 'dueDate', 'executionDays'],
    clients: ['name', 'cnpj', 'email', 'phone', 'address']
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setIsDetecting(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await apiService.detectImportColumns(formData);
      const detectedColumns = response?.columns || [];
      setColumns(detectedColumns);

      // Auto-mapear colunas
      const autoMapping: Record<string, string> = {};
      detectedColumns.forEach((col: string) => {
        const matched = modelFields[importType].find(
          field => field.toLowerCase() === col.toLowerCase() ||
                   field.toLowerCase().replace(/_/g, ' ') === col.toLowerCase()
        );
        if (matched) {
          autoMapping[col] = matched;
        }
      });
      setMapping(autoMapping);
    } catch (error) {
      showToast.error('Erro ao detectar colunas do arquivo');
      console.error(error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleImport = async () => {
    if (!file || Object.keys(mapping).length === 0) {
      showToast.error('Selecione um arquivo e configure o mapeamento');
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));
      formData.append('tenantId', localStorage.getItem('tenantId') || 'default-tenant');

      const response = await apiService.importData(importType, formData);
      setResult(response);

      if (response.success) {
        showToast.success(`Importação concluída! ${response.imported} registros importados.`);
      } else {
        showToast.error(`Importação com erros. ${response.errors?.length || 0} erros encontrados.`);
      }
    } catch (error: any) {
      showToast.error(error.message || 'Erro ao importar dados');
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Importação de Dados</h1>
        <p className="text-gray-600 mt-2">Importe projetos, tarefas ou clientes via CSV ou Excel</p>
      </div>

      {/* Tipo de Importação */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Importação
        </label>
        <div className="flex gap-4">
          {(['projects', 'tasks', 'clients'] as ImportType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setImportType(type);
                setFile(null);
                setColumns([]);
                setMapping({});
                setResult(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                importType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'projects' ? 'Projetos' : type === 'tasks' ? 'Tarefas' : 'Clientes'}
            </button>
          ))}
        </div>
      </div>

      {/* Upload de Arquivo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Selecionar Arquivo (CSV ou Excel)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-green-500" />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600">Clique para selecionar ou arraste o arquivo</p>
                <p className="text-xs text-gray-500">CSV ou Excel (máx. 10MB)</p>
              </div>
            )}
          </label>
        </div>
        {isDetecting && (
          <p className="text-sm text-blue-600 mt-2">Detectando colunas...</p>
        )}
      </div>

      {/* Mapeamento de Colunas */}
      {columns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mapeamento de Colunas</h3>
          <div className="space-y-3">
            {columns.map((col) => (
              <div key={col} className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coluna do Arquivo: <span className="font-bold">{col}</span>
                  </label>
                  <select
                    value={mapping[col] || ''}
                    onChange={(e) => setMapping({ ...mapping, [col]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Não mapear --</option>
                    {modelFields[importType].map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão de Importar */}
      {file && columns.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleImport}
            disabled={isImporting || Object.keys(mapping).filter(k => mapping[k]).length === 0}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Importando...
              </>
            ) : (
              <>
                <Upload size={20} />
                Importar Dados
              </>
            )}
          </button>
        </div>
      )}

      {/* Resultado da Importação */}
      {result && (
        <div className={`bg-white rounded-xl shadow-sm border p-6 ${
          result.success ? 'border-green-200' : 'border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {result.success ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {result.success ? 'Importação Concluída' : 'Importação com Erros'}
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Total de linhas:</strong> {result.totalRows}</p>
            <p><strong>Importadas:</strong> {result.imported}</p>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-red-600 mb-2">Erros encontrados:</p>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {result.errors.slice(0, 10).map((error: any, idx: number) => (
                    <p key={idx} className="text-xs text-red-600">
                      Linha {error.row}, {error.field}: {error.message}
                    </p>
                  ))}
                  {result.errors.length > 10 && (
                    <p className="text-xs text-gray-500">... e mais {result.errors.length - 10} erros</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


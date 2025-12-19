import { useState, useEffect } from 'react';
import { Upload, FileText, Download, Trash2, Eye, Plus, X } from 'lucide-react';
import apiService from '../services/api';
import { showToast, showConfirm } from '../utils/toast';

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

type EntityType = 'user' | 'client';

export default function GerenciarDocumentos() {
  const [entityType, setEntityType] = useState<EntityType>('user');
  const [entityId, setEntityId] = useState<string>('');
  const [entities, setEntities] = useState<any[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadEntities();
  }, [entityType]);

  useEffect(() => {
    if (entityId) {
      loadDocuments();
    }
  }, [entityId, entityType]);

  const loadEntities = async () => {
    try {
      if (entityType === 'user') {
        const response = await apiService.getUsers();
        setEntities(response?.data?.users || []);
      } else {
        const response = await apiService.getClients();
        setEntities(response?.data?.clients || []);
      }
    } catch (error) {
      console.error('Erro ao carregar entidades:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await apiService.getEntityDocuments(entityType, entityId);
      setDocuments(response?.data?.documents || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setDocuments([]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !entityId) {
      showToast.error('Selecione uma entidade e um arquivo');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);
      formData.append('name', file.name);

      await apiService.uploadEntityDocument(formData);
      showToast.success('Documento enviado com sucesso!');
      loadDocuments();
      setShowUploadModal(false);
    } catch (error) {
      showToast.error('Erro ao enviar documento');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    const confirmed = await showConfirm(`Tem certeza que deseja excluir "${doc.name}"?`);
    if (!confirmed) return;

    try {
      await apiService.deleteEntityDocument(entityType, entityId, doc.id);
      showToast.success('Documento excluído com sucesso!');
      loadDocuments();
    } catch (error) {
      showToast.error('Erro ao excluir documento');
      console.error(error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Documentos</h1>
        <p className="text-gray-600 mt-2">Faça upload e gerencie documentos de colaboradores e clientes</p>
      </div>

      {/* Seleção de Tipo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Entidade
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setEntityType('user');
              setEntityId('');
              setDocuments([]);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              entityType === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Colaboradores
          </button>
          <button
            onClick={() => {
              setEntityType('client');
              setEntityId('');
              setDocuments([]);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              entityType === 'client'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Clientes
          </button>
        </div>
      </div>

      {/* Seleção de Entidade */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {entityType === 'user' ? 'Colaborador' : 'Cliente'}
        </label>
        <select
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione...</option>
          {entities.map((entity) => (
            <option key={entity.id || entity.userId} value={entity.id || entity.userId}>
              {entityType === 'user'
                ? `${entity.firstName} ${entity.lastName}`
                : entity.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Documentos */}
      {entityId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Documentos</h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Adicionar Documento
            </button>
          </div>

          {documents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Nenhum documento encontrado
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Visualizar"
                    >
                      <Eye size={18} />
                    </a>
                    <a
                      href={doc.url}
                      download
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Adicionar Documento</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Arquivo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-10 w-10 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Clique para selecionar ou arraste o arquivo
                    </span>
                    <span className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)</span>
                  </label>
                </div>
              </div>
              {uploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Enviando...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


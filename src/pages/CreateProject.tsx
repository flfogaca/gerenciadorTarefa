import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Calendar,
  User,
  DollarSign,
  MapPin,
  Tag,
  Users,
  Flag,
  FileText,
  Paperclip,
  X,
  File
} from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';
import { useClients } from '../hooks/useClients';
import { useQuery } from '@tanstack/react-query';

interface FilePreview {
  file: File;
  preview: string;
  id: string;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<FilePreview[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'BRL',
    status: 'active',
    priority: 'medium',
    location: '',
    tags: '',
    notes: '',
    teamMembers: [] as string[]
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiService.getUsers();
      const normalized = (response as any)?.data || response;
      return normalized?.users || normalized?.data?.users || [];
    },
    staleTime: 5 * 60 * 1000
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const id = `${Date.now()}-${Math.random()}`;
      
      reader.onloadend = () => {
        setAttachments(prev => [...prev, {
          file,
          preview: file.type.startsWith('image/') ? reader.result as string : '',
          id
        }]);
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        setAttachments(prev => [...prev, {
          file,
          preview: '',
          id
        }]);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.clientId || !formData.startDate || !formData.endDate || !formData.budget) {
      showToast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setIsSubmitting(true);
      const budgetValue = parseFloat(formData.budget);
      if (isNaN(budgetValue) || budgetValue <= 0) {
        showToast.error('Orçamento deve ser um valor positivo.');
        return;
      }

      if (!user?.userId && !user?.id) {
        showToast.error('Usuário não autenticado. Por favor, faça login novamente.');
        return;
      }

      const managerId = user?.userId || user?.id;
      if (!managerId) {
        showToast.error('ID do gestor não encontrado. Por favor, faça login novamente.');
        return;
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        showToast.error('Datas inválidas. Por favor, verifique as datas informadas.');
        return;
      }

      if (endDate <= startDate) {
        showToast.error('A data de término deve ser posterior à data de início.');
        return;
      }

      const payload: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        clientId: formData.clientId.trim(),
        managerId: managerId,
        budget: {
          planned: budgetValue,
          spent: 0,
          currency: formData.currency,
          categories: []
        },
        timeline: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          milestones: []
        }
      };

      if (formData.location.trim()) {
        payload.description += `\n\nLocalização: ${formData.location.trim()}`;
      }

      if (formData.tags.trim()) {
        const tagsList = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        if (tagsList.length > 0) {
          payload.description += `\n\nTags: ${tagsList.join(', ')}`;
        }
      }

      if (formData.notes.trim()) {
        payload.description += `\n\nNotas: ${formData.notes.trim()}`;
      }

      const projectResponse = await apiService.createProject(payload);
      const project = (projectResponse as any)?.data?.project;
      const projectId = project?.id || project?.projectId;

      if (projectId && (formData.priority !== 'medium' || formData.teamMembers.length > 0)) {
        try {
          const updateData: any = {};
          if (formData.priority !== 'medium') {
            updateData.priority = formData.priority.toUpperCase();
          }
          if (formData.teamMembers.length > 0) {
            updateData.team = formData.teamMembers.map(memberId => ({ id: memberId }));
          }
          if (Object.keys(updateData).length > 0) {
            await apiService.updateProject(projectId, updateData);
          }
        } catch (updateError) {
          console.warn('Could not update project with additional fields:', updateError);
        }
      }

      if (attachments.length > 0 && projectId) {
        for (const attachment of attachments) {
          const formDataUpload = new FormData();
          formDataUpload.append('file', attachment.file);
          formDataUpload.append('entityType', 'project');
          formDataUpload.append('entityId', projectId);
          try {
            await apiService.uploadEntityDocument(formDataUpload);
          } catch (uploadError) {
            console.error('Error uploading attachment:', uploadError);
          }
        }
      }

      showToast.success('Projeto criado com sucesso!');
      navigate('/projetos');
    } catch (error: any) {
      console.error('Error creating project:', error);
      const errorDetails = error.response?.data?.details || [];
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao criar projeto';
      
      if (errorDetails.length > 0) {
        const detailsMessage = errorDetails.map((d: any) => `${d.field || 'campo'}: ${d.message || d}`).join(', ');
        showToast.error(`Erro de validação: ${detailsMessage}`);
      } else {
        showToast.error(`Erro: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamMemberToggle = (memberId: string) => {
    if (!memberId) return;
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter(id => id !== memberId)
        : [...prev.teamMembers, memberId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/projetos')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Criar Novo Projeto</h1>
          <p className="text-sm text-gray-600 mt-1">Preencha os dados para criar um novo projeto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações Básicas</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Projeto *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome do projeto"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva o projeto em detalhes..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Cliente *
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  required
                  value={formData.clientId}
                  onChange={handleChange}
                  disabled={isLoadingClients}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione um cliente</option>
                  {(clients as any[]).map((client: any) => {
                    const clientId = client.id || client.clientId;
                    const clientName = client.name || client.contactName || `Cliente ${clientId}`;
                    return (
                      <option key={clientId} value={clientId}>
                        {clientName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  <Flag className="inline mr-2" size={16} />
                  Prioridade
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Datas e Orçamento</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Data de Início *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Data de Término *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline mr-2" size={16} />
                  Orçamento *
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  required
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Moeda
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="BRL">BRL (R$)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações Adicionais</h2>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Localização/Endereço
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o endereço ou localização do evento"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline mr-2" size={16} />
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                onKeyDown={handleTagInput}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: evento, corporativo, grande porte"
              />
              <p className="mt-1 text-xs text-gray-500">Separe múltiplas tags com vírgulas</p>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline mr-2" size={16} />
                Notas Adicionais
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Informações adicionais, observações, requisitos especiais..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Equipe</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline mr-2" size={16} />
                Membros da Equipe
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                {isLoadingUsers ? (
                  <p className="text-sm text-gray-500">Carregando membros...</p>
                ) : (users as any[]).length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum membro disponível</p>
                ) : (
                  <div className="space-y-2">
                    {(users as any[]).map((member: any) => {
                      const memberId = member.id || member.userId || member.user?.id;
                      const memberName = member.name || member.user?.name || member.email || `Usuário ${memberId}`;
                      return (
                        <label key={memberId} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.teamMembers.includes(memberId)}
                            onChange={() => handleTeamMemberToggle(memberId)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {memberName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Anexos</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Paperclip className="inline mr-2" size={16} />
                Adicionar Arquivos
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Paperclip className="text-gray-400 mb-2" size={32} />
                  <span className="text-sm text-gray-600">
                    Clique para adicionar arquivos ou arraste e solte aqui
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Imagens, PDFs, documentos (máx. 10MB por arquivo)
                  </span>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 space-y-4">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white">
                      {attachment.preview ? (
                        <div className="relative">
                          <div className="flex items-center justify-center bg-gray-50 p-2">
                            <img
                              src={attachment.preview}
                              alt="Preview"
                              className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
                              style={{ maxHeight: '400px' }}
                            />
                          </div>
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const img = new Image();
                                img.src = attachment.preview;
                                const w = window.open('');
                                if (w) w.document.write(`<img src="${attachment.preview}" style="max-width: 100%; height: auto;" />`);
                              }}
                              className="bg-blue-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                              title="Ver em tamanho real"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeAttachment(attachment.id)}
                              className="bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              title="Remover"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="p-2 bg-gray-50 border-t">
                            <p className="text-xs text-gray-600 truncate">{attachment.file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative p-6 bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <File className="text-gray-400" size={32} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">{attachment.file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(attachment.id)}
                              className="flex-shrink-0 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              title="Remover"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t pt-6">
          <button
            type="button"
            onClick={() => navigate('/projetos')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            <Save className="mr-2" size={18} />
            {isSubmitting ? 'Salvando...' : 'Salvar Projeto'}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Calendar,
  User,
  FileText,
  DollarSign,
  Trash2
} from 'lucide-react';
import apiService from '../services/api';
import { projectStatusToLabel } from '../utils/statusMapper';

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'BRL',
    status: 'active'
  });

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProject(id!);
      const project = response.project || response;
      setFormData({
        name: project.name || '',
        description: project.description || '',
        clientId: project.clientId || '',
        startDate: project.timeline?.startDate ? new Date(project.timeline.startDate).toISOString().split('T')[0] : '',
        endDate: project.timeline?.endDate ? new Date(project.timeline.endDate).toISOString().split('T')[0] : '',
        budget: project.budget?.planned?.toString() || '',
        currency: project.budget?.currency || 'BRL',
        status: project.status || 'ACTIVE'
      });
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      const budgetValue = parseFloat(formData.budget);
      if (isNaN(budgetValue) || budgetValue <= 0) {
        showToast.error('Orçamento deve ser um valor positivo.');
        return;
      }

      const payload: any = {
        name: formData.name,
        description: formData.description,
        clientId: formData.clientId,
        budget: {
          planned: budgetValue,
          spent: 0,
          currency: formData.currency,
          categories: []
        },
        timeline: {
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          milestones: []
        }
      };

      await apiService.updateProject(id, payload);
      navigate('/projetos');
    } catch (error: any) {
      console.error('Error updating project:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar projeto';
      showToast.error(`Erro: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await showConfirm('Tem certeza que deseja deletar este projeto?');
    if (!confirmed) return;
    
    try {
      await apiService.deleteProject(id);
      navigate('/projetos');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projetos')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Projeto</h1>
            <p className="text-sm text-gray-600 mt-1">Atualize os dados do projeto</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
        >
          <Trash2 className="mr-2" size={18} />
          Deletar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
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
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descreva o projeto..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Data de Início
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Data de Término
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline mr-2" size={16} />
                Cliente
              </label>
              <input
                type="text"
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ID do cliente"
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline mr-2" size={16} />
                Orçamento
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
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

        <div className="mt-6 flex justify-end gap-4">
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
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}


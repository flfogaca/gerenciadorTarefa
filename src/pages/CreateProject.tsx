import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Save,
  Calendar,
  User,
  FileText,
  DollarSign
} from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { labelToProjectStatus } from '../utils/statusMapper';

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

      const payload = {
        name: formData.name,
        description: formData.description,
        clientId: formData.clientId,
        managerId: user?.userId || user?.id || '',
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

      await apiService.createProject(payload);
      navigate('/projetos');
    } catch (error: any) {
      console.error('Error creating project:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao criar projeto';
      showToast.error(`Erro: ${message}`);
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
              placeholder="Descreva o projeto..."
            />
          </div>

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
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline mr-2" size={16} />
                Cliente ID *
              </label>
              <input
                type="text"
                id="clientId"
                name="clientId"
                required
                value={formData.clientId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ID do cliente"
              />
            </div>

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
            {isSubmitting ? 'Salvando...' : 'Salvar Projeto'}
          </button>
        </div>
      </form>
    </div>
  );
}


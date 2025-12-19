import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Tag } from 'lucide-react';
import apiService from '../services/api';
import { showToast, showConfirm } from '../utils/toast';

interface CustomStatus {
  id: string;
  name: string;
  color: string;
  type: 'project' | 'task';
  order: number;
}

export default function StatusCustomizados() {
  const [projectStatuses, setProjectStatuses] = useState<CustomStatus[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<CustomStatus[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<Partial<CustomStatus>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Partial<CustomStatus>>({
    type: 'project',
    color: '#3B82F6',
    order: 0
  });

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      const response = await apiService.getTenantSettings();
      const settings = response?.data?.settings || {};
      const customStatuses = settings.customStatuses || {};
      
      setProjectStatuses(customStatuses.projects || []);
      setTaskStatuses(customStatuses.tasks || []);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  const saveStatuses = async () => {
    try {
      const customStatuses = {
        projects: projectStatuses,
        tasks: taskStatuses
      };

      await apiService.updateTenantSettings({
        settings: { customStatuses }
      });

      showToast.success('Status customizados salvos com sucesso!');
    } catch (error) {
      showToast.error('Erro ao salvar status customizados');
      console.error(error);
    }
  };

  const handleAddStatus = () => {
    if (!newStatus.name || !newStatus.type) {
      showToast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const status: CustomStatus = {
      id: `status-${Date.now()}`,
      name: newStatus.name!,
      color: newStatus.color || '#3B82F6',
      type: newStatus.type!,
      order: newStatus.type === 'project' ? projectStatuses.length : taskStatuses.length
    };

    if (newStatus.type === 'project') {
      setProjectStatuses([...projectStatuses, status]);
    } else {
      setTaskStatuses([...taskStatuses, status]);
    }

    setNewStatus({ type: 'project', color: '#3B82F6', order: 0 });
    setShowAddModal(false);
    saveStatuses();
  };

  const handleEditStatus = (status: CustomStatus) => {
    setEditingId(status.id);
    setEditingStatus({ ...status });
  };

  const handleSaveEdit = () => {
    if (!editingStatus.name) {
      showToast.error('Nome é obrigatório');
      return;
    }

    if (editingStatus.type === 'project') {
      setProjectStatuses(projectStatuses.map(s => 
        s.id === editingId ? { ...s, ...editingStatus } as CustomStatus : s
      ));
    } else {
      setTaskStatuses(taskStatuses.map(s => 
        s.id === editingId ? { ...s, ...editingStatus } as CustomStatus : s
      ));
    }

    setEditingId(null);
    setEditingStatus({});
    saveStatuses();
  };

  const handleDeleteStatus = async (status: CustomStatus) => {
    const confirmed = await showConfirm(`Tem certeza que deseja excluir o status "${status.name}"?`);
    if (!confirmed) return;

    if (status.type === 'project') {
      setProjectStatuses(projectStatuses.filter(s => s.id !== status.id));
    } else {
      setTaskStatuses(taskStatuses.filter(s => s.id !== status.id));
    }

    saveStatuses();
  };

  const renderStatusList = (statuses: CustomStatus[], type: 'project' | 'task') => (
    <div className="space-y-2">
      {statuses.map((status) => (
        <div
          key={status.id}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {editingId === status.id ? (
            <>
              <input
                type="text"
                value={editingStatus.name || ''}
                onChange={(e) => setEditingStatus({ ...editingStatus, name: e.target.value })}
                className="flex-1 px-3 py-1 border border-gray-300 rounded"
              />
              <input
                type="color"
                value={editingStatus.color || '#3B82F6'}
                onChange={(e) => setEditingStatus({ ...editingStatus, color: e.target.value })}
                className="w-12 h-8 rounded border border-gray-300"
              />
              <button
                onClick={handleSaveEdit}
                className="p-2 text-green-600 hover:bg-green-50 rounded"
              >
                <Save size={18} />
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditingStatus({});
                }}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <span className="flex-1 font-medium text-gray-900">{status.name}</span>
              <button
                onClick={() => handleEditStatus(status)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDeleteStatus(status)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Status Customizados</h1>
          <p className="text-gray-600 mt-2">Gerencie status personalizados para projetos e tarefas</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Adicionar Status
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status de Projetos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Status de Projetos</h2>
          </div>
          {renderStatusList(projectStatuses, 'project')}
          {projectStatuses.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum status customizado</p>
          )}
        </div>

        {/* Status de Tarefas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Status de Tarefas</h2>
          </div>
          {renderStatusList(taskStatuses, 'task')}
          {taskStatuses.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum status customizado</p>
          )}
        </div>
      </div>

      {/* Modal de Adicionar Status */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Adicionar Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Status
                </label>
                <input
                  type="text"
                  value={newStatus.name || ''}
                  onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Em Revisão"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={newStatus.type || 'project'}
                  onChange={(e) => setNewStatus({ ...newStatus, type: e.target.value as 'project' | 'task' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="project">Projeto</option>
                  <option value="task">Tarefa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <input
                  type="color"
                  value={newStatus.color || '#3B82F6'}
                  onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewStatus({ type: 'project', color: '#3B82F6', order: 0 });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  DollarSign,
  FolderKanban,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import apiService from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { showToast } from '../utils/toast';

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useWebSocket();

  useEffect(() => {
    if (id) {
      loadProject();
      loadProjectTasks();
    }

    const handleProjectUpdate = (event: CustomEvent) => {
      const updatedProject = event.detail;
      if (updatedProject?.id === id) {
        loadProject();
        showToast.info('Projeto foi atualizado');
      }
    };

    window.addEventListener('websocket:project:updated', handleProjectUpdate as EventListener);

    return () => {
      window.removeEventListener('websocket:project:updated', handleProjectUpdate as EventListener);
    };
  }, [id]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProject(id!);
      setProject((response as any).project || response);
    } catch (error: any) {
      console.error('Error loading project:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao carregar projeto';
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectTasks = async () => {
    try {
      const response = await apiService.getTasks(id);
      setTasks((response as any).tasks || []);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao carregar tarefas';
      console.error(message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await showConfirm('Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    
    try {
      await apiService.deleteProject(id);
      navigate('/projetos');
    } catch (error: any) {
      console.error('Error deleting project:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao deletar projeto';
      showToast.error(`Erro ao deletar projeto: ${message}`);
    }
  };

  const mapStatusToApi = (status: string): string => {
    const statusMap: Record<string, string> = {
      'active': 'ACTIVE',
      'completed': 'COMPLETED',
      'paused': 'ON_HOLD',
      'cancelled': 'CANCELLED',
      'planning': 'PLANNING',
      'ACTIVE': 'ACTIVE',
      'COMPLETED': 'COMPLETED',
      'ON_HOLD': 'ON_HOLD',
      'CANCELLED': 'CANCELLED',
      'PLANNING': 'PLANNING'
    };
    return statusMap[status] || status.toUpperCase();
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      const apiStatus = mapStatusToApi(newStatus);
      await apiService.changeProjectStatus(id, apiStatus);
      loadProject();
    } catch (error: any) {
      console.error('Error changing status:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao alterar status do projeto';
      showToast.error(`Erro ao alterar status: ${message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'paused':
        return 'Pausado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
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

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Projeto não encontrado</p>
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
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Detalhes do projeto</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/projetos/${id}/editar`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Edit className="mr-2" size={18} />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
          >
            <Trash2 className="mr-2" size={18} />
            Deletar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Projeto</h2>
            <div className="space-y-4">
              {project.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-gray-900 mt-1">{project.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="mr-2" size={16} />
                    Data de Início
                  </label>
                  <p className="text-gray-900 mt-1">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="mr-2" size={16} />
                    Data de Término
                  </label>
                  <p className="text-gray-900 mt-1">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="mr-2" size={16} />
                    Cliente
                  </label>
                  <p className="text-gray-900 mt-1">{project.clientName || project.clientId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <DollarSign className="mr-2" size={16} />
                    Orçamento
                  </label>
                  <p className="text-gray-900 mt-1">
                    {project.budget ? `R$ ${parseFloat(project.budget).toLocaleString('pt-BR')}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarefas do Projeto</h2>
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma tarefa encontrada</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{task.title || task.name}</p>
                      <p className="text-sm text-gray-500">{task.status}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/tarefas/${task.id}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Ver detalhes
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <div className="space-y-4">
              <div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alterar Status</label>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Em Andamento</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Progresso</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progresso Geral</span>
                <span className="font-medium">{project.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${project.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


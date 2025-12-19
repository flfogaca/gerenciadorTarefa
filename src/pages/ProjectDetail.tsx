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
  AlertCircle,
  MapPin,
  Tag,
  Flag,
  Users,
  FileText,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import apiService from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { showToast, showConfirm } from '../utils/toast';
import { useQuery } from '@tanstack/react-query';

const parseDescription = (description: string) => {
  if (!description) return { main: '', location: '', tags: '', notes: '' };
  
  const locationMatch = description.match(/Localização:\s*(.+?)(?:\n|$)/i);
  const tagsMatch = description.match(/Tags:\s*(.+?)(?:\n|$)/i);
  const notesMatch = description.match(/Notas:\s*(.+?)(?:\n|$)/i);
  
  let main = description;
  if (locationMatch) main = main.replace(/Localização:\s*.+?(?:\n|$)/i, '').trim();
  if (tagsMatch) main = main.replace(/Tags:\s*.+?(?:\n|$)/i, '').trim();
  if (notesMatch) main = main.replace(/Notas:\s*.+?(?:\n|$)/i, '').trim();
  
  return {
    main: main.trim(),
    location: locationMatch ? locationMatch[1].trim() : '',
    tags: tagsMatch ? tagsMatch[1].trim() : '',
    notes: notesMatch ? notesMatch[1].trim() : ''
  };
};

const getPriorityLabel = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'HIGH': 'Alta',
    'MEDIUM': 'Média',
    'LOW': 'Baixa',
    'high': 'Alta',
    'medium': 'Média',
    'low': 'Baixa'
  };
  return priorityMap[priority] || priority;
};

const getPriorityColor = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'HIGH': 'bg-red-100 text-red-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'LOW': 'bg-green-100 text-green-800',
    'high': 'bg-red-100 text-red-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800'
  };
  return priorityMap[priority] || 'bg-gray-100 text-gray-800';
};

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useWebSocket();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiService.getUsers();
      const normalized = (response as any)?.data || response;
      return normalized?.users || normalized?.data?.users || [];
    }
  });

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  useEffect(() => {
    if (project) {
      loadProjectTasks();
      loadDocuments();
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
  }, [project]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProject(id!);
      const project = (response as any)?.data?.project || (response as any)?.project || response;
      if (project) {
        setProject(project);
      } else {
        showToast.error('Projeto não encontrado');
      }
    } catch (error: any) {
      console.error('Error loading project:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao carregar projeto';
      showToast.error(`Erro: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectTasks = async () => {
    if (!project) return;
    try {
      const projectId = project.projectId || project.id || id;
      if (projectId) {
        const response = await apiService.getTasks(projectId);
        setTasks((response as any).tasks || (response as any)?.data?.tasks || []);
      }
    } catch (error: any) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadDocuments = async () => {
    if (!project) return;
    try {
      const projectId = project.id || id;
      if (projectId) {
        try {
          const response = await apiService.getEntityDocuments('client', projectId);
          setDocuments((response as any)?.data?.documents || []);
        } catch (docError) {
          console.warn('Could not load documents:', docError);
          setDocuments([]);
        }
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
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
      await apiService.changeProjectStatus((project as any)?.projectId || id, apiStatus);
      loadProject();
    } catch (error: any) {
      console.error('Error changing status:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao alterar status do projeto';
      showToast.error(`Erro ao alterar status: ${message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'em andamento':
        return 'bg-green-100 text-green-800';
      case 'completed':
      case 'concluído':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
      case 'on_hold':
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'planning':
      case 'planejamento':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'paused':
      case 'on_hold':
        return 'Pausado';
      case 'cancelled':
        return 'Cancelado';
      case 'planning':
        return 'Planejamento';
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

  const descriptionParts = parseDescription(project.description || '');
  const startDate = project.timeline?.startDate || project.startDate;
  const endDate = project.timeline?.endDate || project.endDate;
  const budget = project.budget?.planned || project.budget;
  const currency = project.budget?.currency || 'BRL';
  const teamMembers = project.team || [];

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
              {descriptionParts.main && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{descriptionParts.main}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="mr-2" size={16} />
                    Data de Início
                  </label>
                  <p className="text-gray-900 mt-1">
                    {startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="mr-2" size={16} />
                    Data de Término
                  </label>
                  <p className="text-gray-900 mt-1">
                    {endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'N/A'}
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
                    {budget ? `${currency} ${parseFloat(budget.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                  </p>
                </div>
              </div>

              {descriptionParts.location && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="mr-2" size={16} />
                    Localização
                  </label>
                  <p className="text-gray-900 mt-1">{descriptionParts.location}</p>
                </div>
              )}

              {descriptionParts.tags && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Tag className="mr-2" size={16} />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {descriptionParts.tags.split(',').map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {descriptionParts.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <FileText className="mr-2" size={16} />
                    Notas Adicionais
                  </label>
                  <p className="text-gray-900 mt-1 whitespace-pre-wrap">{descriptionParts.notes}</p>
                </div>
              )}
            </div>
          </div>

          {teamMembers.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2" size={20} />
                Equipe
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {teamMembers.map((member: any) => {
                  const memberId = member.id || member.userId;
                  const memberData = (users as any[]).find(u => (u.id || u.userId) === memberId);
                  const memberName = memberData?.name || memberData?.email || `Usuário ${memberId}`;
                  return (
                    <div key={memberId} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {memberName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 truncate">{memberName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Paperclip className="mr-2" size={20} />
                Anexos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                    {doc.type?.startsWith('image/') ? (
                      <img
                        src={doc.url || doc.path}
                        alt={doc.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                        <FileText className="text-gray-400" size={32} />
                      </div>
                    )}
                    <p className="text-xs text-gray-600 truncate">{doc.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarefas do Projeto</h2>
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma tarefa encontrada</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
                  value={project.status?.toLowerCase() || 'active'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="planning">Planejamento</option>
                  <option value="active">Em Andamento</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Flag className="mr-2" size={20} />
              Prioridade
            </h2>
            <div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(project.priority || 'medium')}`}>
                {getPriorityLabel(project.priority || 'medium')}
              </span>
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
                  className="bg-blue-600 h-2 rounded-full transition-all"
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

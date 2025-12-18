import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Paperclip, 
  MessageSquare, 
  Edit, 
  Save, 
  X, 
  Plus,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Square,
  Tag,
  Users,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import apiService from '../services/api';
import { showToast, showConfirm } from '../utils/toast';
import { useWebSocket } from '../hooks/useWebSocket';


const getStatusColor = (status: string) => {
  switch (status) {
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Em andamento': return 'bg-blue-100 text-blue-800';
    case 'Pendente': return 'bg-yellow-100 text-yellow-800';
    case 'Pausado': return 'bg-orange-100 text-orange-800';
    case 'Cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Alta': return 'bg-red-100 text-red-800';
    case 'Média': return 'bg-yellow-100 text-yellow-800';
    case 'Baixa': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf': return '📄';
    case 'ai': return '🎨';
    case 'png': return '🖼️';
    case 'jpg': return '🖼️';
    case 'jpeg': return '🖼️';
    case 'doc': return '📝';
    case 'docx': return '📝';
    case 'xls': return '📊';
    case 'xlsx': return '📊';
    case 'zip': return '📦';
    default: return '📎';
  }
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tags' | 'attachments' | 'people'>('overview');
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: '',
    estimatedHours: 0
  });
  const [newComment, setNewComment] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [newTag, setNewTag] = useState('');
  const [newWatcher, setNewWatcher] = useState('');
  const [timeLogHours, setTimeLogHours] = useState('');
  const [timeLogDescription, setTimeLogDescription] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [newAssigneeId, setNewAssigneeId] = useState('');

  useWebSocket();

  useEffect(() => {
    if (id) {
      loadTask();
      loadUsers();
    }

    const handleTaskUpdate = (event: CustomEvent) => {
      const updatedTask = event.detail;
      if (updatedTask?.id === id) {
        loadTask();
        showToast.info('Tarefa foi atualizada');
      }
    };

    window.addEventListener('websocket:task:updated', handleTaskUpdate as EventListener);

    return () => {
      window.removeEventListener('websocket:task:updated', handleTaskUpdate as EventListener);
    };
  }, [id]);

  const loadTask = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTask(id!);
      const taskData = response.data?.task || response.data;
      
      if (taskData) {
        const mappedTask = {
          id: taskData.id,
          code: taskData.code || `TSK-${taskData.id}`,
          title: taskData.title || taskData.name,
          description: taskData.description || '',
          status: mapTaskStatus(taskData.status),
          priority: mapTaskPriority(taskData.priority),
          assignee: taskData.assignee || taskData.assignedTo || { id: '', name: 'Não atribuído' },
          project: taskData.project?.name || taskData.projectName || '',
          client: taskData.project?.clientName || taskData.client || '',
          createdAt: taskData.createdAt || taskData.createdDate || '',
          dueDate: taskData.dueDate || taskData.endDate || '',
          estimatedHours: taskData.estimatedHours || 0,
          loggedHours: taskData.loggedHours || taskData.completedHours || 0,
          tags: taskData.tags || [],
          watchers: taskData.watchers || [],
          attachments: taskData.attachments || [],
          history: taskData.history || [],
          comments: taskData.comments || []
        };
        setTask(mappedTask);
        setEditData({
          title: mappedTask.title,
          description: mappedTask.description,
          status: mappedTask.status,
          priority: mappedTask.priority,
          dueDate: mappedTask.dueDate,
          estimatedHours: mappedTask.estimatedHours
        });
      }
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      const usersData = response.data?.users || response.data || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const mapTaskStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'in_progress': 'Em andamento',
      'completed': 'Concluído',
      'cancelled': 'Cancelado',
      'Pendente': 'Pendente',
      'Em andamento': 'Em andamento',
      'Concluído': 'Concluído'
    };
    return statusMap[status] || status || 'Pendente';
  };

  const mapTaskPriority = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'high': 'Alta',
      'medium': 'Média',
      'low': 'Baixa',
      'Alta': 'Alta',
      'Média': 'Média',
      'Baixa': 'Baixa'
    };
    return priorityMap[priority] || priority || 'Média';
  };

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours
      });
    }
  }, [task]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const statusMap: Record<string, string> = {
        'Pendente': 'pending',
        'Em andamento': 'in_progress',
        'Concluído': 'completed',
        'Cancelado': 'cancelled'
      };

      const priorityMap: Record<string, string> = {
        'Alta': 'high',
        'Média': 'medium',
        'Baixa': 'low'
      };

      await apiService.updateTask(id, {
        title: editData.title,
        description: editData.description,
        status: statusMap[editData.status] || editData.status,
        priority: priorityMap[editData.priority] || editData.priority,
        dueDate: editData.dueDate,
        estimatedHours: editData.estimatedHours
      });
      
      await loadTask();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || '',
      priority: task?.priority || '',
      dueDate: task?.dueDate || '',
      estimatedHours: task?.estimatedHours || 0
    });
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      const statusMap: Record<string, string> = {
        'Pendente': 'TODO',
        'Em andamento': 'IN_PROGRESS',
        'Concluído': 'DONE',
        'Cancelado': 'CANCELLED',
        'A Iniciar': 'TODO',
        'Em Andamento': 'IN_PROGRESS',
        'TODO': 'TODO',
        'IN_PROGRESS': 'IN_PROGRESS',
        'DONE': 'DONE',
        'REVIEW': 'REVIEW',
        'CANCELLED': 'CANCELLED'
      };
      await apiService.changeTaskStatus(id, statusMap[newStatus] || newStatus);
      await loadTask();
    } catch (error: any) {
      console.error('Error changing task status:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao alterar status da tarefa';
      showToast.error(`Erro ao alterar status: ${message}`);
    }
  };

  const handleReassign = async () => {
    if (!id || !newAssigneeId) return;
    try {
      await apiService.reassignTask(id, newAssigneeId);
      await loadTask();
      setShowReassignModal(false);
      setNewAssigneeId('');
    } catch (error: any) {
      console.error('Error reassigning task:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao reatribuir tarefa';
      showToast.error(`Erro ao reatribuir tarefa: ${message}`);
    }
  };

  const handleLogTime = async () => {
    if (!id || !timeLogHours || parseFloat(timeLogHours) <= 0) return;
    try {
      await apiService.logTime(id, {
        duration: parseFloat(timeLogHours) * 3600,
        description: timeLogDescription || 'Tempo trabalhado'
      });
      setTimeLogHours('');
      setTimeLogDescription('');
      await loadTask();
    } catch (error: any) {
      console.error('Error logging time:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao registrar tempo';
      showToast.error(`Erro ao registrar tempo: ${message}`);
    }
  };

  const handleTimerStop = async () => {
    if (timerSeconds > 0 && id) {
      const hours = timerSeconds / 3600;
      try {
        await apiService.logTime(id, {
          duration: timerSeconds,
          description: 'Tempo registrado via timer',
          date: new Date().toISOString()
        });
        await loadTask();
      } catch (error) {
        console.error('Error logging time:', error);
        showToast.error('Erro ao registrar tempo');
      }
    }
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    try {
      const currentUser = await apiService.getCurrentUser();
      await apiService.addTaskComment(id, {
        content: newComment,
        userId: currentUser?.id || currentUser?.userId || ''
      });
      setNewComment('');
      await loadTask();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      showToast.error('Erro ao adicionar comentário');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!id || !files || files.length === 0) return;
    
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      await apiService.uploadTaskFiles(id, formData);
      await loadTask();
      showToast.success('Arquivos enviados com sucesso!');
    } catch (error: any) {
      console.error('Error uploading files:', error);
      showToast.error('Erro ao enviar arquivos');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!id || !fileId) return;
    const confirmed = await showConfirm('Tem certeza que deseja excluir este arquivo?');
    if (!confirmed) return;
    
    try {
      await apiService.deleteTaskFile(id, fileId);
      await loadTask();
      showToast.success('Arquivo excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting file:', error);
      showToast.error('Erro ao excluir arquivo');
    }
  };

  const handleTimerToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleAddTag = async () => {
    if (!id || !newTag.trim() || task?.tags.includes(newTag.trim())) return;
    try {
      const updatedTags = [...(task?.tags || []), newTag.trim()];
      await apiService.updateTask(id, { tags: updatedTags });
      setNewTag('');
      await loadTask();
    } catch (error: any) {
      console.error('Error adding tag:', error);
      showToast.error('Erro ao adicionar tag');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!id) return;
    try {
      const updatedTags = (task?.tags || []).filter((tag: string) => tag !== tagToRemove);
      await apiService.updateTask(id, { tags: updatedTags });
      await loadTask();
    } catch (error: any) {
      console.error('Error removing tag:', error);
      showToast.error('Erro ao remover tag');
    }
  };

  const handleAddWatcher = async () => {
    if (!id || !newWatcher.trim()) return;
    try {
      const watcherUser = users.find((u: any) => 
        u.name?.toLowerCase().includes(newWatcher.toLowerCase()) ||
        u.email?.toLowerCase().includes(newWatcher.toLowerCase())
      );
      
      if (!watcherUser) {
        showToast.error('Usuário não encontrado');
        return;
      }
      
      const updatedWatchers = [...(task?.watchers || []), {
        id: watcherUser.id,
        name: watcherUser.name,
        email: watcherUser.email,
        role: watcherUser.role
      }];
      
      await apiService.updateTask(id, { watchers: updatedWatchers });
      setNewWatcher('');
      await loadTask();
    } catch (error: any) {
      console.error('Error adding watcher:', error);
      showToast.error('Erro ao adicionar observador');
    }
  };

  const handleRemoveWatcher = async (watcherId: number) => {
    if (!id) return;
    try {
      const updatedWatchers = (task?.watchers || []).filter((w: any) => w.id !== watcherId);
      await apiService.updateTask(id, { watchers: updatedWatchers });
      await loadTask();
    } catch (error: any) {
      console.error('Error removing watcher:', error);
      showToast.error('Erro ao remover observador');
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

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tarefa não encontrada</h2>
          <p className="text-gray-600 mb-4">A tarefa solicitada não existe ou foi removida.</p>
          <button
            onClick={() => navigate('/tarefas')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Tarefas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/tarefas')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{task.code}</h1>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <p className="text-gray-600">{task.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEdit}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Edit size={20} className="mr-2" />
            Editar
          </button>
        </div>
      </div>

      {/* Sistema de Abas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tags'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Tag size={16} className="inline mr-2" />
              Tags
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'attachments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Paperclip size={16} className="inline mr-2" />
              Anexos
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'people'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Pessoas
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Conteúdo da aba Visão Geral - mantém o conteúdo atual */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conteúdo Principal */}
                <div className="lg:col-span-2 space-y-6">
          {/* Informações da Tarefa */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Informações da Tarefa</h2>
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save size={16} className="mr-1" />
                    Salvar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{task.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{task.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  {isEditing ? (
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({...editData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Pausado">Pausado</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <div className="flex space-x-1">
                        {['Pendente', 'Em andamento', 'Pausado', 'Concluído', 'Cancelado'].map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            className={`px-2 py-1 text-xs rounded ${
                              task.status === status 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                  {isEditing ? (
                    <select
                      value={editData.priority}
                      onChange={(e) => setEditData({...editData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vencimento</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.dueDate}
                      onChange={(e) => setEditData({...editData, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horas Estimadas</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.estimatedHours}
                      onChange={(e) => setEditData({...editData, estimatedHours: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{task.estimatedHours}h</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cronômetro */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Controle de Tempo</h2>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatTime(timerSeconds)}
                </div>
                <p className="text-sm text-gray-600">Tempo atual</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {task.loggedHours}h
                </div>
                <p className="text-sm text-gray-600">Total registrado</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTimerToggle}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                    isTimerRunning 
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isTimerRunning ? <Pause size={20} className="mr-2" /> : <Play size={20} className="mr-2" />}
                  {isTimerRunning ? 'Pausar' : 'Iniciar'}
                </button>
                <button
                  onClick={handleTimerStop}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Square size={20} className="mr-2" />
                  Parar
                </button>
              </div>
            </div>
          </div>

          {/* Anexos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Anexos</h2>
              <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
                <Plus size={20} className="mr-2" />
                Adicionar Arquivo
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.ai,.doc,.docx,.xls,.xlsx,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-3">
              {task.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-sm text-gray-600">{attachment.size} • {attachment.uploadedBy} • {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 p-1">
                      <Eye size={16} />
                    </button>
                    <button className="text-green-600 hover:text-green-800 p-1">
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteFile(attachment.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Excluir arquivo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {task.attachments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Paperclip size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Nenhum arquivo anexado</p>
                  <p className="text-sm">Clique em "Adicionar Arquivo" para anexar documentos</p>
                </div>
              )}
            </div>
          </div>

          {/* Comentários */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comentários</h2>
            
            <div className="space-y-4 mb-6">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900">{comment.user}</p>
                      <p className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                    <p className="text-gray-900">{comment.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                alt="Usuário"
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicionar comentário..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do Projeto */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Projeto</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.project}</p>
                  <p className="text-xs text-gray-600">Projeto</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.client}</p>
                  <p className="text-xs text-gray-600">Cliente</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User size={20} className="text-gray-400" />
                <div className="flex items-center space-x-2">
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.assignee.name}</p>
                    <p className="text-xs text-gray-600">Responsável</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{new Date(task.createdAt).toLocaleDateString('pt-BR')}</p>
                  <p className="text-xs text-gray-600">Criado em</p>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h2>
            <div className="space-y-3">
              {task.history && task.history.length > 0 ? (
                task.history.map((item: any, index: number) => (
                  <div key={item.id || index} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.action}</p>
                      <p className="text-xs text-gray-600">{item.user}</p>
                      <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString('pt-BR')}</p>
                      {item.details && (
                        <p className="text-xs text-gray-600 mt-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Nenhum histórico disponível</p>
              )}
            </div>
          </div>

          {/* Registro de Tempo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Registro de Tempo</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Timer</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatTime(timerSeconds)}</p>
                </div>
                <div className="flex gap-2">
                  {isTimerRunning ? (
                    <>
                      <button
                        onClick={() => setIsTimerRunning(false)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
                      >
                        <Pause size={16} className="mr-2" />
                        Pausar
                      </button>
                      <button
                        onClick={handleTimerStop}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                      >
                        <Square size={16} className="mr-2" />
                        Parar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleTimerToggle}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Play size={16} className="mr-2" />
                      Iniciar Timer
                    </button>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Registrar Tempo Manualmente</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horas</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={timeLogHours}
                      onChange={(e) => setTimeLogHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      value={timeLogDescription}
                      onChange={(e) => setTimeLogDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Descreva o trabalho realizado..."
                    />
                  </div>
                  <button
                    onClick={handleLogTime}
                    disabled={!timeLogHours || parseFloat(timeLogHours) <= 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Clock size={16} className="mr-2" />
                    Registrar Tempo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Gerenciar Tags</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Digite uma nova tag..."
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {task.tags.length === 0 && (
                  <p className="text-gray-500 text-sm">Nenhuma tag adicionada ainda.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Anexos da Tarefa</h2>
                <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center">
                  <Plus size={20} className="mr-2" />
                  Adicionar Arquivo
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.doc,.docx,.xls,.xlsx,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-3">
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(attachment.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-sm text-gray-600">{attachment.size} • {attachment.uploadedBy} • {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-800 p-1">
                        <Download size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-800 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {task.attachments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Paperclip size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Nenhum arquivo anexado</p>
                    <p className="text-sm">Clique em "Adicionar Arquivo" para anexar documentos</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Pessoas Envolvidas</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newWatcher}
                    onChange={(e) => setNewWatcher(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddWatcher()}
                    placeholder="Digite o nome da pessoa..."
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddWatcher}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Responsável */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Responsável</h3>
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.assignee.name}</p>
                    <p className="text-sm text-gray-600">Responsável pela tarefa</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowReassignModal(true)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Reatribuir tarefa"
                    >
                      <Users size={16} />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 p-1">
                      <Mail size={16} />
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 p-1">
                      <Phone size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Observadores */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Observadores</h3>
                <div className="space-y-3">
                  {task.watchers.map((watcher) => (
                    <div key={watcher.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={watcher.avatar}
                        alt={watcher.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{watcher.name}</p>
                        <p className="text-sm text-gray-600">{watcher.role}</p>
                        <p className="text-xs text-gray-500">{watcher.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 p-1">
                          <Mail size={16} />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 p-1">
                          <Phone size={16} />
                        </button>
                        <button 
                          onClick={() => handleRemoveWatcher(watcher.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {task.watchers.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhum observador adicionado ainda.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showReassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Reatribuir Tarefa</h2>
                <button
                  onClick={() => setShowReassignModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Novo Responsável
                  </label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um usuário</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.fullName || user.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowReassignModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReassign}
                    disabled={!newAssigneeId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reatribuir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

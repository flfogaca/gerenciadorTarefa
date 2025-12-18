import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Calendar, 
  User, 
  Flag, 
  Clock,
  FileText,
  Tag,
  AlertCircle,
  Paperclip,
  Users,
  Plus,
  Eye,
  Download,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { taskStatusToLabel, labelToTaskStatus, taskPriorityToLabel, labelToTaskPriority } from '../utils/statusMapper';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em andamento': return 'bg-blue-100 text-blue-800';
    case 'Pendente': return 'bg-yellow-100 text-yellow-800';
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Pausado': return 'bg-gray-100 text-gray-800';
    case 'Cancelado': return 'bg-red-100 text-red-800';
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

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [task, setTask] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'tags' | 'attachments' | 'people'>('form');
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    estimatedHours: 0,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [newWatcher, setNewWatcher] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [taskRes, projectsRes, usersRes] = await Promise.all([
        apiService.getTask(id!),
        apiService.getProjects(),
        apiService.getUsers()
      ]);
      
      const taskData = (taskRes as any).task || taskRes;
      setTask(taskData);
      setProjects((projectsRes as any).projects || []);
      setUsers((usersRes as any).users || []);
      
      if (taskData) {
        setEditTask({
          title: taskData.title || '',
          description: taskData.description || '',
          projectId: taskData.projectId || taskData.project?.id || '',
          assigneeId: taskData.assigneeId || taskData.assignee?.id || taskData.assignee?.userId || '',
          status: taskData.status || 'TODO',
          priority: taskData.priority || 'MEDIUM',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '',
          estimatedHours: taskData.estimatedHours || 0,
          tags: taskData.tags || []
        });
      }
    } catch (error: any) {
      console.error('Error loading task data:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao carregar tarefa';
      showToast.error(`Erro: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editTask.title || !editTask.projectId || !editTask.assigneeId) {
      showToast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!id) {
      showToast.error('ID da tarefa não encontrado.');
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = {
        title: editTask.title,
        description: editTask.description || 'Sem descrição',
        assigneeId: editTask.assigneeId,
        priority: editTask.priority,
        dueDate: editTask.dueDate ? new Date(editTask.dueDate).toISOString() : undefined,
        estimatedHours: editTask.estimatedHours || undefined
      };

      await apiService.updateTask(id, payload);
      navigate(`/tarefas/${id}`);
    } catch (error: any) {
      console.error('Error updating task:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar tarefa';
      showToast.error(`Erro: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editTask.tags.includes(newTag.trim())) {
      setEditTask({ ...editTask, tags: [...editTask.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditTask({ ...editTask, tags: editTask.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      if (files && files.length > 0) {
        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('files', file);
        });
        try {
          await apiService.uploadTaskFiles(taskId, formData);
          showToast.success('Arquivos enviados com sucesso!');
        } catch (error) {
          console.error('Error uploading files:', error);
          showToast.error('Erro ao enviar arquivos');
        }
      }
    }
  };

  const handleAddWatcher = async () => {
    if (newWatcher.trim()) {
      if (newWatcher && taskId) {
        try {
          const watcherUser = users.find((u: any) => 
            u.name?.toLowerCase().includes(newWatcher.toLowerCase()) ||
            u.email?.toLowerCase().includes(newWatcher.toLowerCase())
          );
          if (watcherUser) {
            const currentWatchers = task?.watchers || [];
            if (!currentWatchers.find((w: any) => w.id === watcherUser.id)) {
              await apiService.updateTask(taskId, {
                watchers: [...currentWatchers, watcherUser]
              });
              showToast.success('Observador adicionado!');
            }
          }
        } catch (error) {
          console.error('Error adding watcher:', error);
        }
      }
      setNewWatcher('');
    }
  };

  const handleRemoveWatcher = async (watcherId: number) => {
    if (watcherId && taskId) {
      try {
        const currentWatchers = task?.watchers || [];
        await apiService.updateTask(taskId, {
          watchers: currentWatchers.filter((w: any) => w.id !== watcherId)
        });
        await loadTask();
      } catch (error) {
        console.error('Error removing watcher:', error);
      }
    }
  };

  const selectedProject = projects.find(p => (p.id || p.projectId) === editTask.projectId);
  const selectedAssignee = users.find(u => (u.id || u.userId) === editTask.assigneeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tarefa...</p>
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
            onClick={() => navigate(`/tarefas/${id}`)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{task.taskId || task.code || `TSK-${task.id}`}</h1>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(taskStatusToLabel[task.status] || task.status)}`}>
                {taskStatusToLabel[task.status] || task.status}
              </span>
            </div>
            <p className="text-gray-600">Editar tarefa</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/tarefas/${id}`)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <X size={20} className="mr-2" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Sistema de Abas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'form'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              Formulário
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
          {activeTab === 'form' && (
            <div className="space-y-6">
              {/* Conteúdo do formulário - mantém o conteúdo atual */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulário Principal */}
                <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  value={editTask.title}
                  onChange={(e) => setEditTask({...editTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o título da tarefa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={editTask.description}
                  onChange={(e) => setEditTask({...editTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Descreva os detalhes da tarefa"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Projeto *
                  </label>
                  <select
                    value={editTask.projectId}
                    onChange={(e) => setEditTask({...editTask, projectId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um projeto</option>
                    {projects.map(project => (
                      <option key={project.id || project.projectId} value={project.id || project.projectId}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável *
                  </label>
                  <select
                    value={editTask.assigneeId}
                    onChange={(e) => setEditTask({...editTask, assigneeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um responsável</option>
                    {users.map(user => (
                      <option key={user.id || user.userId} value={user.userId || user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editTask.status}
                    onChange={(e) => setEditTask({...editTask, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="TODO">Pendente</option>
                    <option value="IN_PROGRESS">Em andamento</option>
                    <option value="REVIEW">Em Revisão</option>
                    <option value="DONE">Concluído</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={editTask.priority}
                    onChange={(e) => setEditTask({...editTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={editTask.dueDate}
                    onChange={(e) => setEditTask({...editTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas Estimadas
                </label>
                <input
                  type="number"
                  value={editTask.estimatedHours}
                  onChange={(e) => setEditTask({...editTask, estimatedHours: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite uma tag e pressione Enter"
                />
                <button
                  onClick={handleAddTag}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Tag size={20} className="mr-2" />
                  Adicionar
                </button>
              </div>

              {editTask.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editTask.tags.map((tag, index) => (
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resumo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {editTask.title || 'Sem título'}
                  </p>
                  <p className="text-xs text-gray-600">Título</p>
                </div>
              </div>

              {selectedProject && (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.name}</p>
                    <p className="text-xs text-gray-600">Projeto</p>
                  </div>
                </div>
              )}

              {selectedAssignee && (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {selectedAssignee.firstName?.[0] || ''}{selectedAssignee.lastName?.[0] || ''}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedAssignee.firstName} {selectedAssignee.lastName}
                    </p>
                    <p className="text-xs text-gray-600">Responsável</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Flag size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {taskPriorityToLabel[editTask.priority] || editTask.priority}
                  </p>
                  <p className="text-xs text-gray-600">Prioridade</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">S</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {taskStatusToLabel[editTask.status] || editTask.status}
                  </p>
                  <p className="text-xs text-gray-600">Status</p>
                </div>
              </div>

              {editTask.dueDate && (
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(editTask.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600">Vencimento</p>
                  </div>
                </div>
              )}

              {editTask.estimatedHours > 0 && (
                <div className="flex items-center space-x-3">
                  <Clock size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{editTask.estimatedHours}h</p>
                    <p className="text-xs text-gray-600">Estimativa</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags Preview */}
          {editTask.tags.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {editTask.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Informações da Tarefa */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Tarefa</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">Criado em</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.attachments?.length || 0}</p>
                  <p className="text-xs text-gray-600">Anexos</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.comments?.length || 0}</p>
                  <p className="text-xs text-gray-600">Comentários</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.completedHours || 0}h</p>
                  <p className="text-xs text-gray-600">Horas trabalhadas</p>
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
                {editTask.tags.map((tag, index) => (
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
                {editTask.tags.length === 0 && (
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
                {task.attachments && task.attachments.length > 0 ? (
                  task.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(attachment.type || attachment.fileType || 'file')}</span>
                        <div>
                          <p className="font-medium text-gray-900">{attachment.name || attachment.fileName}</p>
                          <p className="text-sm text-gray-600">
                            {attachment.size || 'N/A'} • {attachment.uploadedBy || 'N/A'} • {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleDateString('pt-BR') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {attachment.url && (
                          <>
                            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 p-1">
                              <Eye size={16} />
                            </a>
                            <a href={attachment.url} download className="text-green-600 hover:text-green-800 p-1">
                              <Download size={16} />
                            </a>
                          </>
                        )}
                        <button className="text-red-600 hover:text-red-800 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
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
                {selectedAssignee ? (
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm text-white font-medium">
                        {selectedAssignee.firstName?.[0] || ''}{selectedAssignee.lastName?.[0] || ''}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {selectedAssignee.firstName} {selectedAssignee.lastName}
                      </p>
                      <p className="text-sm text-gray-600">Responsável pela tarefa</p>
                      <p className="text-xs text-gray-500">{selectedAssignee.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a href={`mailto:${selectedAssignee.email}`} className="text-blue-600 hover:text-blue-800 p-1">
                        <Mail size={16} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum responsável atribuído.</p>
                )}
              </div>

              {/* Observadores */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Observadores</h3>
                <div className="space-y-3">
                  {task.watchers && task.watchers.length > 0 ? (
                    task.watchers.map((watcherId: string) => {
                      const watcher = users.find(u => (u.id || u.userId) === watcherId);
                      if (!watcher) return null;
                      return (
                        <div key={watcherId} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-sm text-white font-medium">
                              {watcher.firstName?.[0] || ''}{watcher.lastName?.[0] || ''}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {watcher.firstName} {watcher.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{watcher.role}</p>
                            <p className="text-xs text-gray-500">{watcher.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a href={`mailto:${watcher.email}`} className="text-blue-600 hover:text-blue-800 p-1">
                              <Mail size={16} />
                            </a>
                            <button 
                              onClick={() => handleRemoveWatcher(watcherId)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhum observador adicionado ainda.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

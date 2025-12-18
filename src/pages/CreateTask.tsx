import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Calendar, 
  User, 
  Flag, 
  Clock,
  FileText,
  Tag
} from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { labelToTaskPriority } from '../utils/statusMapper';

export default function CreateTask() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    priority: 'MEDIUM',
    dueDate: '',
    estimatedHours: 0,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [projectsRes, usersRes] = await Promise.all([
        apiService.getProjects(),
        apiService.getUsers()
      ]);
      setProjects(projectsRes.projects || []);
      setUsers(usersRes.users || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newTask.title || !newTask.projectId || !newTask.assigneeId) {
      showToast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!user) {
      showToast.error('Usuário não autenticado.');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: newTask.title,
        description: newTask.description || 'Sem descrição',
        projectId: newTask.projectId,
        assigneeId: newTask.assigneeId,
        reporterId: user.userId || user.id,
        priority: newTask.priority,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        estimatedHours: newTask.estimatedHours || undefined
      };

      await apiService.createTask(payload);
      navigate('/tarefas');
    } catch (error: any) {
      console.error('Error creating task:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao criar tarefa';
      showToast.error(`Erro: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newTask.tags.includes(newTag.trim())) {
      setNewTask({ ...newTask, tags: [...newTask.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTask({ ...newTask, tags: newTask.tags.filter(tag => tag !== tagToRemove) });
  };

  const selectedProject = projects.find(p => p.id === newTask.projectId || p.projectId === newTask.projectId);
  const selectedAssignee = users.find(u => u.userId === newTask.assigneeId || u.id === newTask.assigneeId);

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
            <h1 className="text-2xl font-bold text-gray-900">Nova Tarefa</h1>
            <p className="text-gray-600">Crie uma nova tarefa para seu projeto</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/tarefas')}
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
            {isSaving ? 'Salvando...' : 'Salvar Tarefa'}
          </button>
        </div>
      </div>

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
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o título da tarefa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
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
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
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
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}
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
                    Prioridade
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
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
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas Estimadas
                  </label>
                  <input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    placeholder="0"
                  />
                </div>
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

              {newTask.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newTask.tags.map((tag, index) => (
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
                    {newTask.title || 'Sem título'}
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
                      {selectedAssignee.firstName?.[0]}{selectedAssignee.lastName?.[0]}
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
                    {newTask.priority === 'LOW' ? 'Baixa' : 
                     newTask.priority === 'MEDIUM' ? 'Média' :
                     newTask.priority === 'HIGH' ? 'Alta' : 'Urgente'}
                  </p>
                  <p className="text-xs text-gray-600">Prioridade</p>
                </div>
              </div>

              {newTask.dueDate && (
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(newTask.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600">Vencimento</p>
                  </div>
                </div>
              )}

              {newTask.estimatedHours > 0 && (
                <div className="flex items-center space-x-3">
                  <Clock size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{newTask.estimatedHours}h</p>
                    <p className="text-xs text-gray-600">Estimativa</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags Preview */}
          {newTask.tags.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {newTask.tags.map((tag, index) => (
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
        </div>
      </div>
    </div>
  );
}

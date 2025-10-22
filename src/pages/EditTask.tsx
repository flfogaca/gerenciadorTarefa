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

const mockUsers = [
  { id: 1, name: 'Pedro Costa', email: 'pedro@gestorpro.com', avatar: 'PC', role: 'Funcionário' },
  { id: 2, name: 'Maria Santos', email: 'maria@gestorpro.com', avatar: 'MS', role: 'Gestor' },
  { id: 3, name: 'Ana Oliveira', email: 'ana@gestorpro.com', avatar: 'AO', role: 'Diretor' },
  { id: 4, name: 'João Silva', email: 'joao@gestorpro.com', avatar: 'JS', role: 'Administrador' }
];

const mockProjects = [
  { id: 1, name: 'Evento Corporativo Q1', color: 'blue' },
  { id: 2, name: 'Lançamento Produto', color: 'green' },
  { id: 3, name: 'Workshop Digital', color: 'purple' },
  { id: 4, name: 'Sistema Interno', color: 'orange' }
];

const mockTask = {
  id: 1,
  code: 'TSK-001',
  title: 'Criar apresentação do projeto',
  description: 'Desenvolver apresentação completa para o cliente TechCorp',
  project: 'Evento Corporativo Q1',
  assignee: { id: 1, name: 'Pedro Costa', avatar: 'PC' },
  status: 'Em andamento',
  priority: 'Alta',
  dueDate: '2024-01-25',
  createdDate: '2024-01-15',
  tags: ['apresentação', 'cliente'],
  watchers: [
    {
      id: 1,
      name: 'Maria Santos',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      role: 'Gestor',
      email: 'maria@gestorpro.com',
      phone: '(11) 99999-9999'
    },
    {
      id: 2,
      name: 'Carlos Lima',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      role: 'Cliente',
      email: 'carlos@techcorp.com',
      phone: '(11) 88888-8888'
    }
  ],
  attachments: [
    {
      id: 1,
      name: 'briefing_projeto.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedAt: '2024-01-15',
      uploadedBy: 'Maria Santos'
    },
    {
      id: 2,
      name: 'referencias_design.ai',
      type: 'ai',
      size: '15.2 MB',
      uploadedAt: '2024-01-16',
      uploadedBy: 'Pedro Costa'
    },
    {
      id: 3,
      name: 'logo_conceito.png',
      type: 'png',
      size: '1.8 MB',
      uploadedAt: '2024-01-17',
      uploadedBy: 'Pedro Costa'
    }
  ],
  comments: 5,
  progress: 65,
  estimatedHours: 8,
  completedHours: 5
};

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
  const [isSaving, setIsSaving] = useState(false);
  const [task, setTask] = useState(mockTask);
  const [activeTab, setActiveTab] = useState<'form' | 'tags' | 'attachments' | 'people'>('form');
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    status: 'Pendente',
    priority: 'Média',
    dueDate: '',
    estimatedHours: 0,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [newWatcher, setNewWatcher] = useState('');

  useEffect(() => {
    if (task) {
      setEditTask({
        title: task.title,
        description: task.description,
        project: task.project,
        assignee: task.assignee.id.toString(),
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours,
        tags: task.tags
      });
    }
  }, [task]);

  const handleSave = async () => {
    if (!editTask.title || !editTask.project || !editTask.assignee) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    
    // Simular salvamento
    setTimeout(() => {
      console.log('Tarefa atualizada:', {
        ...task,
        ...editTask,
        assignee: mockUsers.find(u => u.id.toString() === editTask.assignee)
      });
      setIsSaving(false);
      navigate(`/tarefas/${id}`);
    }, 1000);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log('Upload de arquivos:', files);
    }
  };

  const handleAddWatcher = () => {
    if (newWatcher.trim()) {
      console.log('Adicionando observador:', newWatcher);
      setNewWatcher('');
    }
  };

  const handleRemoveWatcher = (watcherId: number) => {
    console.log('Removendo observador:', watcherId);
  };

  const selectedProject = mockProjects.find(p => p.name === editTask.project);
  const selectedAssignee = mockUsers.find(u => u.id.toString() === editTask.assignee);

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
              <h1 className="text-2xl font-bold text-gray-900">{task.code}</h1>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                {task.status}
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
                    value={editTask.project}
                    onChange={(e) => setEditTask({...editTask, project: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um projeto</option>
                    {mockProjects.map(project => (
                      <option key={project.id} value={project.name}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável *
                  </label>
                  <select
                    value={editTask.assignee}
                    onChange={(e) => setEditTask({...editTask, assignee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um responsável</option>
                    {mockUsers.map(user => (
                      <option key={user.id} value={user.id.toString()}>{user.name}</option>
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
                    <option value="Pendente">Pendente</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
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
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
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
                  <div className={`w-5 h-5 rounded-full bg-${selectedProject.color}-500`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedProject.name}</p>
                    <p className="text-xs text-gray-600">Projeto</p>
                  </div>
                </div>
              )}

              {selectedAssignee && (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{selectedAssignee.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedAssignee.name}</p>
                    <p className="text-xs text-gray-600">Responsável</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Flag size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{editTask.priority}</p>
                  <p className="text-xs text-gray-600">Prioridade</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">S</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{editTask.status}</p>
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
                    {new Date(task.createdDate).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-600">Criado em</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.attachments.length}</p>
                  <p className="text-xs text-gray-600">Anexos</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.comments}</p>
                  <p className="text-xs text-gray-600">Comentários</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.completedHours}h</p>
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
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm text-white font-medium">{task.assignee.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.assignee.name}</p>
                    <p className="text-sm text-gray-600">Responsável pela tarefa</p>
                  </div>
                  <div className="flex items-center space-x-2">
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
    </div>
  );
}

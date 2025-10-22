import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  Users, 
  Flag, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  MoreHorizontal,
  User,
  Tag,
  Paperclip,
  MessageSquare,
  BarChart3,
  X,
  Save,
  RotateCcw
} from 'lucide-react';

const mockTasks = [
  {
    id: 1,
    title: 'Criar apresentação do projeto',
    description: 'Desenvolver apresentação completa para o cliente TechCorp',
    project: 'Evento Corporativo Q1',
    assignee: { id: 1, name: 'Pedro Costa', avatar: 'PC' },
    status: 'Em andamento',
    priority: 'Alta',
    dueDate: '2024-01-25',
    createdDate: '2024-01-15',
    tags: ['apresentação', 'cliente'],
    attachments: 3,
    comments: 5,
    progress: 65,
    estimatedHours: 8,
    completedHours: 5
  },
  {
    id: 2,
    title: 'Revisar cronograma de atividades',
    description: 'Atualizar cronograma baseado nas mudanças do cliente',
    project: 'Lançamento Produto',
    assignee: { id: 2, name: 'Maria Santos', avatar: 'MS' },
    status: 'Pendente',
    priority: 'Média',
    dueDate: '2024-01-28',
    createdDate: '2024-01-18',
    tags: ['cronograma', 'planejamento'],
    attachments: 1,
    comments: 2,
    progress: 0,
    estimatedHours: 4,
    completedHours: 0
  },
  {
    id: 3,
    title: 'Preparar material de treinamento',
    description: 'Criar conteúdo e materiais para workshop digital',
    project: 'Workshop Digital',
    assignee: { id: 3, name: 'Ana Oliveira', avatar: 'AO' },
    status: 'Concluído',
    priority: 'Baixa',
    dueDate: '2024-01-20',
    createdDate: '2024-01-10',
    tags: ['treinamento', 'conteúdo'],
    attachments: 7,
    comments: 8,
    progress: 100,
    estimatedHours: 6,
    completedHours: 6
  },
  {
    id: 4,
    title: 'Atualizar documentação técnica',
    description: 'Revisar e atualizar toda documentação do sistema',
    project: 'Sistema Interno',
    assignee: { id: 1, name: 'Pedro Costa', avatar: 'PC' },
    status: 'Em andamento',
    priority: 'Média',
    dueDate: '2024-01-30',
    createdDate: '2024-01-22',
    tags: ['documentação', 'técnico'],
    attachments: 2,
    comments: 3,
    progress: 25,
    estimatedHours: 12,
    completedHours: 3
  }
];

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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Alta': return 'bg-red-100 text-red-800';
    case 'Média': return 'bg-yellow-100 text-yellow-800';
    case 'Baixa': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'Alta': return '🔴';
    case 'Média': return '🟡';
    case 'Baixa': return '🟢';
    default: return '⚪';
  }
};

export default function GerenciarTarefas() {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [draggedTask, setDraggedTask] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [showQuickCreate, setShowQuickCreate] = useState<string | null>(null);
  const [quickCreateTitle, setQuickCreateTitle] = useState('');
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [selectedTaskForView, setSelectedTaskForView] = useState<any>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<any>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    priority: 'Média',
    dueDate: '',
    estimatedHours: 0
  });

  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    status: 'Pendente',
    priority: 'Média',
    dueDate: '',
    estimatedHours: 0
  });

  useEffect(() => {
    const modal = searchParams.get('modal');
    if (modal === 'new-task') {
      setShowCreateModal(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.project || !newTask.assignee) return;

    const assignee = mockUsers.find(u => u.id.toString() === newTask.assignee);
    const project = mockProjects.find(p => p.id.toString() === newTask.project);

    const task = {
      id: tasks.length + 1,
      title: newTask.title,
      description: newTask.description,
      project: project?.name || '',
      assignee: assignee || mockUsers[0],
      status: 'Pendente',
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      tags: [],
      attachments: 0,
      comments: 0,
      progress: 0,
      estimatedHours: newTask.estimatedHours,
      completedHours: 0
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      project: '',
      assignee: '',
      priority: 'Média',
      dueDate: '',
      estimatedHours: 0
    });
    setShowCreateModal(false);
  };

  const handleUpdateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask) {
      setTasks(tasks.map(task => 
        task.id === draggedTask ? { ...task, status: newStatus } : task
      ));
      setDraggedTask(null);
    }
  };

  const handleInlineEdit = (task: typeof mockTasks[0]) => {
    setEditingTask(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description);
  };

  const handleSaveEdit = () => {
    if (editingTask) {
      setTasks(tasks.map(task => 
        task.id === editingTask 
          ? { ...task, title: editingTitle, description: editingDescription }
          : task
      ));
      setEditingTask(null);
      setEditingTitle('');
      setEditingDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditingTitle('');
    setEditingDescription('');
  };

  const handleQuickCreate = (status: string) => {
    if (!quickCreateTitle.trim()) return;
    
    const task = {
      id: tasks.length + 1,
      title: quickCreateTitle,
      description: '',
      project: 'Novo Projeto',
      assignee: mockUsers[0],
      status: status,
      priority: 'Média',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      tags: [],
      attachments: 0,
      comments: 0,
      progress: 0,
      estimatedHours: 4,
      completedHours: 0
    };

    setTasks([...tasks, task]);
    setQuickCreateTitle('');
    setShowQuickCreate(null);
  };

  const handleViewTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskForView(task);
      setShowViewModal(true);
    }
  };

  const handleEditTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskForEdit(task);
      setEditTask({
        title: task.title,
        description: task.description,
        project: task.project,
        assignee: task.assignee.id.toString(),
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours
      });
      setShowEditModal(true);
    }
  };

  const handleUpdateTask = () => {
    if (!editTask.title || !editTask.project || !editTask.assignee) return;

    const assignee = mockUsers.find(u => u.id.toString() === editTask.assignee);
    
    setTasks(tasks.map(task => 
      task.id === selectedTaskForEdit.id 
        ? {
            ...task,
            title: editTask.title,
            description: editTask.description,
            project: editTask.project,
            assignee: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : task.assignee,
            status: editTask.status,
            priority: editTask.priority,
            dueDate: editTask.dueDate,
            estimatedHours: editTask.estimatedHours
          }
        : task
    ));

    setShowEditModal(false);
    setSelectedTaskForEdit(null);
    setEditTask({
      title: '',
      description: '',
      project: '',
      assignee: '',
      status: 'Pendente',
      priority: 'Média',
      dueDate: '',
      estimatedHours: 0
    });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesAssignee = filterAssignee === 'all' || task.assignee.id.toString() === filterAssignee;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesAssignee && matchesSearch;
  });

  const tasksByStatus = {
    'Pendente': filteredTasks.filter(t => t.status === 'Pendente'),
    'Em andamento': filteredTasks.filter(t => t.status === 'Em andamento'),
    'Concluído': filteredTasks.filter(t => t.status === 'Concluído')
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerenciar Tarefas</h1>
        <p className="text-gray-600 mt-2">Crie, atribua e acompanhe tarefas dos seus projetos</p>
      </div>

      {/* Header com controles */}
      <div className="card animate-slide-up delay-100">
        <div className="flex flex-col gap-4">
          {/* Primeira linha - Busca */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
              
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Responsáveis</option>
                {mockUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Segunda linha - Controles */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Kanban
              </button>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center justify-center w-full sm:w-auto"
            >
              <Plus size={18} className="mr-2" />
              Nova Tarefa
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-slide-up delay-200">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Tarefas</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Andamento</p>
              <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'Em andamento').length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'Concluído').length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'Pendente').length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Visualização */}
      {viewMode === 'list' ? (
        <div className="card animate-slide-up delay-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarefa</th>
                  <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                  <th className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="hidden lg:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                  <th className="hidden md:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
                  <th className="hidden lg:table-cell px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedTask === task.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                  >
                    <td className="px-2 sm:px-3 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                        <div className="hidden sm:flex items-center mt-1 space-x-1">
                          {task.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                          )}
                        </div>
                        <div className="sm:hidden mt-1">
                          <span className="text-xs text-gray-500">{task.project}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 py-3 text-sm text-gray-900">{task.project}</td>
                    <td className="hidden md:table-cell px-3 py-3">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white font-semibold text-xs">{task.assignee.avatar}</span>
                        </div>
                        <span className="text-sm text-gray-900">{task.assignee.name}</span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-3">
                      <div className="flex items-center">
                        <span className="mr-1">{getPriorityIcon(task.priority)}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 py-3 text-sm text-gray-900">
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="hidden lg:table-cell px-3 py-3">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-3">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTask(task.id);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Visualizar"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task.id);
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up delay-300">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div 
              key={status} 
              className={`card transition-all duration-200 ${
                dragOverColumn === status ? 'drag-over' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{status}</h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                    {statusTasks.length}
                  </span>
                  <button
                    onClick={() => setShowQuickCreate(status)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Adicionar tarefa rápida"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {/* Campo de criação rápida */}
              {showQuickCreate === status && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="text"
                    value={quickCreateTitle}
                    onChange={(e) => setQuickCreateTitle(e.target.value)}
                    placeholder="Título da tarefa..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleQuickCreate(status);
                      } else if (e.key === 'Escape') {
                        setShowQuickCreate(null);
                        setQuickCreateTitle('');
                      }
                    }}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowQuickCreate(null);
                        setQuickCreateTitle('');
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleQuickCreate(status)}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Criar
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {statusTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer ${
                      draggedTask === task.id ? 'dragging' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                  >
                    {editingTask === task.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                          autoFocus
                        />
                        <textarea
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          rows={2}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-400 hover:text-green-600"
                          >
                            <Save size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 flex-1">{task.title}</h4>
                          <div className="flex items-center space-x-1 ml-2">
                            <span className="text-lg">{getPriorityIcon(task.priority)}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTask(task.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task.id);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Editar"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-2">
                              <span className="text-white font-semibold text-xs">{task.assignee.avatar}</span>
                            </div>
                            <span className="text-xs text-gray-600">{task.assignee.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{task.project}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Paperclip size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{task.attachments}</span>
                            <MessageSquare size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{task.comments}</span>
                          </div>
                        </div>
                        
                        {task.progress > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">Progresso</span>
                              <span className="text-xs text-gray-600">{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-blue-600 h-1 rounded-full" 
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Nova Tarefa</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título da Tarefa</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o título da tarefa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva a tarefa em detalhes"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Projeto</label>
                    <select
                      value={newTask.project}
                      onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um projeto</option>
                      {mockProjects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsável</label>
                    <select
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um responsável</option>
                      {mockUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prazo</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horas Estimadas</label>
                    <input
                      type="number"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTask}
                  className="btn-primary w-full sm:w-auto"
                >
                  Criar Tarefa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewModal && selectedTaskForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Detalhes da Tarefa</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedTaskForView.title}</h3>
                  <p className="text-gray-600">{selectedTaskForView.description || 'Sem descrição'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
                    <p className="text-gray-900">{selectedTaskForView.project}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                    <p className="text-gray-900">{selectedTaskForView.assignee.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTaskForView.status)}`}>
                      {selectedTaskForView.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTaskForView.priority)}`}>
                      {selectedTaskForView.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                    <p className="text-gray-900">{new Date(selectedTaskForView.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horas Estimadas</label>
                    <p className="text-gray-900">{selectedTaskForView.estimatedHours}h</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progresso</label>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${selectedTaskForView.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{selectedTaskForView.progress}%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditTask(selectedTaskForView.id);
                  }}
                  className="btn-primary"
                >
                  Editar Tarefa
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-secondary"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && selectedTaskForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Editar Tarefa</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    value={editTask.title}
                    onChange={(e) => setEditTask({...editTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o título da tarefa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={editTask.description}
                    onChange={(e) => setEditTask({...editTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Digite a descrição da tarefa"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Projeto *</label>
                    <input
                      type="text"
                      value={editTask.project}
                      onChange={(e) => setEditTask({...editTask, project: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do projeto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
                    <select
                      value={editTask.assignee}
                      onChange={(e) => setEditTask({...editTask, assignee: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um responsável</option>
                      {mockUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editTask.status}
                      onChange={(e) => setEditTask({...editTask, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select
                      value={editTask.priority}
                      onChange={(e) => setEditTask({...editTask, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                    <input
                      type="date"
                      value={editTask.dueDate}
                      onChange={(e) => setEditTask({...editTask, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horas Estimadas</label>
                    <input
                      type="number"
                      value={editTask.estimatedHours}
                      onChange={(e) => setEditTask({...editTask, estimatedHours: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateTask}
                  className="btn-primary"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

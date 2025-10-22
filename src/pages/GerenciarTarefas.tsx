import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    attachments: 3,
    comments: 5,
    progress: 65,
    estimatedHours: 8,
    completedHours: 5
  },
  {
    id: 2,
    code: 'TSK-002',
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
    code: 'TSK-003',
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
    code: 'TSK-004',
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
    case 'Alta': return 'text-red-600';
    case 'Média': return 'text-yellow-600';
    case 'Baixa': return 'text-green-600';
    default: return 'text-gray-600';
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
  const navigate = useNavigate();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [columns, setColumns] = useState(['Pendente', 'Em andamento', 'Concluído']);
  
  const [selectedTaskForView, setSelectedTaskForView] = useState<any>(null);

  useEffect(() => {
    const modal = searchParams.get('modal');
    if (modal === 'new-task') {
      navigate('/tarefas/nova');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, navigate]);

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
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask) {
      handleUpdateTaskStatus(draggedTask, status);
      setDraggedTask(null);
    }
    setDragOverColumn(null);
  };

  const handleInlineEdit = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, title: editingTitle, description: editingDescription }
        : task
    ));
    setEditingTask(null);
    setEditingTitle('');
    setEditingDescription('');
  };

  const handleQuickCreate = (status: string) => {
    if (!quickCreateTitle.trim()) return;

    const task = {
      id: Math.max(...tasks.map(t => t.id)) + 1,
      code: `TSK-${String(Math.max(...tasks.map(t => t.id)) + 1).padStart(3, '0')}`,
      title: quickCreateTitle,
      description: '',
      project: 'Projeto Rápido',
      assignee: { id: 1, name: 'Usuário Atual', avatar: 'UA' },
      status: status,
      priority: 'Média',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      tags: [],
      attachments: 0,
      comments: 0,
      progress: 0,
      estimatedHours: 1,
      completedHours: 0
    };

    setTasks([...tasks, task]);
    setQuickCreateTitle('');
    setShowQuickCreate(null);
  };

  const handleViewTask = (taskId: number) => {
    navigate(`/tarefas/${taskId}`);
  };

  const handleCreateTask = () => {
    navigate('/tarefas/nova');
  };

  const handleEditTask = (taskId: number) => {
    navigate(`/tarefas/${taskId}/editar`);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    
    if (columns.includes(newColumnName)) {
      alert('Já existe um quadro com esse nome!');
      return;
    }
    
    setColumns([...columns, newColumnName]);
    setNewColumnName('');
    setShowAddColumnModal(false);
  };

  const handleDeleteColumn = (columnName: string) => {
    if (columns.length <= 1) {
      alert('Não é possível excluir o último quadro!');
      return;
    }
    
    // Mover tarefas deste quadro para o primeiro quadro disponível
    const targetColumn = columns.find(col => col !== columnName);
    if (targetColumn) {
      setTasks(tasks.map(task => 
        task.status === columnName 
          ? { ...task, status: targetColumn }
          : task
      ));
    }
    
    setColumns(columns.filter(col => col !== columnName));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesAssignee = filterAssignee === 'all' || task.assignee.id.toString() === filterAssignee;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesAssignee && matchesSearch;
  });

  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column] = filteredTasks.filter(t => t.status === column);
    return acc;
  }, {} as Record<string, typeof filteredTasks>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerenciar Tarefas</h1>
        <p className="text-gray-600 mt-2">Crie, atribua e acompanhe tarefas dos seus projetos</p>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-slide-up delay-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              {columns.map(column => (
                <option key={column} value={column}>{column}</option>
              ))}
            </select>
            
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Responsáveis</option>
              {mockUsers.map(user => (
                <option key={user.id} value={user.id.toString()}>{user.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Kanban
              </button>
            </div>
            
            <button
              onClick={handleCreateTask}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Nova Tarefa
            </button>
          </div>
        </div>
      </div>

      {/* Visualização */}
      {viewMode === 'list' ? (
        <div className="space-y-4 animate-slide-up delay-200">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedTask(task.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Informações principais */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">{task.assignee.avatar}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{task.code}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Projeto:</span>
                            <span>{task.project}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Responsável:</span>
                            <span>{task.assignee.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status, prioridade e progresso */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)} {task.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{task.progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTask(task.id);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTask(task.id);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-slide-up delay-300">
          {/* Botão para adicionar novo quadro - na parte de cima */}
          <div className="mb-4">
            <button
              onClick={() => setShowAddColumnModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Adicionar Quadro
            </button>
          </div>

          {/* Grid com 3 colunas fixas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div 
                key={status} 
                className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-200 ${
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
                    {columns.length > 1 && (
                      <button
                        onClick={() => handleDeleteColumn(status)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir quadro"
                      >
                        <X size={14} />
                      </button>
                    )}
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
                      placeholder="Nome da tarefa..."
                      className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleQuickCreate(status)}
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => {
                          setShowQuickCreate(null);
                          setQuickCreateTitle('');
                        }}
                        className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleQuickCreate(status)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
                      draggable
                      onDragStart={() => setDraggedTask(task.id)}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-move"
                    >
                      {editingTask === task.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                          />
                          <textarea
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingTask(null);
                                setEditingTitle('');
                                setEditingDescription('');
                              }}
                              className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleInlineEdit(task.id)}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{task.code}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                            </div>
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
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
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
                          
                          <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-medium">{task.assignee.avatar}</span>
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
                  <p className="text-gray-600">{selectedTaskForView.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
                    <p className="text-gray-900">{selectedTaskForView.project}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTaskForView.status)}`}>
                      {selectedTaskForView.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">{selectedTaskForView.assignee.avatar}</span>
                      </div>
                      <span className="text-gray-900">{selectedTaskForView.assignee.name}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <span className={`text-sm font-medium ${getPriorityColor(selectedTaskForView.priority)}`}>
                      {getPriorityIcon(selectedTaskForView.priority)} {selectedTaskForView.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prazo</label>
                    <p className="text-gray-900">{new Date(selectedTaskForView.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progresso</label>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${selectedTaskForView.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{selectedTaskForView.progress}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anexos</label>
                    <p className="text-gray-900">{selectedTaskForView.attachments}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comentários</label>
                    <p className="text-gray-900">{selectedTaskForView.comments}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditTask(selectedTaskForView.id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Quadro */}
      {showAddColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Novo Quadro</h2>
                <button
                  onClick={() => setShowAddColumnModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Quadro</label>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Em revisão, Teste, etc."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddColumnModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddColumn}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Quadro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
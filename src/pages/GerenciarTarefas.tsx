import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { showToast, showConfirm } from '../utils/toast';
import { taskStatusToLabel, taskPriorityToLabel } from '../utils/statusMapper';
import { usePagination } from '../hooks/usePagination';
import { Task } from '../types';
import { ExportButton } from '../components/ExportButton';
import { useTasks, useDeleteTask } from '../hooks/useTasks';
import { 
  Plus, 
  Calendar, 
  Eye,
  Edit,
  Trash2,
  Search,
  Paperclip,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';


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
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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
  
  const [selectedTaskForView] = useState<any>(null);

  const { data: tasks = [], isLoading, refetch } = useTasks();
  const deleteTaskMutation = useDeleteTask();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          apiService.getProjects(),
          apiService.getUsers()
        ]);
        setProjects((projectsRes as any)?.data?.projects || (projectsRes as any)?.projects || []);
        setUsers((usersRes as any)?.data?.users || (usersRes as any)?.users || []);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const modal = searchParams.get('modal');
    if (modal === 'new-task') {
      navigate('/tarefas/nova');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, navigate]);

  const mapStatusToApi = (status: string): string => {
    const statusMap: Record<string, string> = {
      'Pendente': 'TODO',
      'Em andamento': 'IN_PROGRESS',
      'Concluído': 'DONE',
      'A Iniciar': 'TODO',
      'Em Andamento': 'IN_PROGRESS',
      'TODO': 'TODO',
      'IN_PROGRESS': 'IN_PROGRESS',
      'DONE': 'DONE',
      'REVIEW': 'REVIEW',
      'CANCELLED': 'CANCELLED'
    };
    return statusMap[status] || status.toUpperCase();
  };

  const handleUpdateTaskStatus = async (taskId: number | string, newStatus: string) => {
    try {
      const apiStatus = mapStatusToApi(newStatus);
      await apiService.changeTaskStatus(String(taskId), apiStatus);
      refetch();
      showToast.success('Status da tarefa atualizado!');
    } catch (error: any) {
      console.error('Error updating task status:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao atualizar status da tarefa';
      showToast.error(message);
    }
  };

  const handleDeleteTask = async (taskId: number | string) => {
    const confirmed = await showConfirm('Tem certeza que deseja deletar esta tarefa? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    
    deleteTaskMutation.mutate(String(taskId));
  };


  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask) {
      await handleUpdateTaskStatus(draggedTask, status);
      setDraggedTask(null);
    }
    setDragOverColumn(null);
  };

  const handleInlineEdit = async (taskId: number | string) => {
    try {
      await apiService.updateTask(String(taskId), {
        title: editingTitle,
        description: editingDescription
      });
      setEditingTask(null);
      setEditingTitle('');
      setEditingDescription('');
      refetch();
      showToast.success('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.error('Error updating task:', error);
      showToast.error('Erro ao atualizar tarefa');
    }
  };

  const handleQuickCreate = async (status: string) => {
    if (!quickCreateTitle.trim()) return;

    try {
      const firstProject = projects.length > 0 ? projects[0] : null;
      const firstUser = users.length > 0 ? users[0] : null;
      
      const taskData = {
        title: quickCreateTitle,
        description: '',
        projectId: firstProject?.id || '',
        assigneeId: firstUser?.id || firstUser?.userId || '',
        status: mapStatusToApi(status),
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedHours: 1
      };

      await apiService.createTask(taskData);
      setQuickCreateTitle('');
      setShowQuickCreate(null);
      refetch();
      showToast.success('Tarefa criada com sucesso!');
    } catch (error: any) {
      console.error('Error creating quick task:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao criar tarefa';
      showToast.error(`Erro ao criar tarefa: ${message}`);
    }
  };

  const handleViewTask = (taskId: number) => {
    navigate(`/tarefas/${taskId}`);
  };

  const handleCreateTask = () => {
    navigate('/tarefas/nova');
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks as Task[];
    
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => {
        const taskStatusLabel = taskStatusToLabel[task.status] || task.status;
        return taskStatusLabel === filterStatus || task.status === filterStatus;
      });
    }
    
    if (filterAssignee !== 'all') {
      filtered = filtered.filter(task => 
        (task.assigneeId || task.assignee?.id)?.toString() === filterAssignee
      );
    }
    
    return filtered;
  }, [tasks, searchTerm, filterStatus, filterAssignee]);

  const handleEditTask = (taskId: number) => {
    navigate(`/tarefas/${taskId}/editar`);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    
    if (columns.includes(newColumnName)) {
      showToast.error('Já existe um quadro com esse nome!');
      return;
    }
    
    setColumns([...columns, newColumnName]);
    setNewColumnName('');
    setShowAddColumnModal(false);
  };

  const handleDeleteColumn = async (columnName: string) => {
    if (columns.length <= 1) {
      showToast.error('Não é possível excluir o último quadro!');
      return;
    }
    
    const targetColumn = columns.find(col => col !== columnName);
    if (targetColumn) {
      const tasksToUpdate = tasks.filter(task => {
        const taskStatusLabel = taskStatusToLabel[task.status] || task.status;
        return taskStatusLabel === columnName;
      });
      
      for (const task of tasksToUpdate) {
        try {
          const targetStatus = mapStatusToApi(targetColumn);
          await apiService.changeTaskStatus(String(task.id), targetStatus);
        } catch (error) {
          console.error(`Error updating task ${task.id}:`, error);
        }
      }
      
      refetch();
    }
    
    setColumns(columns.filter(col => col !== columnName));
  };

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedTasks,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage
  } = usePagination({
    items: filteredTasks,
    itemsPerPage: 10,
    initialPage: 1
  });

  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column] = filteredTasks.filter((t: Task) => {
        const taskStatusLabel = taskStatusToLabel[t.status] || t.status;
        return taskStatusLabel === column || t.status === column;
      });
      return acc;
    }, {} as Record<string, Task[]>);
  }, [filteredTasks, columns]);

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
              {users.map(user => (
                <option key={user.id || user.userId} value={(user.userId || user.id).toString()}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-3">
            {filteredTasks.length > 0 && viewMode === 'list' && (
              <ExportButton
                title="Relatório de Tarefas"
                data={filteredTasks.map(t => ({
                  title: t.title,
                  status: taskStatusToLabel[t.status] || t.status,
                  priority: taskPriorityToLabel[t.priority] || t.priority,
                  assignee: users.find(u => (u.id || u.userId) === (t.assigneeId || t.assignee?.id))?.firstName + ' ' + users.find(u => (u.id || u.userId) === (t.assigneeId || t.assignee?.id))?.lastName || 'N/A',
                  dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : 'N/A'
                }))}
                columns={['title', 'status', 'priority', 'assignee', 'dueDate']}
                columnLabels={{
                  title: 'Título',
                  status: 'Status',
                  priority: 'Prioridade',
                  assignee: 'Responsável',
                  dueDate: 'Prazo'
                }}
                variant="icon"
              />
            )}
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
          {paginatedTasks.map((task) => (
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
                      <span className="text-sm font-medium text-white">
                        {(() => {
                          const assignee = users.find(u => (u.id || u.userId) === (task.assigneeId || task.assignee?.id || task.assignee?.userId));
                          return assignee ? `${assignee.firstName?.[0] || ''}${assignee.lastName?.[0] || ''}`.toUpperCase() : 'N/A';
                        })()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{task.code || `TSK-${task.id}`}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(taskStatusToLabel[task.status] || task.status)}`}>
                            {taskStatusToLabel[task.status] || task.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Projeto:</span>
                            <span>{projects.find(p => (p.id || p.projectId) === (task.projectId || task.project?.id))?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Responsável:</span>
                            <span>{users.find(u => (u.id || u.userId) === (task.assigneeId || task.assignee?.id || task.assignee?.userId))?.firstName + ' ' + users.find(u => (u.id || u.userId) === (task.assigneeId || task.assignee?.id || task.assignee?.userId))?.lastName || 'N/A'}</span>
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
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(taskStatusToLabel[task.status] || task.status)}`}>
                      {taskStatusToLabel[task.status] || task.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(taskPriorityToLabel[task.priority] || task.priority)}`}>
                      {getPriorityIcon(taskPriorityToLabel[task.priority] || task.priority)} {taskPriorityToLabel[task.priority] || task.priority}
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
          
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> a{' '}
                <span className="font-medium">{Math.min(currentPage * 10, totalItems)}</span> de{' '}
                <span className="font-medium">{totalItems}</span> tarefas
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToFirstPage}
                  disabled={!hasPreviousPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Primeira
                </button>
                <button
                  onClick={previousPage}
                  disabled={!hasPreviousPage}
                  className="p-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-1 text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="p-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={!hasNextPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Última
                </button>
              </div>
            </div>
          )}
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
                                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{task.code || `TSK-${task.id}`}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(taskStatusToLabel[task.status] || task.status)}`}>
                                  {taskStatusToLabel[task.status] || task.status}
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
                          
                          <p className="text-xs text-gray-600 mb-3">{task.description || 'Sem descrição'}</p>
                          
                          <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-medium">
                                {(() => {
                                  const assignee = users.find(u => (u.id || u.userId) === (task.assigneeId || task.assignee?.id || task.assignee?.userId));
                                  return assignee ? `${assignee.firstName?.[0] || ''}${assignee.lastName?.[0] || ''}` : 'N/A';
                                })()}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600">
                              {(() => {
                                const assignee = users.find(u => (u.id || u.userId) === (task.assigneeId || task.assignee?.id || task.assignee?.userId));
                                return assignee ? `${assignee.firstName} ${assignee.lastName}` : 'N/A';
                              })()}
                            </span>
                          </div>
                            <span className="text-xs text-gray-500">{task.project}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Paperclip size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{task.attachments?.length || 0}</span>
                            <MessageSquare size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{task.comments?.length || 0}</span>
                          </div>
                          </div>
                          
                          {(task.progress || 0) > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Progresso</span>
                                <span className="text-xs text-gray-600">{task.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full" 
                                  style={{ width: `${task.progress || 0}%` }}
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
                        <span className="text-xs text-white font-medium">
                          {(() => {
                            const assignee = users.find(u => (u.id || u.userId) === (selectedTaskForView.assigneeId || selectedTaskForView.assignee?.id || selectedTaskForView.assignee?.userId));
                            return assignee ? `${assignee.firstName?.[0] || ''}${assignee.lastName?.[0] || ''}`.toUpperCase() : 'N/A';
                          })()}
                        </span>
                      </div>
                      <span className="text-gray-900">
                        {(() => {
                          const assignee = users.find(u => (u.id || u.userId) === (selectedTaskForView.assigneeId || selectedTaskForView.assignee?.id || selectedTaskForView.assignee?.userId));
                          return assignee ? `${assignee.firstName} ${assignee.lastName}` : 'N/A';
                        })()}
                      </span>
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
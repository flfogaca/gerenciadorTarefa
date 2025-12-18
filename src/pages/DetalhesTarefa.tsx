import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { taskStatusToLabel, taskPriorityToLabel, labelToTaskStatus } from '../utils/statusMapper';
import { 
  Calendar, 
  Clock, 
  User, 
  Flag, 
  MessageSquare, 
  Paperclip, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Play, 
  Pause,
  ArrowLeft,
  Tag,
  BarChart3,
  AlertCircle
} from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em andamento': return 'bg-blue-100 text-blue-800';
    case 'Pendente': return 'bg-yellow-100 text-yellow-800';
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Pausado': return 'bg-gray-100 text-gray-800';
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

export default function DetalhesTarefa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [assignee, setAssignee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setIsLoading(true);
      const taskRes = await apiService.getTask(id!);
      const taskData = taskRes?.data?.task || taskRes?.data;
      
      if (taskData) {
        setTask(taskData);
        
        if (taskData.projectId) {
          const projectRes = await apiService.getProject(taskData.projectId);
          setProject(projectRes?.data?.project || projectRes?.data);
        }
        
        if (taskData.assigneeId) {
          const usersRes = await apiService.getUsers();
          const users = usersRes?.data?.users || [];
          const assigneeUser = users.find((u: any) => u.id === taskData.assigneeId);
          setAssignee(assigneeUser);
        }
      }
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    try {
      await apiService.addTaskComment(id, {
        content: newComment,
        userId: user?.id || ''
      });
      setNewComment('');
      await loadTask();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Erro ao adicionar comentário');
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !id) return;
    try {
      const updatedSubtasks = [...(task?.subtasks || []), {
        title: newSubtask,
        completed: false
      }];
      await apiService.updateTask(id, { subtasks: updatedSubtasks });
      setNewSubtask('');
      setShowAddSubtask(false);
      await loadTask();
    } catch (error) {
      console.error('Error adding subtask:', error);
      alert('Erro ao adicionar subtarefa');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id) return;
    try {
      const apiStatus = labelToTaskStatus(newStatus);
      await apiService.changeTaskStatus(id, apiStatus);
      loadTask();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const handleDeleteTask = async () => {
    if (!id || !confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await apiService.deleteTask(id);
      navigate('/tarefas');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Erro ao excluir tarefa');
    }
  };

  const handleEditTask = () => {
    if (id) {
      navigate(`/tarefas/${id}/editar`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Tarefa não encontrada</div>
      </div>
    );
  }

  const status = taskStatusToLabel(task.status);
  const priority = taskPriorityToLabel(task.priority);
  const estimatedHours = parseFloat(task.estimatedHours || '0');
  const completedHours = parseFloat(task.timeLogged?.totalHours || '0');
  const progress = estimatedHours > 0 ? Math.round((completedHours / estimatedHours) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/tarefas')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-600 mt-1">Projeto: {project?.name || task.projectId || '-'}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStartTimer}
              className={`btn-primary flex items-center ${
                isTimerActive ? 'bg-red-600 hover:bg-red-700' : ''
              }`}
            >
              {isTimerActive ? <Pause size={18} className="mr-2" /> : <Play size={18} className="mr-2" />}
              {isTimerActive ? 'Pausar' : 'Iniciar'} Timer
            </button>
            <button onClick={handleEditTask} className="btn-secondary flex items-center">
              <Edit size={18} className="mr-2" />
              Editar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card animate-slide-up delay-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getPriorityIcon(priority)}</span>
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                    {status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getPriorityColor(priority)}`}>
                    {priority}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateStatus('Concluído')}
                  className="btn-success text-sm px-3 py-1"
                >
                  <CheckCircle2 size={16} className="mr-1" />
                  Concluir
                </button>
                <button onClick={handleDeleteTask} className="btn-secondary text-sm px-3 py-1">
                  <Trash2 size={16} className="mr-1" />
                  Excluir
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 leading-relaxed">{task.description || 'Sem descrição'}</p>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag: string, index: number) => (
                    <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      <Tag size={14} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Progresso</h3>
                <span className="text-sm text-gray-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                <span>{completedHours.toFixed(1)}h trabalhadas</span>
                <span>{estimatedHours.toFixed(1)}h estimadas</span>
              </div>
            </div>
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="card animate-slide-up delay-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Subtarefas</h3>
                <button
                  onClick={() => setShowAddSubtask(true)}
                  className="btn-primary text-sm px-3 py-1"
                >
                  Adicionar Subtarefa
                </button>
              </div>

              {showAddSubtask && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Digite a subtarefa..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowAddSubtask(false)}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddSubtask}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {task.subtasks.map((subtask: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={subtask.completed || false}
                      onChange={async () => {
                        if (!id) return;
                        try {
                          const updatedSubtasks = [...(task?.subtasks || [])];
                          updatedSubtasks[index] = { ...updatedSubtasks[index], completed: !updatedSubtasks[index].completed };
                          await apiService.updateTask(id, { subtasks: updatedSubtasks });
                          await loadTask();
                        } catch (error) {
                          console.error('Error updating subtask:', error);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {subtask.title || subtask}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card animate-slide-up delay-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentários</h3>
            
            {task.comments && task.comments.length > 0 ? (
              <div className="space-y-4 mb-4">
                {task.comments.map((comment: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg ${comment.isImportant ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {comment.author?.substring(0, 2).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.author || 'Usuário'}</span>
                          <span className="text-sm text-gray-500">
                            {comment.timestamp ? new Date(comment.timestamp).toLocaleString('pt-BR') : 'Agora'}
                          </span>
                          {comment.isImportant && (
                            <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              <AlertCircle size={12} className="mr-1" />
                              Importante
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700">{comment.content || comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8 mb-4">
                Nenhum comentário ainda
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar comentário..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Comentar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card animate-slide-up delay-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="text-gray-400" size={18} />
                <div>
                  <p className="text-sm text-gray-600">Responsável</p>
                  <p className="font-medium text-gray-900">
                    {assignee?.name || assignee?.email || task.assigneeId || '-'}
                  </p>
                </div>
              </div>
              
              {task.dueDate && (
                <div className="flex items-center space-x-3">
                  <Calendar className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Prazo</p>
                    <p className="font-medium text-gray-900">
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
              
              {task.createdAt && (
                <div className="flex items-center space-x-3">
                  <Clock className="text-gray-400" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Criado em</p>
                    <p className="font-medium text-gray-900">
                      {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isTimerActive && (
            <div className="card animate-slide-up delay-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timer Ativo</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">02:34:15</div>
                <p className="text-sm text-gray-600 mb-4">Trabalhando em: {task.title}</p>
                <div className="flex space-x-2">
                  <button onClick={() => setIsTimerActive(false)} className="btn-primary text-sm px-3 py-1">
                    Pausar
                  </button>
                  <button onClick={() => setIsTimerActive(false)} className="btn-secondary text-sm px-3 py-1">
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="card animate-slide-up delay-600">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Anexos</h3>
              <div className="space-y-2">
                {task.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <Paperclip className="text-gray-400" size={16} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {attachment.name || attachment.filename || `Anexo ${index + 1}`}
                      </p>
                      {attachment.size && (
                        <p className="text-xs text-gray-500">{attachment.size}</p>
                      )}
                    </div>
                    {attachment.url && (
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Baixar
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

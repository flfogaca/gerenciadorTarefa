import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { taskStatusToLabel, taskPriorityToLabel } from '../utils/statusMapper';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText,
  AlertCircle,
  Eye,
  Edit,
  Play,
  Pause,
  Target,
  TrendingUp
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

export default function DashboardFuncionario() {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeTasks: 0,
    workedHours: 0,
    completionRate: 0,
    activeProjects: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiService.getEmployeeDashboard();
      const dashboardData = response?.data;

      if (dashboardData) {
        setStats({
          activeTasks: dashboardData.summary?.tasks?.inProgress || 0,
          workedHours: dashboardData.summary?.timeTracking?.completedHours || 0,
          completionRate: 0,
          activeProjects: dashboardData.summary?.projects?.total || 0
        });

        if (dashboardData.myTasks) {
          setTasks(dashboardData.myTasks);
        }

        if (dashboardData.upcomingDeadlines) {
          const allTasks = [...(dashboardData.myTasks || []), ...(dashboardData.upcomingDeadlines || [])];
          setTasks(allTasks);
        }
      } else {
        const [tasksRes, projectsRes] = await Promise.all([
          apiService.getTasks(),
          apiService.getProjects()
        ]);

        const tasksData = tasksRes?.data?.tasks || [];
        const projectsData = projectsRes?.data?.projects || [];

        const userTasks = tasksData.filter((task: any) => 
          task.assigneeId === user?.id || task.assignee?.id === user?.id
        );

        setTasks(userTasks);
        setProjects(projectsData);

        const activeTasks = userTasks.filter((t: any) => 
          t.status === 'in_progress' || t.status === 'IN_PROGRESS'
        ).length;

        const totalHours = userTasks.reduce((sum: number, task: any) => {
          return sum + (parseFloat(task.timeLogged?.totalHours || '0') || 0);
        }, 0);

        const completedTasks = userTasks.filter((t: any) => 
          t.status === 'done' || t.status === 'DONE'
        ).length;
        const completionRate = userTasks.length > 0 
          ? Math.round((completedTasks / userTasks.length) * 100) 
          : 0;

        const userProjectIds = new Set(
          userTasks.map((t: any) => t.projectId).filter(Boolean)
        );
        const activeProjects = projectsData.filter((p: any) => 
          userProjectIds.has(p.id) && (p.status === 'active' || p.status === 'ACTIVE')
        ).length;

        setStats({
          activeTasks,
          workedHours: Math.round(totalHours),
          completionRate,
          activeProjects
        });
      }
    } catch (error) {
      console.error('Error loading employee dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(selectedTask === taskId ? null : taskId);
  };

  const handleStartTimer = (taskId: string) => {
    setActiveTimer(activeTimer === taskId ? null : taskId);
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await apiService.changeTaskStatus(taskId, 'done');
      loadData();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Erro ao marcar tarefa como concluída');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  const statsData = [
    { 
      name: 'Tarefas Ativas', 
      value: stats.activeTasks.toString(), 
      change: '+2', 
      changeType: 'positive', 
      icon: Target 
    },
    { 
      name: 'Horas Trabalhadas', 
      value: `${stats.workedHours}h`, 
      change: '+5h', 
      changeType: 'positive', 
      icon: Clock 
    },
    { 
      name: 'Taxa de Conclusão', 
      value: `${stats.completionRate}%`, 
      change: '+12%', 
      changeType: 'positive', 
      icon: TrendingUp 
    },
    { 
      name: 'Projetos Ativos', 
      value: stats.activeProjects.toString(), 
      change: '+1', 
      changeType: 'positive', 
      icon: FileText 
    },
  ];

  const projectMap = new Map(projects.map((p: any) => [p.id, p.name]));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Minhas Tarefas</h1>
        <p className="text-gray-600 mt-2">Acompanhe suas atividades e progresso nos projetos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div key={stat.name} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} vs semana anterior
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card animate-slide-up delay-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Tarefas Atribuídas</h2>
              <div className="flex space-x-2">
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                  <option>Todas as Tarefas</option>
                  <option>Em Andamento</option>
                  <option>Pendentes</option>
                  <option>Concluídas</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarefa</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => {
                    const status = taskStatusToLabel(task.status);
                    const priority = taskPriorityToLabel(task.priority);
                    const estimatedHours = parseFloat(task.estimatedHours || '0');
                    const completedHours = parseFloat(task.timeLogged?.totalHours || '0');
                    const progress = estimatedHours > 0 
                      ? Math.round((completedHours / estimatedHours) * 100) 
                      : 0;
                    
                    return (
                      <tr 
                        key={task.id} 
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedTask === task.id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                            <div className="text-sm text-gray-500">
                              Prazo: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                          {projectMap.get(task.projectId) || '-'}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(priority)}`}>
                            {priority}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {completedHours.toFixed(1)}h/{estimatedHours.toFixed(1)}h
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartTimer(task.id);
                              }}
                              className={`p-1 transition-colors ${
                                activeTimer === task.id 
                                  ? 'text-red-600 hover:text-red-700' 
                                  : 'text-gray-400 hover:text-blue-600'
                              }`}
                              title={activeTimer === task.id ? 'Pausar' : 'Iniciar Timer'}
                            >
                              {activeTimer === task.id ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/tarefas/${task.id}`;
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={14} />
                            </button>
                            {task.status !== 'done' && task.status !== 'DONE' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteTask(task.id);
                                }}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Marcar como Concluído"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                        Nenhuma tarefa encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card animate-slide-up delay-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timer Ativo</h3>
            {activeTimer ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">02:34:15</div>
                <p className="text-sm text-gray-600 mb-4">
                  Tarefa: {tasks.find(t => t.id === activeTimer)?.title || '-'}
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTimer(null)}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Pausar
                  </button>
                  <button 
                    onClick={() => setActiveTimer(null)}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Clock size={48} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhum timer ativo</p>
                <p className="text-xs">Selecione uma tarefa para iniciar</p>
              </div>
            )}
          </div>

          <div className="card animate-slide-up delay-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Tarefas</h3>
            <div className="space-y-3">
              {tasks
                .filter((t: any) => {
                  if (!t.dueDate) return false;
                  const daysUntilDue = Math.ceil((new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return daysUntilDue > 0 && daysUntilDue <= 7;
                })
                .slice(0, 3)
                .map((task: any) => {
                  const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isCritical = daysUntilDue <= 2;
                  const isWarning = daysUntilDue <= 5;
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`flex items-start space-x-3 p-3 rounded-lg ${
                        isCritical ? 'bg-red-50' : isWarning ? 'bg-yellow-50' : 'bg-blue-50'
                      }`}
                    >
                      <AlertCircle 
                        className={`mt-0.5 ${isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-blue-500'}`} 
                        size={16} 
                      />
                      <div>
                        <p className={`text-sm font-medium ${
                          isCritical ? 'text-red-800' : isWarning ? 'text-yellow-800' : 'text-blue-800'
                        }`}>
                          {isCritical ? 'Prazo Crítico' : isWarning ? 'Prazo Próximo' : 'Prazo'}
                        </p>
                        <p className={`text-xs ${
                          isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {task.title} - {daysUntilDue} {daysUntilDue === 1 ? 'dia' : 'dias'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {tasks.filter((t: any) => {
                if (!t.dueDate) return false;
                const daysUntilDue = Math.ceil((new Date(t.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilDue > 0 && daysUntilDue <= 7;
              }).length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Nenhuma tarefa com prazo próximo
                </div>
              )}
            </div>
          </div>

          <div className="card animate-slide-up delay-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Semanal</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Horas Trabalhadas</span>
                <span className="text-sm font-semibold">{stats.workedHours}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tarefas Concluídas</span>
                <span className="text-sm font-semibold">
                  {tasks.filter((t: any) => t.status === 'done' || t.status === 'DONE').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Produtividade</span>
                <span className="text-sm font-semibold text-green-600">{stats.completionRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

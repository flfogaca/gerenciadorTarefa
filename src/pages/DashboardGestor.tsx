import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { projectStatusToLabel } from '../utils/statusMapper';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Edit,
  MoreHorizontal,
  Target,
  BarChart3
} from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em Execução': return 'bg-blue-100 text-blue-800';
    case 'Em Concorrência': return 'bg-yellow-100 text-yellow-800';
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Declinado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getSizeColor = (size: string) => {
  switch (size) {
    case 'Grande': return 'bg-purple-100 text-purple-800';
    case 'Médio': return 'bg-orange-100 text-orange-800';
    case 'Pequeno': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function DashboardGestor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    managedTeams: 0,
    totalBudget: 0,
    successRate: 0
  });
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!loadingRef.current) {
      loadingRef.current = true;
      loadData().finally(() => {
        loadingRef.current = false;
      });
    }
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiService.getManagerDashboard();
      const dashboardData = response?.data;

      if (dashboardData) {
        setStats({
          activeProjects: dashboardData.summary?.projects?.active || 0,
          managedTeams: 0,
          totalBudget: 0,
          successRate: 0
        });

        if (dashboardData.recentProjects) {
          setProjects(dashboardData.recentProjects);
        }

        if (dashboardData.upcomingDeadlines) {
          setTasks(dashboardData.upcomingDeadlines);
        }
      } else {
        const [projectsRes, tasksRes, usersRes] = await Promise.all([
          apiService.getProjects(),
          apiService.getTasks(),
          apiService.getUsers()
        ]);

        const projectsData = projectsRes?.data?.projects || [];
        const tasksData = tasksRes?.data?.tasks || [];
        const usersData = usersRes?.data?.users || [];

        const managerProjects = projectsData.filter((p: any) => 
          p.managerId === user?.id || p.manager?.id === user?.id
        );

        setProjects(managerProjects);
        setTasks(tasksData);
        setUsers(usersData);

        const activeProjects = managerProjects.filter((p: any) => 
          p.status === 'active' || p.status === 'ACTIVE'
        ).length;

        const uniqueTeams = new Set(
          managerProjects.map((p: any) => p.team?.map((m: any) => m.id).join(',') || '')
        ).size;

        const totalBudget = managerProjects.reduce((sum: number, p: any) => 
          sum + (parseFloat(p.budget?.planned || p.budget || '0') || 0), 0
        );

        const completedProjects = managerProjects.filter((p: any) => 
          p.status === 'completed' || p.status === 'COMPLETED'
        ).length;
        const successRate = managerProjects.length > 0 
          ? Math.round((completedProjects / managerProjects.length) * 100) 
          : 0;

        setStats({
          activeProjects,
          managedTeams: uniqueTeams || 1,
          totalBudget,
          successRate
        });
      }
    } catch (error: any) {
      if (error.response?.status !== 429) {
        console.error('Error loading manager dashboard:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  const handleViewProject = (projectId: string) => {
    navigate(`/projetos/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/projetos/${projectId}/editar`);
  };

  const handleNewProject = () => {
    navigate('/projetos/novo');
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
      name: 'Projetos Ativos', 
      value: stats.activeProjects.toString(), 
      change: '+2', 
      changeType: 'positive', 
      icon: Target 
    },
    { 
      name: 'Equipes Gerenciadas', 
      value: stats.managedTeams.toString(), 
      change: '+1', 
      changeType: 'positive', 
      icon: Users 
    },
    { 
      name: 'Budget Total', 
      value: `R$ ${(stats.totalBudget / 1000000).toFixed(1)}M`, 
      change: '+15%', 
      changeType: 'positive', 
      icon: DollarSign 
    },
    { 
      name: 'Taxa de Sucesso', 
      value: `${stats.successRate}%`, 
      change: '+3%', 
      changeType: 'positive', 
      icon: TrendingUp 
    },
  ];

  const statusCounts = projects.reduce((acc: any, project: any) => {
    const status = projectStatusToLabel(project.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Gestor</h1>
        <p className="text-gray-600 mt-2">Visão estratégica dos projetos e equipes sob sua gestão</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div key={stat.name} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} vs mês anterior
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
              <h2 className="text-lg font-semibold text-gray-900">Projetos em Gestão</h2>
              <div className="flex space-x-2">
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
                  <option>Todos os Status</option>
                  <option>Em Execução</option>
                  <option>Em Concorrência</option>
                  <option>Concluídos</option>
                </select>
                <button 
                  onClick={handleNewProject}
                  className="btn-primary text-sm px-3 py-1"
                >
                  Novo Projeto
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => {
                    const status = projectStatusToLabel(project.status);
                    const progress = project.progress || 0;
                    return (
                      <tr 
                        key={project.id} 
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedProject === project.id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">
                              Budget: R$ {parseFloat(project.budget?.planned || project.budget || '0').toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                          {project.client?.name || project.clientId || '-'}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{progress}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProject(project.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project.id);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Editar"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                        Nenhum projeto encontrado
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Status</h3>
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      status === 'Em Execução' ? 'bg-blue-500' :
                      status === 'Em Concorrência' ? 'bg-yellow-500' :
                      status === 'Concluído' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">{status}</span>
                  </div>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card animate-slide-up delay-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Importantes</h3>
            <div className="space-y-3">
              {projects
                .filter((p: any) => {
                  const daysUntilEnd = p.timeline?.endDate 
                    ? Math.ceil((new Date(p.timeline.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  return daysUntilEnd !== null && daysUntilEnd <= 7 && daysUntilEnd > 0;
                })
                .slice(0, 3)
                .map((project: any) => {
                  const daysUntilEnd = project.timeline?.endDate 
                    ? Math.ceil((new Date(project.timeline.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  return (
                    <div key={project.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="text-red-500 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-medium text-red-800">Prazo Crítico</p>
                        <p className="text-xs text-red-600">{project.name} - {daysUntilEnd} dias</p>
                      </div>
                    </div>
                  );
                })}
              {projects.filter((p: any) => {
                const daysUntilEnd = p.timeline?.endDate 
                  ? Math.ceil((new Date(p.timeline.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                return daysUntilEnd !== null && daysUntilEnd <= 7 && daysUntilEnd > 0;
              }).length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Nenhum alerta no momento
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

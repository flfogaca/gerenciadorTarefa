import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { SkeletonCard, LoadingSpinner } from '../components/Skeletons';
import DashboardGestor from './DashboardGestor';
import DashboardFuncionario from './DashboardFuncionario';
import DashboardDiretor from './DashboardDiretor';
import { projectStatusToLabel } from '../utils/statusMapper';
import { ExportButton } from '../components/ExportButton';
import { exportService } from '../services/exportService';
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
  MoreHorizontal
} from 'lucide-react';


const getStatusColor = (status: string) => {
  switch (status) {
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Em Execução': return 'bg-blue-100 text-blue-800';
    case 'Em Concorrência': return 'bg-yellow-100 text-yellow-800';
    case 'Declinado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getSizeColor = (size: string) => {
  switch (size) {
    case 'Grande': return 'bg-purple-100 text-purple-800';
    case 'Médio': return 'bg-blue-100 text-blue-800';
    case 'Pequeno': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function Dashboard() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dashboardReport, setDashboardReport] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const mapRoleToDisplay = (role: string): string => {
    const roleMap: Record<string, string> = {
      'manager': 'Gestor',
      'employee': 'Funcionário',
      'super_admin': 'Diretor',
      'tenant_admin': 'Administrador',
      'client': 'Cliente'
    };
    return roleMap[role] || role;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Verificar conexão com backend
        await apiService.healthCheck();
        setBackendStatus('connected');

        const [projectsResponse, tasksResponse, usersResponse, reportResponse] = await Promise.all([
          apiService.getProjects(),
          apiService.getTasks(),
          apiService.getUsers(),
          apiService.getDashboardReport().catch(() => null)
        ]);
        
        setProjects((projectsResponse as any).projects || []);
        setTasks((tasksResponse as any).tasks || []);
        setUsers((usersResponse as any).users || []);
        setDashboardReport(reportResponse);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setBackendStatus('disconnected');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProjectClick = (projectId: number) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  const handleViewProject = (projectId: number) => {
    navigate(`/projetos/${projectId}`);
  };

  const handleEditProject = (projectId: number) => {
    navigate(`/projetos/${projectId}/editar`);
  };

  const displayRole = user ? mapRoleToDisplay(user.role) : null;

  if (displayRole === 'Gestor') {
    return <DashboardGestor />;
  }
  
  if (displayRole === 'Funcionário') {
    return <DashboardFuncionario />;
  }
  
  if (displayRole === 'Diretor') {
    return <DashboardDiretor />;
  }
  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="animate-slide-up">
          <div className="skeleton-text w-64 h-8 mb-2"></div>
          <div className="skeleton-text w-96 h-4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard className="h-96" />
          <SkeletonCard className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Projetos</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Visão macro de todos os projetos ativos e históricos</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              backendStatus === 'connected' ? 'bg-green-500' : 
              backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Backend: {backendStatus === 'connected' ? 'Conectado' : 
                       backendStatus === 'disconnected' ? 'Desconectado' : 'Verificando...'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card animate-slide-up card-flip">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projetos Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboardReport?.summary?.projects?.active || projects.filter(p => (p.status === 'ACTIVE' || p.status === 'Em Andamento')).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card animate-slide-up card-flip" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Equipe</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{users.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card animate-slide-up card-flip" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tarefas Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboardReport?.summary?.tasks?.pending || tasks.filter(t => (t.status === 'TODO' || t.status === 'Pendente')).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <Calendar className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card animate-slide-up card-flip" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projetos Concluídos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboardReport?.summary?.projects?.completed || projects.filter(p => (p.status === 'COMPLETED' || p.status === 'Concluído')).length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <DollarSign className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="card animate-slide-up delay-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Projetos Recentes</h2>
            <div className="flex items-center space-x-2">
              {dashboardReport && (
                <ExportButton
                  title="Relatório de Dashboard"
                  data={[dashboardReport]}
                  columns={[]}
                  onExportPDF={() => exportService.exportDashboardToPDF(dashboardReport)}
                  variant="icon"
                />
              )}
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Todos os Status</option>
                <option>Em Execução</option>
                <option>Em Concorrência</option>
                <option>Concluído</option>
                <option>Declinado</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Todos os Portes</option>
                <option>Pequeno</option>
                <option>Médio</option>
                <option>Grande</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Porte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Evento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr 
                        key={project.id} 
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedProject === project.id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Cliente Teste</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(projectStatusToLabel[project.status] || project.status)}`}>
                            {projectStatusToLabel[project.status] || project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSizeColor('Médio')}`}>
                            {project.budget?.planned ? 
                              (project.budget.planned > 100000 ? 'Grande' : 
                               project.budget.planned > 50000 ? 'Médio' : 'Pequeno') : 
                              'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.budget?.currency || 'BRL'} {project.budget?.planned?.toLocaleString('pt-BR') || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${project.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{project.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.timeline?.endDate ? 
                            new Date(project.timeline.endDate).toLocaleDateString('pt-BR') : 
                            project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') :
                            'Não definido'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProject(project.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project.id);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/projetos/${project.id}`);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Mais opções"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card animate-slide-up delay-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Projetos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Concluídos</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {projects.filter(p => (p.status === 'COMPLETED' || p.status === 'Concluído')).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Em Execução</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {projects.filter(p => (p.status === 'ACTIVE' || p.status === 'Em Andamento')).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Em Planejamento</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {projects.filter(p => (p.status === 'PLANNING' || p.status === 'Planejamento')).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Cancelados</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {projects.filter(p => (p.status === 'CANCELLED' || p.status === 'Cancelado')).length}
              </span>
            </div>
          </div>
        </div>

        <div className="card animate-slide-up delay-400">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas e Prazos</h3>
          <div className="space-y-4">
          {(() => {
            const overdueProjects = projects.filter(p => {
              if (!p.timeline?.endDate && !p.endDate) return false;
              const endDate = new Date(p.timeline?.endDate || p.endDate);
              const daysUntilDue = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return daysUntilDue <= 7 && daysUntilDue > 0 && (p.status === 'ACTIVE' || p.status === 'Em Andamento');
            });
            
            const overdueTasks = tasks.filter(t => {
              if (!t.dueDate) return false;
              const dueDate = new Date(t.dueDate);
              return dueDate < new Date() && (t.status !== 'DONE' && t.status !== 'Concluído');
            });
            
            const recentCompleted = projects.filter(p => 
              (p.status === 'COMPLETED' || p.status === 'Concluído')
            ).slice(0, 1);
            
            return (
              <>
                {overdueProjects.slice(0, 1).map(project => {
                  const endDate = new Date(project.timeline?.endDate || project.endDate);
                  const daysUntilDue = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={project.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-medium text-red-800">Prazo próximo</p>
                        <p className="text-xs text-red-600">{project.name} - {daysUntilDue} {daysUntilDue === 1 ? 'dia' : 'dias'}</p>
                      </div>
                    </div>
                  );
                })}
                {overdueTasks.slice(0, 1).map(task => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Tarefa atrasada</p>
                      <p className="text-xs text-yellow-600">{task.title}</p>
                    </div>
                  </div>
                ))}
                {recentCompleted.slice(0, 1).map(project => (
                  <div key={project.id} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-green-800">Projeto concluído</p>
                      <p className="text-xs text-green-600">{project.name}</p>
                    </div>
                  </div>
                ))}
                {overdueProjects.length === 0 && overdueTasks.length === 0 && recentCompleted.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum alerta no momento</p>
                )}
              </>
            );
          })()}
          </div>
        </div>
      </div>
    </div>
  );
}

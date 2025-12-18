import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { projectStatusToLabel } from '../utils/statusMapper';
import { showToast } from '../utils/toast';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Download,
  Filter,
  Calendar,
  Users
} from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em Execução': return 'bg-blue-100 text-blue-800';
    case 'Em Concorrência': return 'bg-yellow-100 text-yellow-800';
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getROIColor = (roi: number) => {
  if (roi >= 20) return 'text-green-600';
  if (roi >= 10) return 'text-yellow-600';
  return 'text-red-600';
};

export default function DashboardDiretor() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6m');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [financialReport, setFinancialReport] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiService.getDirectorDashboard();
      const dashboardData = response?.data;

      if (dashboardData) {
        if (dashboardData.topProjects) {
          setProjects(dashboardData.topProjects);
        }

        if (dashboardData.summary?.financial) {
          setFinancialReport({
            totalBudget: dashboardData.summary.financial.totalBudget || 0,
            totalSpent: dashboardData.summary.financial.totalSpent || 0,
            remaining: dashboardData.summary.financial.remaining || 0
          });
        }
      } else {
        const startDate = new Date();
        if (timeRange === '3m') {
          startDate.setMonth(startDate.getMonth() - 3);
        } else if (timeRange === '6m') {
          startDate.setMonth(startDate.getMonth() - 6);
        } else {
          startDate.setFullYear(startDate.getFullYear() - 1);
        }

        const [projectsRes, reportRes] = await Promise.all([
          apiService.getProjects(),
          apiService.getFinancialDashboardReport({
            startDate: startDate.toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          })
        ]);

        const projectsData = projectsRes?.data?.projects || [];
        setProjects(projectsData);
        
        if (reportRes?.data?.report) {
          setFinancialReport(reportRes.data.report);
        }
      }
    } catch (error) {
      console.error('Error loading director dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  const handleViewDetails = (projectId: string) => {
    window.location.href = `/projetos/${projectId}`;
  };

  const handleExportReport = async () => {
    try {
      const reportData = {
        summary,
        projects: financialProjects,
        generatedAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting report:', error);
      showToast.error('Erro ao exportar relatório');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  const summary = financialReport?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0
  };

  const profitMargin = summary.totalIncome > 0 
    ? ((summary.netProfit / summary.totalIncome) * 100).toFixed(1)
    : '0';

  const avgROI = projects.length > 0
    ? projects.reduce((sum: number, p: any) => {
        const budget = parseFloat(p.budget?.planned || p.budget || '0');
        const spent = parseFloat(p.budget?.spent || '0');
        if (budget > 0 && spent > 0) {
          return sum + ((budget - spent) / spent) * 100;
        }
        return sum;
      }, 0) / projects.length
    : 0;

  const stats = [
    { 
      name: 'Receita Total', 
      value: `R$ ${(summary.totalIncome / 1000000).toFixed(1)}M`, 
      change: '+18%', 
      changeType: 'positive', 
      icon: DollarSign 
    },
    { 
      name: 'Custos Operacionais', 
      value: `R$ ${(summary.totalExpenses / 1000000).toFixed(1)}M`, 
      change: '+5%', 
      changeType: 'positive', 
      icon: TrendingUp 
    },
    { 
      name: 'Margem de Lucro', 
      value: `${profitMargin}%`, 
      change: '+8%', 
      changeType: 'positive', 
      icon: BarChart3 
    },
    { 
      name: 'ROI Médio', 
      value: `${avgROI.toFixed(1)}%`, 
      change: '+3%', 
      changeType: 'positive', 
      icon: Target 
    },
  ];

  const financialProjects = projects.map((project: any) => {
    const budget = parseFloat(project.budget?.planned || project.budget || '0');
    const spent = parseFloat(project.budget?.spent || '0');
    const remaining = budget - spent;
    const roi = budget > 0 && spent > 0 ? ((budget - spent) / spent) * 100 : 0;
    const status = projectStatusToLabel(project.status);
    
    return {
      id: project.id,
      project: project.name,
      client: project.client?.name || project.clientId || '-',
      budget,
      spent,
      remaining,
      status,
      roi
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
        <p className="text-gray-600 mt-2">Visão estratégica e financeira da organização</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.name} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} vs período anterior
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
              <h2 className="text-lg font-semibold text-gray-900">Análise Financeira por Projeto</h2>
              <div className="flex space-x-2">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                >
                  <option value="3m">Últimos 3 meses</option>
                  <option value="6m">Últimos 6 meses</option>
                  <option value="1y">Último ano</option>
                </select>
                <button 
                  onClick={handleExportReport}
                  className="btn-secondary text-sm px-3 py-1 flex items-center"
                >
                  <Download size={14} className="mr-1" />
                  Exportar
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gasto</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedProject === project.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.project}</div>
                          <div className="text-sm text-gray-500">Restante: R$ {project.remaining.toLocaleString('pt-BR')}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{project.client}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        R$ {project.budget.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        R$ {project.spent.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${getROIColor(project.roi)}`}>
                          {project.roi.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(project.id);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver Detalhes"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {financialProjects.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores Chave</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Margem de Lucro</span>
                </div>
                <span className="text-sm font-semibold text-green-600">{profitMargin}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">ROI Médio</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">{avgROI.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">Crescimento</span>
                </div>
                <span className="text-sm font-semibold text-yellow-600">+18%</span>
              </div>
            </div>
          </div>

          <div className="card animate-slide-up delay-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Mensal</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Receita Bruta</span>
                <span className="text-sm font-semibold">
                  R$ {(summary.totalIncome / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Custos Diretos</span>
                <span className="text-sm font-semibold">
                  R$ {(summary.totalExpenses / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Margem Bruta</span>
                <span className="text-sm font-semibold text-green-600">
                  R$ {(summary.netProfit / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Margem %</span>
                <span className="text-sm font-semibold text-green-600">{profitMargin}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Building2,
  Truck,
  FileText,
  PieChart
} from 'lucide-react';
import apiService from '../services/api';
import { ExportButton } from '../components/ExportButton';
import { exportService } from '../services/exportService';

interface DashboardReport {
  summary: {
    projects: {
      total: number;
      active: number;
      completed: number;
      overdue: number;
      averageProgress: number;
    };
    tasks: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
      overdue: number;
    };
    clients: {
      total: number;
      active: number;
    };
    suppliers: {
      total: number;
      active: number;
    };
    timeTracking: {
      estimatedHours: number;
      completedHours: number;
      efficiency: number;
    };
  };
  trends: {
    projectStatusDistribution: {
      active: number;
      completed: number;
      overdue: number;
    };
    taskStatusDistribution: {
      completed: number;
      inProgress: number;
      pending: number;
      overdue: number;
    };
  };
  generatedAt: string;
}

export default function Relatorios() {
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    loadDashboardReport();
  }, [selectedPeriod]);

  const loadDashboardReport = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getDashboardReport();
      const reportData = response?.data?.summary ? response.data : response?.data || response;
      
      if (reportData && reportData.summary) {
        setReport(reportData as DashboardReport);
      } else {
        setReport(null);
      }
    } catch (error: any) {
      console.error('Error loading dashboard report:', error);
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReportPDF = () => {
    if (!report) return;
    
    const reportData = [
      {
        'Métrica': 'Projetos Total',
        'Valor': report.summary.projects.total
      },
      {
        'Métrica': 'Projetos Ativos',
        'Valor': report.summary.projects.active
      },
      {
        'Métrica': 'Projetos Concluídos',
        'Valor': report.summary.projects.completed
      },
      {
        'Métrica': 'Projetos Atrasados',
        'Valor': report.summary.projects.overdue
      },
      {
        'Métrica': 'Progresso Médio',
        'Valor': `${report.summary.projects.averageProgress}%`
      },
      {
        'Métrica': 'Tarefas Total',
        'Valor': report.summary.tasks.total
      },
      {
        'Métrica': 'Tarefas Concluídas',
        'Valor': report.summary.tasks.completed
      },
      {
        'Métrica': 'Tarefas Em Andamento',
        'Valor': report.summary.tasks.inProgress
      },
      {
        'Métrica': 'Tarefas Pendentes',
        'Valor': report.summary.tasks.pending
      },
      {
        'Métrica': 'Tarefas Atrasadas',
        'Valor': report.summary.tasks.overdue
      },
      {
        'Métrica': 'Clientes Total',
        'Valor': report.summary.clients.total
      },
      {
        'Métrica': 'Clientes Ativos',
        'Valor': report.summary.clients.active
      },
      {
        'Métrica': 'Fornecedores Total',
        'Valor': report.summary.suppliers.total
      },
      {
        'Métrica': 'Fornecedores Ativos',
        'Valor': report.summary.suppliers.active
      },
      {
        'Métrica': 'Horas Estimadas',
        'Valor': `${report.summary.timeTracking.estimatedHours}h`
      },
      {
        'Métrica': 'Horas Realizadas',
        'Valor': `${report.summary.timeTracking.completedHours}h`
      },
      {
        'Métrica': 'Eficiência',
        'Valor': `${report.summary.timeTracking.efficiency}%`
      }
    ];
    
    exportService.exportToPDF('Relatório Dashboard', reportData, ['Métrica', 'Valor'], { 'Métrica': 'Métrica', 'Valor': 'Valor' });
  };

  const exportReportExcel = () => {
    if (!report) return;
    
    const reportData = [
      {
        'Métrica': 'Projetos Total',
        'Valor': report.summary.projects.total
      },
      {
        'Métrica': 'Projetos Ativos',
        'Valor': report.summary.projects.active
      },
      {
        'Métrica': 'Projetos Concluídos',
        'Valor': report.summary.projects.completed
      },
      {
        'Métrica': 'Projetos Atrasados',
        'Valor': report.summary.projects.overdue
      },
      {
        'Métrica': 'Progresso Médio',
        'Valor': `${report.summary.projects.averageProgress}%`
      },
      {
        'Métrica': 'Tarefas Total',
        'Valor': report.summary.tasks.total
      },
      {
        'Métrica': 'Tarefas Concluídas',
        'Valor': report.summary.tasks.completed
      },
      {
        'Métrica': 'Tarefas Em Andamento',
        'Valor': report.summary.tasks.inProgress
      },
      {
        'Métrica': 'Tarefas Pendentes',
        'Valor': report.summary.tasks.pending
      },
      {
        'Métrica': 'Tarefas Atrasadas',
        'Valor': report.summary.tasks.overdue
      },
      {
        'Métrica': 'Clientes Total',
        'Valor': report.summary.clients.total
      },
      {
        'Métrica': 'Clientes Ativos',
        'Valor': report.summary.clients.active
      },
      {
        'Métrica': 'Fornecedores Total',
        'Valor': report.summary.suppliers.total
      },
      {
        'Métrica': 'Fornecedores Ativos',
        'Valor': report.summary.suppliers.active
      },
      {
        'Métrica': 'Horas Estimadas',
        'Valor': `${report.summary.timeTracking.estimatedHours}h`
      },
      {
        'Métrica': 'Horas Realizadas',
        'Valor': `${report.summary.timeTracking.completedHours}h`
      },
      {
        'Métrica': 'Eficiência',
        'Valor': `${report.summary.timeTracking.efficiency}%`
      }
    ];
    
    exportService.exportToExcel('Relatório Dashboard', reportData, ['Métrica', 'Valor'], { 'Métrica': 'Métrica', 'Valor': 'Valor' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar relatórios</h2>
          <p className="text-gray-600">Não foi possível carregar os dados do relatório.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Análise completa do desempenho da empresa</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
            <ExportButton
              title="Relatório Dashboard"
              data={[]}
              columns={[]}
              onExportPDF={exportReportPDF}
              onExportExcel={exportReportExcel}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Projects Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projetos</p>
              <p className="text-2xl font-bold text-gray-900">{report.summary.projects.total}</p>
              <p className="text-sm text-gray-500">
                {report.summary.projects.active} ativos, {report.summary.projects.completed} concluídos
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progresso médio</span>
              <span className="font-medium">{report.summary.projects.averageProgress}%</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${report.summary.projects.averageProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tarefas</p>
              <p className="text-2xl font-bold text-gray-900">{report.summary.tasks.total}</p>
              <p className="text-sm text-gray-500">
                {report.summary.tasks.completed} concluídas, {report.summary.tasks.inProgress} em andamento
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Taxa de conclusão</span>
              <span className="font-medium">
                {report.summary.tasks.total > 0 
                  ? Math.round((report.summary.tasks.completed / report.summary.tasks.total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ 
                  width: `${report.summary.tasks.total > 0 
                    ? (report.summary.tasks.completed / report.summary.tasks.total) * 100
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Clients Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{report.summary.clients.total}</p>
              <p className="text-sm text-gray-500">
                {report.summary.clients.active} ativos
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Taxa de ativos</span>
              <span className="font-medium">
                {report.summary.clients.total > 0 
                  ? Math.round((report.summary.clients.active / report.summary.clients.total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ 
                  width: `${report.summary.clients.total > 0 
                    ? (report.summary.clients.active / report.summary.clients.total) * 100
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Suppliers Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fornecedores</p>
              <p className="text-2xl font-bold text-gray-900">{report.summary.suppliers.total}</p>
              <p className="text-sm text-gray-500">
                {report.summary.suppliers.active} ativos
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Taxa de ativos</span>
              <span className="font-medium">
                {report.summary.suppliers.total > 0 
                  ? Math.round((report.summary.suppliers.active / report.summary.suppliers.total) * 100)
                  : 0}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full" 
                style={{ 
                  width: `${report.summary.suppliers.total > 0 
                    ? (report.summary.suppliers.active / report.summary.suppliers.total) * 100
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Project Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Status dos Projetos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Ativos</span>
              </div>
              <span className="font-medium">{report.trends.projectStatusDistribution.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Concluídos</span>
              </div>
              <span className="font-medium">{report.trends.projectStatusDistribution.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Atrasados</span>
              </div>
              <span className="font-medium">{report.trends.projectStatusDistribution.overdue}</span>
            </div>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Status das Tarefas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Concluídas</span>
              </div>
              <span className="font-medium">{report.trends.taskStatusDistribution.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Em Andamento</span>
              </div>
              <span className="font-medium">{report.trends.taskStatusDistribution.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pendentes</span>
              </div>
              <span className="font-medium">{report.trends.taskStatusDistribution.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Atrasadas</span>
              </div>
              <span className="font-medium">{report.trends.taskStatusDistribution.overdue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Tracking Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Controle de Tempo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{report.summary.timeTracking.estimatedHours}h</div>
            <div className="text-sm text-gray-600">Horas Estimadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{report.summary.timeTracking.completedHours}h</div>
            <div className="text-sm text-gray-600">Horas Realizadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{report.summary.timeTracking.efficiency}%</div>
            <div className="text-sm text-gray-600">Eficiência</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progresso do Tempo</span>
            <span className="font-medium">{report.summary.timeTracking.efficiency}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${Math.min(report.summary.timeTracking.efficiency, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas e Ações Necessárias</h3>
        <div className="space-y-3">
          {report.summary.projects.overdue > 0 && (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">{report.summary.projects.overdue} projeto(s) atrasado(s)</p>
                <p className="text-sm text-red-700">Revisar cronograma e prioridades</p>
              </div>
            </div>
          )}
          
          {report.summary.tasks.overdue > 0 && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">{report.summary.tasks.overdue} tarefa(s) atrasada(s)</p>
                <p className="text-sm text-orange-700">Revisar prazos e recursos</p>
              </div>
            </div>
          )}

          {report.summary.timeTracking.efficiency < 80 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Eficiência abaixo de 80%</p>
                <p className="text-sm text-yellow-700">Revisar estimativas e processos</p>
              </div>
            </div>
          )}

          {report.summary.projects.overdue === 0 && report.summary.tasks.overdue === 0 && report.summary.timeTracking.efficiency >= 80 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Tudo em dia!</p>
                <p className="text-sm text-green-700">Projetos e tarefas estão dentro do prazo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Relatório gerado em {new Date(report.generatedAt).toLocaleString('pt-BR')}
      </div>
    </div>
  );
}
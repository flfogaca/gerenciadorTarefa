import { useState } from 'react';
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

const mockFinancialData = [
  {
    id: 1,
    project: 'Evento Corporativo Q1',
    client: 'TechCorp',
    budget: 150000,
    spent: 97500,
    remaining: 52500,
    status: 'Em execução',
    roi: 15.2
  },
  {
    id: 2,
    project: 'Lançamento Produto',
    client: 'InnovaCorp',
    budget: 80000,
    spent: 24000,
    remaining: 56000,
    status: 'Em concorrência',
    roi: 8.5
  },
  {
    id: 3,
    project: 'Workshop Digital',
    client: 'EduTech',
    budget: 25000,
    spent: 25000,
    remaining: 0,
    status: 'Concluído',
    roi: 22.1
  }
];

const stats = [
  { name: 'Receita Total', value: 'R$ 2.4M', change: '+18%', changeType: 'positive', icon: DollarSign },
  { name: 'Custos Operacionais', value: 'R$ 1.2M', change: '+5%', changeType: 'positive', icon: TrendingUp },
  { name: 'Margem de Lucro', value: '42%', change: '+8%', changeType: 'positive', icon: BarChart3 },
  { name: 'ROI Médio', value: '18.5%', change: '+3%', changeType: 'positive', icon: Target },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em execução': return 'bg-blue-100 text-blue-800';
    case 'Em concorrência': return 'bg-yellow-100 text-yellow-800';
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
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState('6m');

  const handleProjectClick = (projectId: number) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  const handleViewDetails = (projectId: number) => {
    console.log('Visualizar detalhes financeiros:', projectId);
  };

  const handleExportReport = () => {
    console.log('Exportar relatório financeiro');
  };

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
                  {mockFinancialData.map((project) => (
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
                          {project.roi}%
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
                <span className="text-sm font-semibold text-green-600">42%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-700">ROI Médio</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">18.5%</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Executivos</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="text-red-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-red-800">Budget Crítico</p>
                  <p className="text-xs text-red-600">Evento Corporativo Q1 - 65% gasto</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="text-yellow-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Aprovação Pendente</p>
                  <p className="text-xs text-yellow-600">Lançamento Produto - Budget</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="text-green-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-green-800">Projeto Concluído</p>
                  <p className="text-xs text-green-600">Workshop Digital - ROI 22.1%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card animate-slide-up delay-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Mensal</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Receita Bruta</span>
                <span className="text-sm font-semibold">R$ 2.4M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Custos Diretos</span>
                <span className="text-sm font-semibold">R$ 1.2M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Margem Bruta</span>
                <span className="text-sm font-semibold text-green-600">R$ 1.2M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Margem %</span>
                <span className="text-sm font-semibold text-green-600">50%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Filter, 
  Calendar,
  Users,
  DollarSign,
  Clock,
  Target,
  PieChart,
  FileText,
  Mail,
  Printer
} from 'lucide-react';

const mockReports = {
  projectPerformance: {
    totalProjects: 28,
    completedProjects: 24,
    activeProjects: 3,
    cancelledProjects: 1,
    averageDuration: 45,
    onTimeDelivery: 85,
    budgetAccuracy: 92
  },
  teamPerformance: {
    totalMembers: 28,
    activeMembers: 25,
    averageTasksPerMember: 12,
    averageCompletionTime: 3.2,
    topPerformer: 'Maria Silva',
    productivityScore: 88
  },
  financialMetrics: {
    totalRevenue: 1250000,
    totalExpenses: 850000,
    netProfit: 400000,
    profitMargin: 32,
    averageProjectValue: 45000,
    monthlyGrowth: 15
  },
  timeTracking: {
    totalHoursLogged: 1840,
    billableHours: 1650,
    nonBillableHours: 190,
    averageHoursPerProject: 65,
    overtimeHours: 120,
    utilizationRate: 87
  }
};

const mockChartData = {
  projectStatus: [
    { name: 'Concluídos', value: 24, color: 'bg-green-500' },
    { name: 'Em Andamento', value: 3, color: 'bg-blue-500' },
    { name: 'Cancelados', value: 1, color: 'bg-red-500' }
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 120000, expenses: 80000 },
    { month: 'Fev', revenue: 135000, expenses: 85000 },
    { month: 'Mar', revenue: 150000, expenses: 90000 },
    { month: 'Abr', revenue: 140000, expenses: 88000 },
    { month: 'Mai', revenue: 160000, expenses: 95000 },
    { month: 'Jun', revenue: 175000, expenses: 100000 }
  ],
  teamWorkload: [
    { name: 'Maria Silva', projects: 4, tasks: 18, completion: 95 },
    { name: 'João Santos', projects: 3, tasks: 15, completion: 88 },
    { name: 'Ana Costa', projects: 2, tasks: 12, completion: 92 },
    { name: 'Carlos Lima', projects: 3, tasks: 16, completion: 85 },
    { name: 'Patricia Oliveira', projects: 2, tasks: 10, completion: 90 }
  ]
};

export default function Relatorios() {
  const [selectedReport, setSelectedReport] = useState<'overview' | 'projects' | 'team' | 'financial' | 'time'>('overview');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [isGenerating, setIsGenerating] = useState(false);

  const reports = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'projects', name: 'Projetos', icon: Target },
    { id: 'team', name: 'Equipe', icon: Users },
    { id: 'financial', name: 'Financeiro', icon: DollarSign },
    { id: 'time', name: 'Tempo', icon: Clock }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const maxRevenue = Math.max(...mockChartData.monthlyRevenue.map(d => d.revenue));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600 mt-2">Análise detalhada de performance e métricas</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Mail size={20} className="mr-2" />
            Enviar por Email
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Printer size={20} className="mr-2" />
            Imprimir
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Download size={20} className="mr-2" />
            {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id as any)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedReport === report.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <report.icon size={16} className="mr-2" />
                  {report.name}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="last-7-days">Últimos 7 dias</option>
                <option value="last-30-days">Últimos 30 dias</option>
                <option value="last-90-days">Últimos 90 dias</option>
                <option value="last-year">Último ano</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {selectedReport === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Projetos Totais</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">{mockReports.projectPerformance.totalProjects}</p>
                    </div>
                    <Target className="text-blue-600" size={32} />
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                    <span className="text-sm text-green-600 font-medium">+12%</span>
                    <span className="text-sm text-blue-600 ml-2">vs mês anterior</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Taxa de Conclusão</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">{mockReports.projectPerformance.onTimeDelivery}%</p>
                    </div>
                    <BarChart3 className="text-green-600" size={32} />
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                    <span className="text-sm text-green-600 font-medium">+5%</span>
                    <span className="text-sm text-green-600 ml-2">vs mês anterior</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Receita Total</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">R$ {(mockReports.financialMetrics.totalRevenue / 1000000).toFixed(1)}M</p>
                    </div>
                    <DollarSign className="text-purple-600" size={32} />
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                    <span className="text-sm text-green-600 font-medium">+{mockReports.financialMetrics.monthlyGrowth}%</span>
                    <span className="text-sm text-purple-600 ml-2">vs mês anterior</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Produtividade</p>
                      <p className="text-3xl font-bold text-orange-900 mt-1">{mockReports.teamPerformance.productivityScore}%</p>
                    </div>
                    <Users className="text-orange-600" size={32} />
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                    <span className="text-sm text-green-600 font-medium">+8%</span>
                    <span className="text-sm text-orange-600 ml-2">vs mês anterior</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Projetos</h3>
                  <div className="space-y-4">
                    {mockChartData.projectStatus.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-3">{item.value}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${(item.value / 28) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita Mensal</h3>
                  <div className="space-y-3">
                    {mockChartData.monthlyRevenue.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.month}</span>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">R$ {item.revenue.toLocaleString('pt-BR')}</p>
                            <p className="text-xs text-gray-500">Receita</p>
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'projects' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Projetos Concluídos</h4>
                  <p className="text-3xl font-bold text-green-600">{mockReports.projectPerformance.completedProjects}</p>
                  <p className="text-sm text-gray-600 mt-1">85% do total</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Duração Média</h4>
                  <p className="text-3xl font-bold text-blue-600">{mockReports.projectPerformance.averageDuration}</p>
                  <p className="text-sm text-gray-600 mt-1">dias</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Precisão Orçamentária</h4>
                  <p className="text-3xl font-bold text-purple-600">{mockReports.projectPerformance.budgetAccuracy}%</p>
                  <p className="text-sm text-gray-600 mt-1">dentro do orçamento</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Projeto</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projeto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orçamento</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Evento Corporativo Q1</td>
                        <td className="px-4 py-3 text-sm text-gray-900">TechCorp Brasil</td>
                        <td className="px-4 py-3 text-sm text-gray-900">45 dias</td>
                        <td className="px-4 py-3 text-sm text-gray-900">R$ 150.000</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Concluído
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                            </div>
                            <span className="text-sm text-gray-600">95%</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Lançamento Produto</td>
                        <td className="px-4 py-3 text-sm text-gray-900">Inovação Ltda</td>
                        <td className="px-4 py-3 text-sm text-gray-900">30 dias</td>
                        <td className="px-4 py-3 text-sm text-gray-900">R$ 85.000</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Em Andamento
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <span className="text-sm text-gray-600">75%</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'team' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Membros Ativos</h4>
                  <p className="text-3xl font-bold text-blue-600">{mockReports.teamPerformance.activeMembers}</p>
                  <p className="text-sm text-gray-600 mt-1">de {mockReports.teamPerformance.totalMembers} total</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Tarefas por Membro</h4>
                  <p className="text-3xl font-bold text-green-600">{mockReports.teamPerformance.averageTasksPerMember}</p>
                  <p className="text-sm text-gray-600 mt-1">média mensal</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Tempo de Conclusão</h4>
                  <p className="text-3xl font-bold text-purple-600">{mockReports.teamPerformance.averageCompletionTime}</p>
                  <p className="text-sm text-gray-600 mt-1">dias médios</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance da Equipe</h3>
                <div className="space-y-4">
                  {mockChartData.teamWorkload.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.projects} projetos • {member.tasks} tarefas</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${member.completion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{member.completion}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Receita Total</h4>
                  <p className="text-3xl font-bold text-green-600">R$ {mockReports.financialMetrics.totalRevenue.toLocaleString('pt-BR')}</p>
                  <p className="text-sm text-gray-600 mt-1">este período</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Lucro Líquido</h4>
                  <p className="text-3xl font-bold text-blue-600">R$ {mockReports.financialMetrics.netProfit.toLocaleString('pt-BR')}</p>
                  <p className="text-sm text-gray-600 mt-1">{mockReports.financialMetrics.profitMargin}% margem</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Valor Médio</h4>
                  <p className="text-3xl font-bold text-purple-600">R$ {mockReports.financialMetrics.averageProjectValue.toLocaleString('pt-BR')}</p>
                  <p className="text-sm text-gray-600 mt-1">por projeto</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise Financeira Detalhada</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Receita vs Despesas</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Receita</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">R$ {mockReports.financialMetrics.totalRevenue.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Despesas</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">R$ {mockReports.financialMetrics.totalExpenses.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Crescimento Mensal</h4>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">+{mockReports.financialMetrics.monthlyGrowth}%</div>
                      <p className="text-sm text-gray-600">Crescimento em relação ao mês anterior</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'time' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Horas Totais</h4>
                  <p className="text-3xl font-bold text-blue-600">{mockReports.timeTracking.totalHoursLogged}</p>
                  <p className="text-sm text-gray-600 mt-1">registradas</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Horas Faturáveis</h4>
                  <p className="text-3xl font-bold text-green-600">{mockReports.timeTracking.billableHours}</p>
                  <p className="text-sm text-gray-600 mt-1">{Math.round((mockReports.timeTracking.billableHours / mockReports.timeTracking.totalHoursLogged) * 100)}% do total</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Taxa de Utilização</h4>
                  <p className="text-3xl font-bold text-purple-600">{mockReports.timeTracking.utilizationRate}%</p>
                  <p className="text-sm text-gray-600 mt-1">eficiência da equipe</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Tempo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Distribuição de Horas</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Faturáveis</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{mockReports.timeTracking.billableHours}h</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Não Faturáveis</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{mockReports.timeTracking.nonBillableHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Métricas de Tempo</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Horas por Projeto</span>
                        <span className="text-sm font-medium text-gray-900">{mockReports.timeTracking.averageHoursPerProject}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Horas Extras</span>
                        <span className="text-sm font-medium text-gray-900">{mockReports.timeTracking.overtimeHours}h</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

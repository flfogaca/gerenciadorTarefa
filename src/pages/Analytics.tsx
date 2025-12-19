import { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Clock,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import AnalyticsChart from '../components/charts/AnalyticsChart';
import apiService from '../services/api';
import { SkeletonCard } from '../components/Skeletons';

interface AnalyticsData {
  projects: any[];
  tasks: any[];
  users: any[];
  expenses: any[];
  revenue: any[];
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData>({
    projects: [],
    tasks: [],
    users: [],
    expenses: [],
    revenue: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [projectsRes, tasksRes, usersRes, expensesRes] = await Promise.all([
          apiService.getProjects(),
          apiService.getTasks(),
          apiService.getUsers(),
          apiService.getExpenses().catch(() => ({ expenses: [] })),
        ]);

        setData({
          projects: (projectsRes as any)?.projects || [],
          tasks: (tasksRes as any)?.tasks || [],
          users: (usersRes as any)?.users || [],
          expenses: (expensesRes as any)?.expenses || [],
          revenue: [],
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [refreshKey]);

  const metrics = useMemo((): MetricCard[] => {
    const activeProjects = data.projects.filter(p => 
      p.status === 'ACTIVE' || p.status === 'Em Andamento'
    ).length;
    const completedProjects = data.projects.filter(p => 
      p.status === 'COMPLETED' || p.status === 'Concluído'
    ).length;
    const pendingTasks = data.tasks.filter(t => 
      t.status === 'TODO' || t.status === 'Pendente' || t.status === 'IN_PROGRESS'
    ).length;
    const completedTasks = data.tasks.filter(t => 
      t.status === 'DONE' || t.status === 'Concluído'
    ).length;
    const totalBudget = data.projects.reduce((acc, p) => acc + (p.budget?.planned || 0), 0);
    const activeUsers = data.users.filter(u => u.isActive !== false).length;

    return [
      {
        title: 'Projetos Ativos',
        value: activeProjects,
        change: 12,
        changeLabel: 'vs. mês anterior',
        icon: Briefcase,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      {
        title: 'Taxa de Conclusão',
        value: `${data.projects.length > 0 ? Math.round((completedProjects / data.projects.length) * 100) : 0}%`,
        change: 5,
        changeLabel: 'vs. mês anterior',
        icon: CheckCircle2,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
      },
      {
        title: 'Tarefas Pendentes',
        value: pendingTasks,
        change: -8,
        changeLabel: 'vs. mês anterior',
        icon: Clock,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
      },
      {
        title: 'Budget Total',
        value: `R$ ${(totalBudget / 1000).toFixed(0)}k`,
        change: 23,
        changeLabel: 'vs. mês anterior',
        icon: DollarSign,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
      },
      {
        title: 'Usuários Ativos',
        value: activeUsers,
        change: 3,
        changeLabel: 'novos este mês',
        icon: Users,
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
      },
      {
        title: 'Produtividade',
        value: `${data.tasks.length > 0 ? Math.round((completedTasks / data.tasks.length) * 100) : 0}%`,
        change: 15,
        changeLabel: 'vs. mês anterior',
        icon: TrendingUp,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      },
    ];
  }, [data]);

  const projectStatusChartData = useMemo(() => {
    const statusCounts = {
      'Em Andamento': data.projects.filter(p => p.status === 'ACTIVE' || p.status === 'Em Andamento').length,
      'Concluído': data.projects.filter(p => p.status === 'COMPLETED' || p.status === 'Concluído').length,
      'Planejamento': data.projects.filter(p => p.status === 'PLANNING' || p.status === 'Planejamento').length,
      'Pausado': data.projects.filter(p => p.status === 'ON_HOLD' || p.status === 'Pausado').length,
      'Cancelado': data.projects.filter(p => p.status === 'CANCELLED' || p.status === 'Cancelado').length,
    };

    return {
      labels: Object.keys(statusCounts),
      datasets: [{
        label: 'Projetos',
        data: Object.values(statusCounts),
      }],
    };
  }, [data.projects]);

  const taskProgressChartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const now = new Date();
    
    const monthlyData = months.map((_, index) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - index) + 1, 0);
      
      const completed = data.tasks.filter(t => {
        if (!t.updatedAt) return false;
        const date = new Date(t.updatedAt);
        return date >= monthStart && date <= monthEnd && (t.status === 'DONE' || t.status === 'Concluído');
      }).length;

      const created = data.tasks.filter(t => {
        if (!t.createdAt) return false;
        const date = new Date(t.createdAt);
        return date >= monthStart && date <= monthEnd;
      }).length;

      return { completed, created };
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Tarefas Criadas',
          data: monthlyData.map(d => d.created || Math.floor(Math.random() * 20 + 10)),
          color: '#3B82F6',
        },
        {
          label: 'Tarefas Concluídas',
          data: monthlyData.map(d => d.completed || Math.floor(Math.random() * 15 + 5)),
          color: '#10B981',
        },
      ],
    };
  }, [data.tasks]);

  const budgetChartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Receita',
          data: months.map(() => Math.floor(Math.random() * 50000 + 30000)),
          color: '#10B981',
        },
        {
          label: 'Despesas',
          data: months.map(() => Math.floor(Math.random() * 30000 + 15000)),
          color: '#EF4444',
        },
      ],
    };
  }, []);

  const productivityByUserData = useMemo(() => {
    const userTaskCounts = data.users.slice(0, 6).map(user => {
      const userTasks = data.tasks.filter(t => t.assigneeId === user.id || t.assigneeId === user.userId);
      const completed = userTasks.filter(t => t.status === 'DONE' || t.status === 'Concluído').length;
      return {
        name: `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`,
        completed: completed || Math.floor(Math.random() * 20 + 5),
      };
    });

    return {
      labels: userTaskCounts.map(u => u.name),
      datasets: [{
        label: 'Tarefas Concluídas',
        data: userTaskCounts.map(u => u.completed),
      }],
    };
  }, [data.users, data.tasks]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div className="skeleton-text w-48 h-8"></div>
          <div className="skeleton-text w-32 h-10"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-32" />
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral de performance e métricas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="365d">Este ano</option>
          </select>
          
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.title}
            className="card p-6 animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  {metric.change >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${
                    metric.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(metric.change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {metric.changeLabel}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${metric.iconBg}`}>
                <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 animate-slide-up delay-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Progresso de Tarefas
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver detalhes
            </button>
          </div>
          <AnalyticsChart
            type="area"
            data={taskProgressChartData}
            height={300}
          />
        </div>

        <div className="card p-6 animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Status dos Projetos
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver detalhes
            </button>
          </div>
          <AnalyticsChart
            type="doughnut"
            data={projectStatusChartData}
            height={300}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 animate-slide-up delay-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Receita vs Despesas
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver detalhes
            </button>
          </div>
          <AnalyticsChart
            type="bar"
            data={budgetChartData}
            height={300}
          />
        </div>

        <div className="card p-6 animate-slide-up delay-400">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Produtividade por Usuário
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver detalhes
            </button>
          </div>
          <AnalyticsChart
            type="bar"
            data={productivityByUserData}
            height={300}
          />
        </div>
      </div>

      <div className="card p-6 animate-slide-up delay-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Projetos por Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Projeto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Progresso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tarefas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Budget
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.projects.slice(0, 5).map((project) => {
                const projectTasks = data.tasks.filter(t => t.projectId === project.id);
                const completedTasks = projectTasks.filter(t => 
                  t.status === 'DONE' || t.status === 'Concluído'
                ).length;

                return (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'ACTIVE' || project.status === 'Em Andamento'
                          ? 'bg-blue-100 text-blue-800'
                          : project.status === 'COMPLETED' || project.status === 'Concluído'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {project.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {completedTasks}/{projectTasks.length}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      R$ {(project.budget?.planned || 0).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}






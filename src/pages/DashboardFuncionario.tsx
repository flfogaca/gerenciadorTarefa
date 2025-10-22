import { useState } from 'react';
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

const mockTasks = [
  {
    id: 1,
    title: 'Criar apresentação do projeto',
    project: 'Evento Corporativo Q1',
    status: 'Em andamento',
    priority: 'Alta',
    dueDate: '2024-01-25',
    estimatedHours: 8,
    completedHours: 5,
    assignee: 'Pedro Costa'
  },
  {
    id: 2,
    title: 'Revisar cronograma de atividades',
    project: 'Lançamento Produto',
    status: 'Pendente',
    priority: 'Média',
    dueDate: '2024-01-28',
    estimatedHours: 4,
    completedHours: 0,
    assignee: 'Pedro Costa'
  },
  {
    id: 3,
    title: 'Preparar material de treinamento',
    project: 'Workshop Digital',
    status: 'Concluído',
    priority: 'Baixa',
    dueDate: '2024-01-20',
    estimatedHours: 6,
    completedHours: 6,
    assignee: 'Pedro Costa'
  },
  {
    id: 4,
    title: 'Atualizar documentação técnica',
    project: 'Sistema Interno',
    status: 'Em andamento',
    priority: 'Média',
    dueDate: '2024-01-30',
    estimatedHours: 12,
    completedHours: 3,
    assignee: 'Pedro Costa'
  }
];

const stats = [
  { name: 'Tarefas Ativas', value: '8', change: '+2', changeType: 'positive', icon: Target },
  { name: 'Horas Trabalhadas', value: '32h', change: '+5h', changeType: 'positive', icon: Clock },
  { name: 'Taxa de Conclusão', value: '87%', change: '+12%', changeType: 'positive', icon: TrendingUp },
  { name: 'Projetos Ativos', value: '4', change: '+1', changeType: 'positive', icon: FileText },
];

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
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);

  const handleTaskClick = (taskId: number) => {
    setSelectedTask(selectedTask === taskId ? null : taskId);
  };

  const handleStartTimer = (taskId: number) => {
    setActiveTimer(activeTimer === taskId ? null : taskId);
  };

  const handleCompleteTask = (taskId: number) => {
    console.log('Marcar tarefa como concluída:', taskId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Minhas Tarefas</h1>
        <p className="text-gray-600 mt-2">Acompanhe suas atividades e progresso nos projetos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
                  {mockTasks.map((task) => (
                    <tr 
                      key={task.id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedTask === task.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{task.project}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(task.completedHours / task.estimatedHours) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{task.completedHours}h/{task.estimatedHours}h</span>
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
                              console.log('Visualizar tarefa:', task.id);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Visualizar"
                          >
                            <Eye size={14} />
                          </button>
                          {task.status !== 'Concluído' && (
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
                  ))}
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
                <p className="text-sm text-gray-600 mb-4">Tarefa: Criar apresentação do projeto</p>
                <div className="flex space-x-2">
                  <button className="btn-primary text-sm px-3 py-1">
                    Pausar
                  </button>
                  <button className="btn-secondary text-sm px-3 py-1">
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
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="text-red-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-red-800">Prazo Crítico</p>
                  <p className="text-xs text-red-600">Criar apresentação - 2 dias</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="text-yellow-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Prazo Próximo</p>
                  <p className="text-xs text-yellow-600">Revisar cronograma - 5 dias</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle2 className="text-blue-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-blue-800">Concluído</p>
                  <p className="text-xs text-blue-600">Preparar material de treinamento</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card animate-slide-up delay-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Semanal</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Horas Trabalhadas</span>
                <span className="text-sm font-semibold">32h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tarefas Concluídas</span>
                <span className="text-sm font-semibold">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Produtividade</span>
                <span className="text-sm font-semibold text-green-600">87%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

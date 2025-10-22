import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const mockProjects = [
  {
    id: 1,
    name: 'Evento Corporativo Q1',
    client: 'TechCorp',
    team: 'Equipe A',
    status: 'Em execução',
    size: 'Grande',
    budget: 150000,
    progress: 65,
    eventDate: '2024-03-15',
    priority: 'Alta'
  },
  {
    id: 2,
    name: 'Lançamento Produto',
    client: 'InnovaCorp',
    team: 'Equipe B',
    status: 'Em concorrência',
    size: 'Médio',
    budget: 80000,
    progress: 30,
    eventDate: '2024-04-20',
    priority: 'Média'
  },
  {
    id: 3,
    name: 'Workshop Digital',
    client: 'EduTech',
    team: 'Equipe C',
    status: 'Concluído',
    size: 'Pequeno',
    budget: 25000,
    progress: 100,
    eventDate: '2024-02-10',
    priority: 'Baixa'
  }
];

const stats = [
  { name: 'Projetos Ativos', value: '12', change: '+2', changeType: 'positive', icon: Target },
  { name: 'Equipes Gerenciadas', value: '4', change: '+1', changeType: 'positive', icon: Users },
  { name: 'Budget Total', value: 'R$ 2.4M', change: '+15%', changeType: 'positive', icon: DollarSign },
  { name: 'Taxa de Sucesso', value: '94%', change: '+3%', changeType: 'positive', icon: TrendingUp },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em execução': return 'bg-blue-100 text-blue-800';
    case 'Em concorrência': return 'bg-yellow-100 text-yellow-800';
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Alta': return 'bg-red-100 text-red-800';
    case 'Média': return 'bg-yellow-100 text-yellow-800';
    case 'Baixa': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function DashboardGestor() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleProjectClick = (projectId: number) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  const handleViewProject = (projectId: number) => {
    console.log('Visualizar projeto:', projectId);
  };

  const handleEditProject = (projectId: number) => {
    console.log('Editar projeto:', projectId);
  };

  const handleNewProject = () => {
    navigate('/tarefas?modal=new-task');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Gestor</h1>
        <p className="text-gray-600 mt-2">Visão estratégica dos projetos e equipes sob sua gestão</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedProject === project.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.team}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{project.client}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{project.progress}%</span>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card animate-slide-up delay-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Em Execução</span>
                </div>
                <span className="text-sm font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Em Concorrência</span>
                </div>
                <span className="text-sm font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Concluídos</span>
                </div>
                <span className="text-sm font-semibold">15</span>
              </div>
            </div>
          </div>

          <div className="card animate-slide-up delay-400">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Importantes</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="text-red-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-red-800">Prazo Crítico</p>
                  <p className="text-xs text-red-600">Evento Corporativo Q1 - 2 dias</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="text-yellow-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Aprovação Pendente</p>
                  <p className="text-xs text-yellow-600">Lançamento Produto - Budget</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle2 className="text-blue-500 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-blue-800">Concluído</p>
                  <p className="text-xs text-blue-600">Workshop Digital</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardGestor from './DashboardGestor';
import DashboardFuncionario from './DashboardFuncionario';
import DashboardDiretor from './DashboardDiretor';
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

const mockProjects = [
  {
    id: 1,
    name: 'Evento Corporativo Q1',
    client: 'TechCorp Brasil',
    status: 'Em Execução',
    team: 'Negócios, Gestão, Planejamento',
    budget: 150000,
    eventDate: '2025-03-15',
    entryDate: '2025-01-10',
    deliveryDate: '2025-03-10',
    size: 'Grande',
    progress: 65
  },
  {
    id: 2,
    name: 'Lançamento Produto',
    client: 'Inovação Ltda',
    status: 'Em Concorrência',
    team: 'Negócios, Criação',
    budget: 85000,
    eventDate: '2025-04-20',
    entryDate: '2025-02-01',
    deliveryDate: '2025-04-15',
    size: 'Médio',
    progress: 25
  },
  {
    id: 3,
    name: 'Workshop Digital',
    client: 'Academia Digital',
    status: 'Concluído',
    team: 'Planejamento, Produção',
    budget: 25000,
    eventDate: '2025-01-30',
    entryDate: '2024-12-15',
    deliveryDate: '2025-01-25',
    size: 'Pequeno',
    progress: 100
  },
  {
    id: 4,
    name: 'Conferência Anual',
    client: 'Associação Comercial',
    status: 'Declinado',
    team: 'Negócios, Gestão',
    budget: 200000,
    eventDate: '2025-06-10',
    entryDate: '2024-11-20',
    deliveryDate: '2025-06-05',
    size: 'Grande',
    progress: 0
  }
];

const stats = [
  { name: 'Projetos Ativos', value: '12', change: '+2', changeType: 'positive', icon: TrendingUp },
  { name: 'Equipe', value: '28', change: '+3', changeType: 'positive', icon: Users },
  { name: 'Eventos Este Mês', value: '5', change: '0', changeType: 'neutral', icon: Calendar },
  { name: 'Receita Total', value: 'R$ 1.2M', change: '+15%', changeType: 'positive', icon: DollarSign }
];

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
  const { user } = useAuth();

  const handleProjectClick = (projectId: number) => {
    setSelectedProject(selectedProject === projectId ? null : projectId);
  };

  const handleViewProject = (projectId: number) => {
    console.log('Visualizar projeto:', projectId);
  };

  const handleEditProject = (projectId: number) => {
    console.log('Editar projeto:', projectId);
  };

  // Renderizar dashboard específico baseado no tipo de usuário
  if (user?.role === 'Gestor') {
    return <DashboardGestor />;
  }
  
  if (user?.role === 'Funcionário') {
    return <DashboardFuncionario />;
  }
  
  if (user?.role === 'Diretor') {
    return <DashboardDiretor />;
  }
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Projetos</h1>
        <p className="text-gray-600 mt-2">Visão macro de todos os projetos ativos e históricos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.name} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.changeType === 'positive' ? 'bg-green-100' : 
                stat.changeType === 'negative' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <stat.icon className={`${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`} size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 
                stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs mês anterior</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card animate-slide-up delay-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Projetos Recentes</h2>
            <div className="flex space-x-2">
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
                    {mockProjects.map((project) => (
                      <tr 
                        key={project.id} 
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedProject === project.id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">{project.team}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.client}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSizeColor(project.size)}`}>
                            {project.size}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {project.budget.toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(project.eventDate).toLocaleDateString('pt-BR')}
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
                                console.log('Mais opções:', project.id);
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
              <span className="text-sm font-medium text-gray-900">8</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Em Execução</span>
              </div>
              <span className="text-sm font-medium text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Em Concorrência</span>
              </div>
              <span className="text-sm font-medium text-gray-900">5</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Declinados</span>
              </div>
              <span className="text-sm font-medium text-gray-900">3</span>
            </div>
          </div>
        </div>

        <div className="card animate-slide-up delay-400">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas e Prazos</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-red-800">Prazo próximo</p>
                <p className="text-xs text-red-600">Evento Corporativo Q1 - 3 dias</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-yellow-800">Atividade atrasada</p>
                <p className="text-xs text-yellow-600">Design System - 2 dias de atraso</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-green-800">Projeto concluído</p>
                <p className="text-xs text-green-600">Workshop Digital - Finalizado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

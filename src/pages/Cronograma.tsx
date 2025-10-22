import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Pause,
  Plus,
  Filter,
  Grid3X3,
  List,
  Calendar as CalendarIcon
} from 'lucide-react';

const mockActivities = [
  {
    id: 1,
    projectId: 1,
    projectName: 'Evento Corporativo Q1',
    client: 'TechCorp Brasil',
    area: 'Negócios',
    activity: 'Briefing inicial e levantamento de requisitos',
    responsible: 'Maria Silva',
    startDate: '2025-01-10',
    endDate: '2025-01-15',
    status: 'Concluído',
    progress: 100,
    attachments: 3
  },
  {
    id: 2,
    projectId: 1,
    projectName: 'Evento Corporativo Q1',
    client: 'TechCorp Brasil',
    area: 'Gestão de Projeto',
    activity: 'Planejamento estratégico e cronograma',
    responsible: 'João Santos',
    startDate: '2025-01-16',
    endDate: '2025-01-25',
    status: 'Em Andamento',
    progress: 75,
    attachments: 1
  },
  {
    id: 3,
    projectId: 1,
    projectName: 'Evento Corporativo Q1',
    client: 'TechCorp Brasil',
    area: 'Planejamento',
    activity: 'Definição de escopo e recursos',
    responsible: 'Ana Costa',
    startDate: '2025-01-26',
    endDate: '2025-02-05',
    status: 'Em Andamento',
    progress: 40,
    attachments: 0
  },
  {
    id: 4,
    projectId: 1,
    projectName: 'Evento Corporativo Q1',
    client: 'TechCorp Brasil',
    area: 'Criação',
    activity: 'Desenvolvimento de identidade visual',
    responsible: 'Carlos Lima',
    startDate: '2025-02-06',
    endDate: '2025-02-20',
    status: 'A Iniciar',
    progress: 0,
    attachments: 0
  },
  {
    id: 5,
    projectId: 1,
    projectName: 'Evento Corporativo Q1',
    client: 'TechCorp Brasil',
    area: 'Produção',
    activity: 'Execução do evento',
    responsible: 'Pedro Oliveira',
    startDate: '2025-03-10',
    endDate: '2025-03-15',
    status: 'A Iniciar',
    progress: 0,
    attachments: 0
  },
  {
    id: 6,
    projectId: 2,
    projectName: 'Lançamento Produto',
    client: 'Inovação Ltda',
    area: 'Negócios',
    activity: 'Proposta comercial',
    responsible: 'Maria Silva',
    startDate: '2025-02-01',
    endDate: '2025-02-10',
    status: 'Em Andamento',
    progress: 60,
    attachments: 2
  }
];

const areas = ['Negócios', 'Gestão de Projeto', 'Planejamento', 'Criação', 'Produção', 'Arquitetura', 'Financeiro'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Concluído': return 'bg-green-100 text-green-800';
    case 'Em Andamento': return 'bg-blue-100 text-blue-800';
    case 'A Iniciar': return 'bg-gray-100 text-gray-800';
    case 'Parado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getAreaColor = (area: string) => {
  const colors = {
    'Negócios': 'bg-purple-100 text-purple-800',
    'Gestão de Projeto': 'bg-blue-100 text-blue-800',
    'Planejamento': 'bg-green-100 text-green-800',
    'Criação': 'bg-yellow-100 text-yellow-800',
    'Produção': 'bg-orange-100 text-orange-800',
    'Arquitetura': 'bg-pink-100 text-pink-800',
    'Financeiro': 'bg-indigo-100 text-indigo-800'
  };
  return colors[area as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export default function Cronograma() {
  const [viewMode, setViewMode] = useState<'list' | 'gantt' | 'calendar'>('list');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activities, setActivities] = useState(mockActivities);

  const [newActivity, setNewActivity] = useState({
    projectId: '',
    projectName: '',
    client: '',
    area: '',
    activity: '',
    responsible: '',
    startDate: '',
    endDate: '',
    status: 'Pendente',
    progress: 0,
    attachments: 0
  });

  const filteredActivities = activities.filter(activity => {
    if (selectedProject !== 'all' && activity.projectId.toString() !== selectedProject) return false;
    if (selectedArea !== 'all' && activity.area !== selectedArea) return false;
    return true;
  });

  const handleCreateActivity = () => {
    if (!newActivity.projectName || !newActivity.activity || !newActivity.responsible || !newActivity.startDate || !newActivity.endDate) return;

    const activity = {
      id: Math.max(...activities.map(a => a.id)) + 1,
      projectId: parseInt(newActivity.projectId) || 1,
      projectName: newActivity.projectName,
      client: newActivity.client,
      area: newActivity.area,
      activity: newActivity.activity,
      responsible: newActivity.responsible,
      startDate: newActivity.startDate,
      endDate: newActivity.endDate,
      status: newActivity.status,
      progress: newActivity.progress,
      attachments: newActivity.attachments
    };

    setActivities([...activities, activity]);
    setShowCreateModal(false);
    setNewActivity({
      projectId: '',
      projectName: '',
      client: '',
      area: '',
      activity: '',
      responsible: '',
      startDate: '',
      endDate: '',
      status: 'Pendente',
      progress: 0,
      attachments: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cronograma Projetos</h1>
          <p className="text-gray-600 mt-2">Gestão detalhada de atividades e prazos</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Nova Atividade
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-500" />
              <select 
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Projetos</option>
                <option value="1">Evento Corporativo Q1</option>
                <option value="2">Lançamento Produto</option>
              </select>
            </div>
            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as Áreas</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`p-2 rounded ${viewMode === 'gantt' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <CalendarIcon size={20} />
            </button>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAreaColor(activity.area)}`}>
                        {activity.area}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{activity.activity}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Projeto:</strong> {activity.projectName} - {activity.client}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        {activity.responsible}
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {new Date(activity.startDate).toLocaleDateString('pt-BR')} - {new Date(activity.endDate).toLocaleDateString('pt-BR')}
                      </div>
                      {activity.attachments > 0 && (
                        <div className="flex items-center">
                          <span className="text-blue-600">{activity.attachments} anexos</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${activity.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{activity.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'gantt' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Grid3X3 size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Visualização Gantt em desenvolvimento</p>
              <p className="text-sm">Esta funcionalidade será implementada em breve</p>
            </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Visualização Calendário em desenvolvimento</p>
              <p className="text-sm">Esta funcionalidade será implementada em breve</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades por Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Concluídas</span>
              </div>
              <span className="text-sm font-medium text-gray-900">8</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Em Andamento</span>
              </div>
              <span className="text-sm font-medium text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">A Iniciar</span>
              </div>
              <span className="text-sm font-medium text-gray-900">15</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Paradas</span>
              </div>
              <span className="text-sm font-medium text-gray-900">3</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Prazos</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-red-800">Briefing inicial</p>
                <p className="text-xs text-red-600">Evento Corporativo Q1 - 2 dias</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-yellow-800">Planejamento estratégico</p>
                <p className="text-xs text-yellow-600">Evento Corporativo Q1 - 5 dias</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-sm font-medium text-blue-800">Proposta comercial</p>
                <p className="text-xs text-blue-600">Lançamento Produto - 7 dias</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades por Área</h3>
          <div className="space-y-3">
            {areas.map((area, index) => (
              <div key={area} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'][index]
                  }`}></div>
                  <span className="text-sm text-gray-600">{area}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{Math.floor(Math.random() * 10) + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Nova Atividade */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Nova Atividade</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto *</label>
                    <input
                      type="text"
                      value={newActivity.projectName}
                      onChange={(e) => setNewActivity({...newActivity, projectName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite o nome do projeto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <input
                      type="text"
                      value={newActivity.client}
                      onChange={(e) => setNewActivity({...newActivity, client: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do cliente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área *</label>
                    <select
                      value={newActivity.area}
                      onChange={(e) => setNewActivity({...newActivity, area: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione uma área</option>
                      <option value="Negócios">Negócios</option>
                      <option value="Gestão de Projeto">Gestão de Projeto</option>
                      <option value="Planejamento">Planejamento</option>
                      <option value="Criação">Criação</option>
                      <option value="Produção">Produção</option>
                      <option value="Arquitetura">Arquitetura</option>
                      <option value="Financeiro">Financeiro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
                    <input
                      type="text"
                      value={newActivity.responsible}
                      onChange={(e) => setNewActivity({...newActivity, responsible: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início *</label>
                    <input
                      type="date"
                      value={newActivity.startDate}
                      onChange={(e) => setNewActivity({...newActivity, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim *</label>
                    <input
                      type="date"
                      value={newActivity.endDate}
                      onChange={(e) => setNewActivity({...newActivity, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Atividade *</label>
                  <textarea
                    value={newActivity.activity}
                    onChange={(e) => setNewActivity({...newActivity, activity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva a atividade"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={newActivity.status}
                      onChange={(e) => setNewActivity({...newActivity, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Parado">Parado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progresso (%)</label>
                    <input
                      type="number"
                      value={newActivity.progress}
                      onChange={(e) => setNewActivity({...newActivity, progress: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateActivity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Atividade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

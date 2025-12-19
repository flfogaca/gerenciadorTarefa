import React, { useState, useEffect } from 'react';
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
import apiService from '../services/api';


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
  const [activities, setActivities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newActivity, setNewActivity] = useState({
    projectId: '',
    projectName: '',
    client: '',
    area: '',
    activity: '',
    responsible: '',
    startDate: '',
    endDate: '',
    executionDays: '',
    status: 'Pendente',
    progress: 0,
    attachments: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [projectsResponse, tasksResponse] = await Promise.all([
        apiService.getProjects(),
        apiService.getTasks()
      ]);

      const projectsData = (projectsResponse as any).projects || [];
      const tasksData = (tasksResponse as any).tasks || [];

      setProjects(projectsData);
      setTasks(tasksData);

      const activitiesFromTasks = tasksData.map((task: any) => ({
        id: task.id,
        projectId: task.projectId || task.project?.id || '',
        projectName: task.project?.name || task.projectName || 'Sem Projeto',
        client: task.project?.clientName || task.client || '',
        area: task.category || task.area || 'Geral',
        activity: task.title || task.name || task.description || '',
        responsible: task.assignee?.name || task.assignedTo || '',
        startDate: task.startDate || task.createdAt?.split('T')[0] || '',
        endDate: task.dueDate || task.endDate || task.dueDate?.split('T')[0] || '',
        status: mapTaskStatus(task.status),
        progress: task.progress || 0,
        attachments: task.attachments?.length || 0
      }));

      setActivities(activitiesFromTasks);
    } catch (error: any) {
      console.error('Error loading schedule data:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao carregar dados do cronograma';
      
      if (activities.length === 0) {
        setActivities([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const mapTaskStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'A Iniciar',
      'in_progress': 'Em Andamento',
      'completed': 'Concluído',
      'cancelled': 'Parado',
      'Pendente': 'A Iniciar',
      'Em andamento': 'Em Andamento',
      'Concluído': 'Concluído'
    };
    return statusMap[status] || status || 'A Iniciar';
  };

  const filteredActivities = activities.filter(activity => {
    if (selectedProject !== 'all' && activity.projectId.toString() !== selectedProject) return false;
    if (selectedArea !== 'all' && activity.area !== selectedArea) return false;
    return true;
  });

  const handleCreateActivity = async () => {
    if (!newActivity.projectId || !newActivity.activity || !newActivity.startDate || !newActivity.endDate) return;

    try {
      const taskData = {
        title: newActivity.activity,
        description: newActivity.activity,
        projectId: newActivity.projectId,
        assigneeId: newActivity.responsible,
        startDate: newActivity.startDate,
        dueDate: newActivity.endDate,
        status: 'pending',
        priority: 'medium'
      };

      await apiService.createTask(taskData);
      await loadData();
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
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Erro ao criar atividade');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

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
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
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
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-[200px_1fr] gap-4">
                  <div className="font-semibold text-sm text-gray-700 p-2 border-b">Atividade</div>
                  <div className="font-semibold text-sm text-gray-700 p-2 border-b">Cronograma</div>
                  
                  {filteredActivities.map((activity) => {
                    const startDate = new Date(activity.startDate);
                    const endDate = new Date(activity.endDate);
                    const today = new Date();
                    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const progressPercent = Math.max(0, Math.min(100, (daysPassed / totalDays) * 100));
                    
                    return (
                      <React.Fragment key={activity.id}>
                        <div className="p-2 border-b text-sm">
                          <div className="font-medium text-gray-900">{activity.activity}</div>
                          <div className="text-xs text-gray-500">{activity.projectName}</div>
                        </div>
                        <div className="p-2 border-b relative">
                          <div className="relative h-8 bg-gray-100 rounded">
                            <div 
                              className={`absolute h-full rounded ${
                                activity.status === 'Concluído' ? 'bg-green-500' :
                                activity.status === 'Em Andamento' ? 'bg-blue-500' :
                                activity.status === 'Parado' ? 'bg-red-500' : 'bg-gray-400'
                              }`}
                              style={{ 
                                width: `${Math.min(100, progressPercent)}%`,
                                left: '0%'
                              }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-700 font-medium">
                              {new Date(activity.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {new Date(activity.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  
                  {filteredActivities.length === 0 && (
                    <>
                      <div className="col-span-2 p-8 text-center text-gray-500">
                        Nenhuma atividade encontrada
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center font-semibold text-sm text-gray-700 p-2">
                  {day}
                </div>
              ))}
              
              {(() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - startDate.getDay());
                
                const days: JSX.Element[] = [];
                const currentDate = new Date(startDate);
                
                for (let i = 0; i < 42; i++) {
                  const dateStr = currentDate.toISOString().split('T')[0];
                  const dayActivities = filteredActivities.filter(a => {
                    if (!a.startDate || !a.endDate) return false;
                    try {
                      const start = new Date(a.startDate);
                      const end = new Date(a.endDate);
                      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
                      const startStr = start.toISOString().split('T')[0];
                      const endStr = end.toISOString().split('T')[0];
                      return dateStr >= startStr && dateStr <= endStr;
                    } catch {
                      return false;
                    }
                  });
                  
                  const isCurrentMonth = currentDate.getMonth() === today.getMonth();
                  const isToday = dateStr === today.toISOString().split('T')[0];
                  
                  days.push(
                    <div
                      key={i}
                      className={`min-h-[80px] p-1 border border-gray-200 ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className={`text-xs font-medium mb-1 ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                        {currentDate.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayActivities.slice(0, 2).map((activity, idx) => (
                          <div
                            key={idx}
                            className={`text-xs p-1 rounded truncate ${
                              activity.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                              activity.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' :
                              activity.status === 'Parado' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                            title={activity.activity}
                          >
                            {activity.activity}
                          </div>
                        ))}
                        {dayActivities.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayActivities.length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  
                  currentDate.setDate(currentDate.getDate() + 1);
                }
                
                return days;
              })()}
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
              <span className="text-sm font-medium text-gray-900">
                {activities.filter(a => a.status === 'Concluído').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Em Andamento</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {activities.filter(a => a.status === 'Em Andamento').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">A Iniciar</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {activities.filter(a => a.status === 'A Iniciar').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Paradas</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {activities.filter(a => a.status === 'Parado').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Prazos</h3>
          <div className="space-y-4">
            {(() => {
              const upcomingDeadlines = activities
                .filter(a => {
                  if (!a.endDate) return false;
                  const endDate = new Date(a.endDate);
                  const daysUntilDue = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return daysUntilDue > 0 && daysUntilDue <= 7 && a.status !== 'Concluído';
                })
                .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
                .slice(0, 3);
              
              if (upcomingDeadlines.length === 0) {
                return (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum prazo próximo</p>
                );
              }
              
              return upcomingDeadlines.map((activity) => {
                const endDate = new Date(activity.endDate);
                const daysUntilDue = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntilDue <= 2;
                const bgColor = isUrgent ? 'bg-red-50' : daysUntilDue <= 4 ? 'bg-yellow-50' : 'bg-blue-50';
                const textColor = isUrgent ? 'text-red-800' : daysUntilDue <= 4 ? 'text-yellow-800' : 'text-blue-800';
                const iconColor = isUrgent ? 'text-red-500' : daysUntilDue <= 4 ? 'text-yellow-500' : 'text-blue-500';
                const Icon = isUrgent ? AlertCircle : daysUntilDue <= 4 ? Clock : Calendar;
                
                return (
                  <div key={activity.id} className={`flex items-start space-x-3 p-3 ${bgColor} rounded-lg`}>
                    <Icon className={`${iconColor} flex-shrink-0 mt-0.5`} size={16} />
                    <div>
                      <p className={`text-sm font-medium ${textColor}`}>{activity.activity}</p>
                      <p className={`text-xs ${textColor.replace('800', '600')}`}>
                        {activity.projectName} - {daysUntilDue} {daysUntilDue === 1 ? 'dia' : 'dias'}
                      </p>
                    </div>
                  </div>
                );
              });
            })()}
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
                  <span className="text-sm font-medium text-gray-900">
                    {activities.filter(a => a.area === area).length}
                  </span>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Projeto *</label>
                    <select
                      value={newActivity.projectId}
                      onChange={(e) => {
                        const selectedProject = projects.find(p => p.id === e.target.value);
                        setNewActivity({
                          ...newActivity,
                          projectId: e.target.value,
                          projectName: selectedProject?.name || '',
                          client: selectedProject?.clientName || ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um projeto</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dias de Execução</label>
                    <input
                      type="number"
                      value={newActivity.executionDays}
                      onChange={(e) => setNewActivity({...newActivity, executionDays: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      placeholder="Ex: 5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Número de dias úteis para execução</p>
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

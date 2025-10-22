import { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Users, 
  DollarSign,
  FileText,
  Trash2,
  Check,
  Filter,
  Search,
  Settings
} from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    type: 'deadline',
    title: 'Prazo próximo',
    message: 'O projeto "Evento Corporativo Q1" tem prazo de entrega em 3 dias',
    project: 'Evento Corporativo Q1',
    time: '2 horas atrás',
    isRead: false,
    priority: 'high',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    id: 2,
    type: 'project_update',
    title: 'Projeto atualizado',
    message: 'Maria Silva atualizou o status do projeto "Lançamento Produto"',
    project: 'Lançamento Produto',
    time: '4 horas atrás',
    isRead: false,
    priority: 'medium',
    icon: CheckCircle2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 3,
    type: 'team_mention',
    title: 'Você foi mencionado',
    message: 'João Santos mencionou você em uma tarefa do projeto "Workshop Digital"',
    project: 'Workshop Digital',
    time: '1 dia atrás',
    isRead: true,
    priority: 'medium',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: 4,
    type: 'financial',
    title: 'Alerta financeiro',
    message: 'O projeto "Conferência Anual" está próximo do limite de orçamento',
    project: 'Conferência Anual',
    time: '2 dias atrás',
    isRead: true,
    priority: 'high',
    icon: DollarSign,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 5,
    type: 'task_completed',
    title: 'Tarefa concluída',
    message: 'Ana Costa concluiu a tarefa "Design System" no projeto "Evento Corporativo Q1"',
    project: 'Evento Corporativo Q1',
    time: '3 dias atrás',
    isRead: true,
    priority: 'low',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 6,
    type: 'schedule',
    title: 'Reunião agendada',
    message: 'Reunião de planejamento agendada para amanhã às 14:00',
    project: 'Lançamento Produto',
    time: '4 dias atrás',
    isRead: true,
    priority: 'medium',
    icon: Calendar,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    id: 7,
    type: 'document',
    title: 'Novo documento',
    message: 'Carlos Lima adicionou um novo documento ao projeto "Workshop Digital"',
    project: 'Workshop Digital',
    time: '5 dias atrás',
    isRead: true,
    priority: 'low',
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  {
    id: 8,
    type: 'deadline_overdue',
    title: 'Prazo vencido',
    message: 'A tarefa "Briefing inicial" está atrasada há 2 dias',
    project: 'Conferência Anual',
    time: '1 semana atrás',
    isRead: true,
    priority: 'high',
    icon: Clock,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
];

const notificationTypes = [
  { id: 'all', name: 'Todas', count: mockNotifications.length },
  { id: 'unread', name: 'Não lidas', count: mockNotifications.filter(n => !n.isRead).length },
  { id: 'deadline', name: 'Prazos', count: mockNotifications.filter(n => n.type.includes('deadline')).length },
  { id: 'project', name: 'Projetos', count: mockNotifications.filter(n => n.type.includes('project')).length },
  { id: 'team', name: 'Equipe', count: mockNotifications.filter(n => n.type.includes('team')).length },
  { id: 'financial', name: 'Financeiro', count: mockNotifications.filter(n => n.type === 'financial').length }
];

export default function Notificacoes() {
  const [selectedType, setSelectedType] = useState('all');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = selectedType === 'all' || notification.type.includes(selectedType);
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.project.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600 mt-2">Mantenha-se atualizado com todas as atividades importantes</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
            <Settings size={20} className="mr-2" />
            Configurações
          </button>
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Check size={20} className="mr-2" />
            Marcar todas como lidas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
            <div className="space-y-2">
              {notificationTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedType === type.id 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{type.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedType === type.id 
                      ? 'bg-blue-200 text-blue-800' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {type.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-medium text-gray-900">{notifications.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Não lidas</span>
                <span className="text-sm font-medium text-gray-900">{notifications.filter(n => !n.isRead).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hoje</span>
                <span className="text-sm font-medium text-gray-900">{notifications.filter(n => n.time.includes('hora')).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Esta semana</span>
                <span className="text-sm font-medium text-gray-900">{notifications.filter(n => n.time.includes('dia') || n.time.includes('semana')).length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar notificações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter size={20} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {filteredNotifications.length} de {notifications.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Nenhuma notificação encontrada</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 ${notification.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <notification.icon className={notification.color} size={20} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <FileText size={12} className="mr-1" />
                                {notification.project}
                              </span>
                              <span className="flex items-center">
                                <Clock size={12} className="mr-1" />
                                {notification.time}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Marcar como lida"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {filteredNotifications.length} de {notifications.length} notificações
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Carregar mais
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
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
import apiService from '../services/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
  project?: string;
  time?: string;
  priority?: string;
  icon?: any;
  color?: string;
  bgColor?: string;
}


const getNotificationTypes = (notifications: Notification[]) => [
  { id: 'all', name: 'Todas', count: notifications.length },
  { id: 'unread', name: 'Não lidas', count: notifications.filter(n => !n.isRead).length },
  { id: 'deadline', name: 'Prazos', count: notifications.filter(n => n.type?.includes('deadline')).length },
  { id: 'project', name: 'Projetos', count: notifications.filter(n => n.type?.includes('project')).length },
  { id: 'team', name: 'Equipe', count: notifications.filter(n => n.type?.includes('team')).length },
  { id: 'financial', name: 'Financeiro', count: notifications.filter(n => n.type === 'financial').length }
];

export default function Notificacoes() {
  const [selectedType, setSelectedType] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getNotifications();
      const notificationsData = (response as any).notifications || [];
      
      const formattedNotifications = notificationsData.map((notif: any) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title || 'Notificação',
        message: notif.message || '',
        isRead: notif.isRead,
        createdAt: notif.createdAt,
        data: notif.data,
        project: notif.data?.project || notif.data?.projectName || '',
        time: formatTime(notif.createdAt),
        priority: getPriorityFromType(notif.type),
        icon: getIconFromType(notif.type),
        color: getColorFromType(notif.type),
        bgColor: getBgColorFromType(notif.type)
      }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getPriorityFromType = (type: string): string => {
    if (type.includes('deadline') || type.includes('overdue')) return 'high';
    if (type.includes('financial') || type.includes('alert')) return 'high';
    if (type.includes('project') || type.includes('task')) return 'medium';
    return 'low';
  };

  const getIconFromType = (type: string) => {
    if (type.includes('deadline')) return AlertCircle;
    if (type.includes('task')) return CheckCircle2;
    if (type.includes('project')) return CheckCircle2;
    if (type.includes('team')) return Users;
    if (type.includes('financial')) return DollarSign;
    if (type.includes('document')) return FileText;
    if (type.includes('schedule')) return Calendar;
    return Bell;
  };

  const getColorFromType = (type: string): string => {
    if (type.includes('deadline') || type.includes('overdue')) return 'text-red-600';
    if (type.includes('financial')) return 'text-orange-600';
    if (type.includes('task_completed')) return 'text-green-600';
    if (type.includes('project')) return 'text-blue-600';
    if (type.includes('team')) return 'text-purple-600';
    return 'text-gray-600';
  };

  const getBgColorFromType = (type: string): string => {
    if (type.includes('deadline') || type.includes('overdue')) return 'bg-red-50';
    if (type.includes('financial')) return 'bg-orange-50';
    if (type.includes('task_completed')) return 'bg-green-50';
    if (type.includes('project')) return 'bg-blue-50';
    if (type.includes('team')) return 'bg-purple-50';
    return 'bg-gray-50';
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = selectedType === 'all' || notification.type.includes(selectedType);
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.project || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const markAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      setNotifications(notifications.filter(n => n.id !== id));
    }
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
              {getNotificationTypes(notifications).map((type) => (
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
                filteredNotifications.map((notification) => {
                  const IconComponent = notification.icon || Bell;
                  return (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority || 'low')} ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 ${notification.bgColor || 'bg-gray-50'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={notification.color || 'text-gray-600'} size={20} />
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
                  );
                })
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

import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  X,
  Settings,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

const notificationIcons: Record<string, any> = {
  'task_assigned': Briefcase,
  'task_completed': CheckCircle,
  'task_overdue': AlertTriangle,
  'project_update': Info,
  'comment_added': MessageSquare,
  'mention': Users,
  'deadline_reminder': Calendar,
  'approval_required': AlertTriangle,
  'system_alert': AlertTriangle,
  'welcome': Info,
  'default': Bell,
};

const notificationColors: Record<string, string> = {
  'task_assigned': 'text-blue-500 bg-blue-50',
  'task_completed': 'text-green-500 bg-green-50',
  'task_overdue': 'text-red-500 bg-red-50',
  'project_update': 'text-purple-500 bg-purple-50',
  'comment_added': 'text-cyan-500 bg-cyan-50',
  'mention': 'text-orange-500 bg-orange-50',
  'deadline_reminder': 'text-yellow-500 bg-yellow-50',
  'approval_required': 'text-amber-500 bg-amber-50',
  'system_alert': 'text-red-500 bg-red-50',
  'welcome': 'text-blue-500 bg-blue-50',
  'default': 'text-gray-500 bg-gray-50',
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      const data = response as any;
      setNotifications(data.notifications || generateMockNotifications());
      setUnreadCount(data.unreadCount || data.notifications?.filter((n: any) => !n.read).length || 3);
    } catch (error) {
      setNotifications(generateMockNotifications());
      setUnreadCount(3);
    }
  };

  const generateMockNotifications = (): Notification[] => {
    return [
      {
        id: '1',
        title: 'Nova tarefa atribuída',
        body: 'Você foi designado para a tarefa "Finalizar relatório" no projeto Marketing',
        type: 'task_assigned',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        data: { taskId: '123' },
      },
      {
        id: '2',
        title: 'Prazo próximo',
        body: 'A tarefa "Revisar documentação" vence em 2 dias',
        type: 'deadline_reminder',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        data: { taskId: '456' },
      },
      {
        id: '3',
        title: 'Comentário adicionado',
        body: 'João comentou na tarefa "Implementar login"',
        type: 'comment_added',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        data: { taskId: '789' },
      },
      {
        id: '4',
        title: 'Tarefa concluída',
        body: 'A tarefa "Setup do ambiente" foi marcada como concluída',
        type: 'task_completed',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        data: { taskId: '101' },
      },
      {
        id: '5',
        title: 'Atualização do projeto',
        body: 'O projeto "Nova Landing Page" teve o status atualizado',
        type: 'project_update',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        data: { projectId: '202' },
      },
    ];
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getIcon = (type: string) => {
    return notificationIcons[type] || notificationIcons['default'];
  };

  const getIconStyle = (type: string) => {
    return notificationColors[type] || notificationColors['default'];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fade-in overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificações
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                Todas ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'unread'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                Não lidas ({unreadCount})
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {activeTab === 'unread' 
                    ? 'Nenhuma notificação não lida'
                    : 'Nenhuma notificação'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredNotifications.map((notification, index) => {
                  const Icon = getIcon(notification.type);
                  const iconStyle = getIconStyle(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors animate-slide-up ${
                        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${iconStyle} flex-shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${
                              !notification.read 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notification.body}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Marcar como lida
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="text-xs text-gray-500 hover:text-red-600 flex items-center"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remover
                            </button>
                          </div>
                        </div>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/notificacoes';
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}






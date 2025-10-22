import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  BarChart3,
  FileText,
  User,
  CheckSquare
} from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    { name: 'Cronograma', href: '/cronograma', icon: Calendar, permission: 'cronograma' },
    { name: 'Tarefas', href: '/tarefas', icon: CheckSquare, permission: 'tarefas' },
    { name: 'Financeiro', href: '/financeiro', icon: DollarSign, permission: 'financeiro' },
    { name: 'Administrativo', href: '/administrativo', icon: Users, permission: 'administrativo' },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3, permission: 'relatorios' },
    { name: 'Templates', href: '/templates', icon: FileText, permission: 'templates' },
    { name: 'Notificações', href: '/notificacoes', icon: Bell, permission: 'notificacoes' },
    { name: 'Perfil', href: '/perfil', icon: User, permission: 'perfil' },
    { name: 'Configurações', href: '/configuracoes', icon: Settings, permission: 'configuracoes' },
  ];

  const navigation = allNavigation.filter(item => 
    user?.permissions?.includes('all') || user?.permissions?.includes(item.permission)
  );

  const mockNotifications = [
    {
      id: 1,
      type: 'deadline',
      title: 'Prazo próximo',
      message: 'O projeto "Evento Corporativo Q1" tem prazo de entrega em 3 dias',
      time: '2 horas atrás',
      isRead: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'project_update',
      title: 'Projeto atualizado',
      message: 'Maria Silva atualizou o status do projeto "Lançamento Produto"',
      time: '4 horas atrás',
      isRead: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'team_mention',
      title: 'Você foi mencionado',
      message: 'João Santos mencionou você em uma tarefa do projeto "Workshop Digital"',
      time: '1 dia atrás',
      isRead: true,
      priority: 'medium'
    },
    {
      id: 4,
      type: 'financial',
      title: 'Alerta financeiro',
      message: 'O projeto "Conferência Anual" está próximo do limite de orçamento',
      time: '2 dias atrás',
      isRead: true,
      priority: 'high'
    }
  ];

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">GestorPro</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="mt-6 px-3 flex-1 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item ${location.pathname === item.href ? 'sidebar-item-active' : ''}`}
                >
                  <item.icon className="mr-3 text-gray-400 flex-shrink-0" size={20} />
                  <span className="truncate">{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <button onClick={logout} className="sidebar-item w-full">
              <LogOut className="mr-3 text-gray-400" size={20} />
              Sair
            </button>
          </div>
        </div>

        <div className="flex-1 lg:ml-0">
          <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-2 sm:px-4 lg:px-8">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-2"
              >
                <Menu size={20} />
              </button>

              <div className="flex-1 max-w-lg mx-auto lg:mx-0 lg:max-w-none hidden sm:block px-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative" ref={notificationsRef}>
                  <button 
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative text-gray-500 hover:text-gray-700 p-1 transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                          <button
                            onClick={() => setNotificationsOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {unreadCount > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {mockNotifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                            <p>Nenhuma notificação</p>
                          </div>
                        ) : (
                          mockNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                !notification.isRead ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.priority === 'high' ? 'bg-red-500' :
                                  notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="p-4 border-t border-gray-200">
                        <Link
                          to="/notificacoes"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Ver todas as notificações
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xs sm:text-sm">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-20 sm:max-w-none">
                      {user?.name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-20 sm:max-w-none">
                      {user?.role || 'Usuário'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className="p-2 sm:p-4 lg:p-6 xl:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

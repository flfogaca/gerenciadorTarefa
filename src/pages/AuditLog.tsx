import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  Calendar,
  User,
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  Settings,
  Shield,
  RefreshCw
} from 'lucide-react';
import apiService from '../services/api';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail: string;
  userName: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  tenantId: string;
}

const actionIcons: Record<string, any> = {
  'CREATE': Plus,
  'UPDATE': Edit,
  'DELETE': Trash2,
  'READ': Eye,
  'LOGIN': LogIn,
  'LOGOUT': LogOut,
  'SETTINGS_CHANGE': Settings,
  'PERMISSION_CHANGE': Shield,
  'default': Activity,
};

const actionColors: Record<string, string> = {
  'CREATE': 'bg-green-100 text-green-800',
  'UPDATE': 'bg-blue-100 text-blue-800',
  'DELETE': 'bg-red-100 text-red-800',
  'READ': 'bg-gray-100 text-gray-800',
  'LOGIN': 'bg-cyan-100 text-cyan-800',
  'LOGOUT': 'bg-orange-100 text-orange-800',
  'SETTINGS_CHANGE': 'bg-purple-100 text-purple-800',
  'PERMISSION_CHANGE': 'bg-yellow-100 text-yellow-800',
  'default': 'bg-gray-100 text-gray-800',
};

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 20;

  useEffect(() => {
    loadAuditLogs();
  }, [page, selectedAction, selectedEntity, dateFrom, dateTo]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const mockLogs = generateMockLogs(100);
      
      let filteredLogs = mockLogs;
      
      if (selectedAction) {
        filteredLogs = filteredLogs.filter(l => l.action === selectedAction);
      }
      if (selectedEntity) {
        filteredLogs = filteredLogs.filter(l => l.entityType === selectedEntity);
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredLogs = filteredLogs.filter(l => 
          l.userEmail.toLowerCase().includes(term) ||
          l.userName.toLowerCase().includes(term) ||
          l.entityId.toLowerCase().includes(term)
        );
      }
      if (dateFrom) {
        filteredLogs = filteredLogs.filter(l => new Date(l.createdAt) >= new Date(dateFrom));
      }
      if (dateTo) {
        filteredLogs = filteredLogs.filter(l => new Date(l.createdAt) <= new Date(dateTo));
      }
      
      setTotalPages(Math.ceil(filteredLogs.length / itemsPerPage));
      
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);
      
      setLogs(paginatedLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockLogs = (count: number): AuditLogEntry[] => {
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT', 'SETTINGS_CHANGE', 'PERMISSION_CHANGE'];
    const entities = ['User', 'Project', 'Task', 'Client', 'Invoice', 'Expense', 'Payment', 'Settings'];
    const users = [
      { id: '1', email: 'admin@gestor.com', name: 'Administrador' },
      { id: '2', email: 'manager@gestor.com', name: 'Gestor Silva' },
      { id: '3', email: 'user@gestor.com', name: 'João Santos' },
    ];

    return Array.from({ length: count }, (_, i) => {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const entity = entities[Math.floor(Math.random() * entities.length)];
      const date = new Date();
      date.setHours(date.getHours() - Math.floor(Math.random() * 720));

      return {
        id: `audit-${i + 1}`,
        action,
        entityType: entity,
        entityId: `${entity.toLowerCase()}-${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        details: generateMockDetails(action, entity),
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: date.toISOString(),
        tenantId: 'default-tenant',
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const generateMockDetails = (action: string, entity: string) => {
    switch (action) {
      case 'CREATE':
        return { message: `Novo ${entity} criado` };
      case 'UPDATE':
        return { 
          message: `${entity} atualizado`,
          changes: { status: { old: 'pending', new: 'active' } }
        };
      case 'DELETE':
        return { message: `${entity} removido` };
      case 'LOGIN':
        return { message: 'Login realizado com sucesso' };
      case 'LOGOUT':
        return { message: 'Logout realizado' };
      default:
        return { message: `Ação em ${entity}` };
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Ação', 'Entidade', 'ID Entidade', 'Usuário', 'Email', 'IP', 'Data'].join(','),
      ...logs.map(log => [
        log.id,
        log.action,
        log.entityType,
        log.entityId,
        log.userName,
        log.userEmail,
        log.ipAddress,
        new Date(log.createdAt).toLocaleString('pt-BR'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getActionIcon = (action: string) => {
    const Icon = actionIcons[action] || actionIcons['default'];
    return Icon;
  };

  const getActionColor = (action: string) => {
    return actionColors[action] || actionColors['default'];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Registro de Auditoria
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Acompanhe todas as ações realizadas no sistema
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <button
            onClick={() => { setPage(1); loadAuditLogs(); }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuário, email ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadAuditLogs()}
              className="input-field pl-10"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center ${showFilters ? 'bg-blue-50 text-blue-600' : ''}`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ação
              </label>
              <select
                value={selectedAction}
                onChange={(e) => { setSelectedAction(e.target.value); setPage(1); }}
                className="input-field"
              >
                <option value="">Todas as ações</option>
                <option value="CREATE">Criar</option>
                <option value="UPDATE">Atualizar</option>
                <option value="DELETE">Excluir</option>
                <option value="READ">Visualizar</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="SETTINGS_CHANGE">Config. Alterada</option>
                <option value="PERMISSION_CHANGE">Permissão Alterada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entidade
              </label>
              <select
                value={selectedEntity}
                onChange={(e) => { setSelectedEntity(e.target.value); setPage(1); }}
                className="input-field"
              >
                <option value="">Todas as entidades</option>
                <option value="User">Usuário</option>
                <option value="Project">Projeto</option>
                <option value="Task">Tarefa</option>
                <option value="Client">Cliente</option>
                <option value="Invoice">Fatura</option>
                <option value="Expense">Despesa</option>
                <option value="Settings">Configurações</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="input-field"
              />
            </div>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Carregando registros...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ação
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entidade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((log, index) => {
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <tr 
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 animate-slide-up"
                      style={{ animationDelay: `${index * 0.02}s` }}
                    >
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          <ActionIcon className="h-3 w-3 mr-1" />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.userName}
                            </p>
                            <p className="text-xs text-gray-500">{log.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {log.entityType}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {log.entityId}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 font-mono">
                        {log.ipAddress}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(log.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Ver mais
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto animate-fade-in">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detalhes do Registro
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-gray-900 dark:text-white font-mono">{selectedLog.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ação</label>
                <p className="text-gray-900 dark:text-white">{selectedLog.action}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Entidade</label>
                <p className="text-gray-900 dark:text-white">
                  {selectedLog.entityType} ({selectedLog.entityId})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Usuário</label>
                <p className="text-gray-900 dark:text-white">{selectedLog.userName}</p>
                <p className="text-sm text-gray-500">{selectedLog.userEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">IP Address</label>
                <p className="text-gray-900 dark:text-white font-mono">{selectedLog.ipAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User Agent</label>
                <p className="text-gray-900 dark:text-white text-sm break-all">
                  {selectedLog.userAgent}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data/Hora</label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedLog.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Detalhes</label>
                <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="btn-primary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





